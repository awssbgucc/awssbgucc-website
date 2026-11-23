'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { getSiteSettings } from '@/lib/content/queries';
import { db } from '@/lib/db';
import { buildCampaignEmail, isResendConfigured, sendNewsletterEmail } from '@/lib/email/newsletter';
import { errorMessage, logError } from '@/lib/log';
import { audit } from '@/lib/platform/records';
import { SITE_URL } from '@/lib/site';
import { adminSubscriberSchema, newsletterCampaignSchema } from '@/lib/validation/newsletter';

export type CampaignSendState = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export async function addSubscriber(_state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(adminSubscriberSchema, formData);
  if (!parsed.ok) return parsed.state;

  const existing = await db.newsletterSubscriber.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { errors: { email: 'This email is already on the subscriber list.' }, values: formValues(formData) };
  }

  const created = await db.newsletterSubscriber.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      status: parsed.data.status,
      source: 'admin',
      unsubscribedAt: parsed.data.status === 'UNSUBSCRIBED' ? new Date() : null,
    },
  });
  await audit(admin.email, 'newsletter.subscriber_add', 'NewsletterSubscriber', created.id, created.email);
  revalidatePath('/admin/newsletter');
  return { saved: true };
}

export async function toggleSubscriberStatus(id: string, nextStatus: 'SUBSCRIBED' | 'UNSUBSCRIBED') {
  const admin = await requireRole();
  const subscriber = await db.newsletterSubscriber.update({
    where: { id },
    data: {
      status: nextStatus,
      unsubscribedAt: nextStatus === 'UNSUBSCRIBED' ? new Date() : null,
      ...(nextStatus === 'SUBSCRIBED' ? { subscribedAt: new Date() } : {}),
    },
  });
  await audit(admin.email, 'newsletter.subscriber_status', 'NewsletterSubscriber', id, `${subscriber.email} -> ${nextStatus}`);
  revalidatePath('/admin/newsletter');
}

export async function deleteSubscriber(id: string) {
  const admin = await requireRole();
  const removed = await db.newsletterSubscriber.delete({ where: { id } });
  await audit(admin.email, 'newsletter.subscriber_delete', 'NewsletterSubscriber', id, removed.email);
  revalidatePath('/admin/newsletter');
}

export async function saveCampaign(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(newsletterCampaignSchema, formData);
  if (!parsed.ok) return parsed.state;

  if (id) {
    const existing = await db.newsletterCampaign.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return { message: 'Campaign not found.', values: formValues(formData) };
    if (existing.status === 'SENT') return { message: 'Sent campaigns cannot be edited.', values: formValues(formData) };
    await db.newsletterCampaign.update({ where: { id }, data: { ...parsed.data, updatedBy: admin.email } });
    revalidatePath('/admin/newsletter');
    redirect(`/admin/newsletter/campaigns/${id}`);
  }

  const created = await db.newsletterCampaign.create({
    data: { ...parsed.data, updatedBy: admin.email },
  });
  revalidatePath('/admin/newsletter');
  redirect(`/admin/newsletter/campaigns/${created.id}`);
}

export async function deleteCampaign(id: string) {
  const admin = await requireRole();
  const removed = await db.newsletterCampaign.delete({ where: { id } });
  await audit(admin.email, 'newsletter.campaign_delete', 'NewsletterCampaign', id, removed.subject);
  revalidatePath('/admin/newsletter');
  redirect('/admin/newsletter?tab=campaigns');
}

export async function sendTestCampaign(id: string): Promise<CampaignSendState> {
  const admin = await requireRole();
  if (!isResendConfigured()) {
    return { error: 'Resend is not configured yet. Add RESEND_API_KEY in your environment variables to send email.' };
  }

  const [campaign, settings] = await Promise.all([
    db.newsletterCampaign.findUnique({ where: { id } }),
    getSiteSettings().catch(() => null),
  ]);
  if (!campaign) return { error: 'Campaign not found.' };

  try {
    const payload = buildCampaignEmail({
      email: admin.email,
      subscriberName: admin.name ?? 'Team',
      subject: `[Test] ${campaign.subject}`,
      previewText: campaign.previewText,
      body: campaign.body,
      unsubscribeUrl: `${SITE_URL}/newsletter/unsubscribe`,
      siteUrl: SITE_URL,
      replyTo: settings?.email,
    });
    const result = await sendNewsletterEmail(payload);
    if (!result.ok) {
      logError('newsletter_test_send_failed', { status: result.status, detail: result.detail });
      return { error: 'Resend could not deliver the test email. Check RESEND_API_KEY and CONTACT_FROM_EMAIL.' };
    }
    return { ok: true, message: `Sent a test email to ${admin.email}.` };
  } catch (error) {
    logError('newsletter_test_send_error', { message: errorMessage(error) });
    return { error: 'Network error while sending the test email.' };
  }
}

export async function sendCampaign(id: string): Promise<CampaignSendState> {
  const admin = await requireRole();
  if (!isResendConfigured()) {
    return { error: 'Resend is not configured yet. Add RESEND_API_KEY in your environment variables before broadcasting.' };
  }

  const [campaign, subscribers, settings] = await Promise.all([
    db.newsletterCampaign.findUnique({ where: { id } }),
    db.newsletterSubscriber.findMany({
      where: { status: 'SUBSCRIBED' },
      select: { email: true, name: true, unsubscribeToken: true },
    }),
    getSiteSettings().catch(() => null),
  ]);

  if (!campaign) return { error: 'Campaign not found.' };
  if (campaign.status === 'SENT') return { error: 'This campaign has already been sent.' };
  if (subscribers.length === 0) return { error: 'There are no active subscribers yet.' };

  let sent = 0;
  let failed = 0;
  const BATCH_SIZE = 5;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (sub) => {
        try {
          const unsubscribeUrl = `${SITE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(sub.unsubscribeToken)}`;
          const payload = buildCampaignEmail({
            email: sub.email,
            subscriberName: sub.name,
            subject: campaign.subject,
            previewText: campaign.previewText,
            body: campaign.body,
            unsubscribeUrl,
            siteUrl: SITE_URL,
            replyTo: settings?.email,
          });
          return await sendNewsletterEmail(payload);
        } catch (error) {
          logError('newsletter_send_item_error', { message: errorMessage(error) });
          return { ok: false as const, code: 'DELIVERY_FAILED' as const };
        }
      }),
    );
    for (const r of results) {
      if (r.ok) sent += 1;
      else failed += 1;
    }
  }

  if (sent === 0) {
    return { error: 'No emails could be delivered. Check your Resend API key and verified sender domain.' };
  }

  await db.newsletterCampaign.update({
    where: { id },
    data: {
      status: 'SENT',
      sentCount: sent,
      sentAt: new Date(),
      sentBy: admin.email,
      updatedBy: admin.email,
    },
  });
  await audit(admin.email, 'newsletter.send', 'NewsletterCampaign', id, `Sent to ${sent} of ${subscribers.length} subscribers`);
  revalidatePath('/admin/newsletter');
  revalidatePath(`/admin/newsletter/campaigns/${id}`);

  if (failed > 0) {
    return { ok: true, message: `Sent to ${sent} subscribers (${failed} failed).` };
  }
  return { ok: true, message: `Sent cleanly to ${sent} active subscribers.` };
}
