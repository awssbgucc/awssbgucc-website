'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { db } from '@/lib/db';
import { requireMember, requireUser } from '@/lib/member';
import { isKnownKey, ownedKeys, type CustomKind } from '@/lib/platform/customise';
import { audit, withinLimit } from '@/lib/platform/records';
import { makeReferralCode, normaliseCode } from '@/lib/platform/rules';
import { deleteUnused } from '@/lib/uploads/s3';
import { onboardingSchema, PRIVACY_REQUIRED, profileSchema, readInterests } from '@/lib/validation/member';

const MINUTE = 60 * 1000;

/** Keeps the ticked interests on a failed save, since form values hold one value per name. */
function withInterests(state: FormState, formData: FormData): FormState {
  return { ...state, values: { ...(state.values ?? formValues(formData)), interests: readInterests(formData).join('|') } };
}

async function uniqueReferralCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeReferralCode(randomBytes(8));
    if (!(await db.memberProfile.findUnique({ where: { referralCode: code }, select: { userId: true } }))) return code;
  }
  throw new Error('Could not make a referral code');
}

export async function completeOnboarding(_state: FormState, formData: FormData): Promise<FormState> {
  const { user, profile } = await requireUser();
  if (profile?.onboardedAt) redirect('/builder');
  if (!(await withinLimit(`onboarding:${user.id}`, 20, 10 * MINUTE))) return { message: 'Too many attempts. Wait a few minutes and try again.', values: formValues(formData) };

  const parsed = parseForm(onboardingSchema, formData);
  const privacyError = formData.get('acceptPrivacy') === 'on' ? null : PRIVACY_REQUIRED;
  if (!parsed.ok) return withInterests({ ...parsed.state, errors: { ...parsed.state.errors, ...(privacyError ? { acceptPrivacy: privacyError } : {}) } }, formData);
  if (privacyError) return withInterests({ errors: { acceptPrivacy: privacyError } }, formData);
  const { referralCode, ...fields } = parsed.data;

  let referredById: string | null = null;
  if (referralCode) {
    const referrer = await db.memberProfile.findUnique({ where: { referralCode: normaliseCode(referralCode) }, select: { userId: true, status: true } });
    if (!referrer || referrer.status !== 'ACTIVE') return withInterests({ errors: { referralCode: 'That referral code was not found. Check it, or leave it empty.' } }, formData);
    if (referrer.userId === user.id) return withInterests({ errors: { referralCode: 'You cannot use your own code.' } }, formData);
    referredById = referrer.userId;
  }

  const data = { ...fields, interests: readInterests(formData), referredById, privacyAcceptedAt: new Date(), onboardedAt: new Date() };
  try {
    await db.memberProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, referralCode: await uniqueReferralCode(), ...data },
      update: data,
    });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return withInterests({ errors: { handle: 'That handle is taken. Choose another.' } }, formData);
  }
  await db.notification.create({ data: { userId: user.id, title: 'Welcome to the builder portal', body: 'Check in at your next session to start your record.', href: '/builder/sessions' } });
  redirect('/builder');
}

export async function saveProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireMember();
  const parsed = parseForm(profileSchema, formData);
  if (!parsed.ok) return withInterests(parsed.state, formData);
  try {
    await db.memberProfile.update({ where: { userId: user.id }, data: { ...parsed.data, interests: readInterests(formData) } });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return withInterests({ errors: { handle: 'That handle is taken. Choose another.' } }, formData);
  }
  revalidatePath('/builder', 'layout');
  return { saved: true };
}

const FIELDS: Record<CustomKind, 'bannerKey' | 'accentKey' | 'frameKey' | 'titleKey'> = { BANNER: 'bannerKey', ACCENT: 'accentKey', FRAME: 'frameKey', TITLE: 'titleKey' };

/** Applies a customisation the member owns. The server checks ownership; the form only offers owned options. */
export async function applyCustomisation(kind: CustomKind, key: string) {
  const { user } = await requireMember();
  if (!(kind in FIELDS)) return;
  if (kind === 'TITLE' && key === '') {
    await db.memberProfile.update({ where: { userId: user.id }, data: { titleKey: null } });
  } else {
    if (!isKnownKey(kind, key)) return;
    const owned = await db.redemption.findMany({ where: { userId: user.id, status: 'FULFILLED' }, select: { reward: { select: { kind: true, value: true } } } });
    if (!ownedKeys(kind, owned.map((r) => r.reward)).has(key)) return;
    await db.memberProfile.update({ where: { userId: user.id }, data: { [FIELDS[kind]]: key } });
  }
  revalidatePath('/builder', 'layout');
}

export async function requestPrivacy(_state: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireMember();
  const kind = String(formData.get('kind'));
  const details = String(formData.get('details') ?? '').trim().slice(0, 1000) || null;
  if (kind !== 'CORRECTION' && kind !== 'OTHER') return { message: 'Choose what you need.' };
  if (!(await withinLimit(`privacy:${user.id}`, 5, 24 * 60 * MINUTE))) return { message: 'You have sent several requests today. The team will reply to those first.' };
  await db.privacyRequest.create({ data: { userId: user.id, email: user.email, kind, details } });
  return { saved: true };
}

/** Deletes the account and everything linked to it. The confirmation must match the handle. */
export async function deleteAccount(_state: FormState, formData: FormData): Promise<FormState> {
  const { user, profile } = await requireMember();
  if (String(formData.get('confirm') ?? '').trim().toLowerCase() !== profile.handle) {
    return { errors: { confirm: `Type ${profile.handle} to confirm.` } };
  }
  // The cascade removes the project rows; their uploaded images are removed from S3 after the transaction.
  const images = await db.project.findMany({ where: { ownerId: user.id, imageUrl: { not: null } }, select: { imageUrl: true } });
  await db.$transaction(async (tx) => {
    await tx.privacyRequest.create({ data: { userId: user.id, email: user.email, kind: 'DELETE', details: 'Deleted by the member from their profile.', status: 'DONE', handledBy: 'self-service', handledAt: new Date() } });
    await audit('self-service', 'member.delete', 'User', user.id, undefined, tx);
    // Cascades to the profile, sessions, check-ins, ledger, submissions, projects, redemptions and notifications.
    await tx.user.delete({ where: { id: user.id } });
  });
  await deleteUnused(images.map((project) => project.imageUrl));
  redirect('/sign-in');
}
