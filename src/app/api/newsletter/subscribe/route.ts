import { NextResponse } from 'next/server';
import { recordServerAnalyticsEvent } from '@/lib/analytics';
import { getSiteSettings } from '@/lib/content/queries';
import { buildWelcomeEmail, isResendConfigured, sendNewsletterEmail } from '@/lib/email/newsletter';
import { clientIp, readBodyUpTo } from '@/lib/http';
import { errorMessage, logError } from '@/lib/log';
import { db } from '@/lib/db';
import { withinLimit } from '@/lib/platform/records';
import { SITE_URL } from '@/lib/site';
import { subscribeSchema } from '@/lib/validation/newsletter';

const BODY_LIMIT = 8_000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 10;

export async function POST(request: Request) {
  const text = await readBodyUpTo(request, BODY_LIMIT);
  if (text === null) {
    return NextResponse.json({ ok: false, message: 'Request payload is too large.' }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request format.' }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'email');
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors, message: errors.email ?? 'Check the highlighted fields and try again.' }, { status: 400 });
  }

  // Silently accept honeypot submissions so automated bots stop retrying.
  if (parsed.data.website.trim().length > 0) {
    return NextResponse.json({ ok: true, message: 'You are subscribed to AWS SBG UCC updates.' });
  }

  try {
    const allowed = await withinLimit(`newsletter:${clientIp(request)}`, RATE_MAX, RATE_WINDOW_MS);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: 'Too many subscription attempts. Wait a few minutes and try again.' },
        { status: 429 },
      );
    }
  } catch (error) {
    logError('newsletter_rate_limit_error', { message: errorMessage(error) });
  }

  const { email, name, source } = parsed.data;
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });

  if (existing && existing.status === 'SUBSCRIBED') {
    if (name && !existing.name) {
      await db.newsletterSubscriber.update({ where: { id: existing.id }, data: { name } });
    }
    return NextResponse.json({
      ok: true,
      alreadySubscribed: true,
      message: 'You are already subscribed to AWS SBG UCC updates.',
    });
  }

  const now = new Date();
  const subscriber = existing
    ? await db.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          status: 'SUBSCRIBED',
          unsubscribedAt: null,
          subscribedAt: now,
          source,
          ...(name ? { name } : {}),
        },
      })
    : await db.newsletterSubscriber.create({
        data: { email, name, source, status: 'SUBSCRIBED' },
      });

  if (isResendConfigured()) {
    try {
      const settings = await getSiteSettings().catch(() => null);
      const origin = request.headers.get('origin')?.startsWith('http') ? request.headers.get('origin')! : SITE_URL;
      const unsubscribeUrl = `${origin}/newsletter/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
      const emailPayload = buildWelcomeEmail({
        email: subscriber.email,
        name: subscriber.name,
        unsubscribeUrl,
        siteUrl: origin,
        replyTo: settings?.email,
      });
      await sendNewsletterEmail(emailPayload);
    } catch (error) {
      logError('newsletter_welcome_failed', { message: errorMessage(error) });
    }
  }

  await recordServerAnalyticsEvent({
    eventType: 'newsletter_subscribe',
    path: `/${source === 'home' || source === 'site' ? '' : source}`,
    label: `Newsletter (${source})`,
    request,
  });

  return NextResponse.json({
    ok: true,
    alreadySubscribed: false,
    message: 'You are subscribed. We will email you about upcoming sessions, bootcamps and community recaps.',
  });
}
