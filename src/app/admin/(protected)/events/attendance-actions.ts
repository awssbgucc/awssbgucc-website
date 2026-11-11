'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { formValues, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { normaliseEmail } from '@/lib/auth-rules';
import { db } from '@/lib/db';
import { checkInByEditor, removeCheckIn, RuleError } from '@/lib/platform/engine';
import { audit } from '@/lib/platform/records';
import { defaultCheckInWindow, makeCode } from '@/lib/platform/rules';
import { isOwnUpload, MAX_EVENT_PHOTOS as MAX_PHOTOS } from '@/lib/uploads/rules';
import { deleteUnused, publicBaseUrl } from '@/lib/uploads/s3';
import { checkInWindowSchema, resourceSchema } from '@/lib/validation/platform';

const path = (eventId: string) => `/admin/events/${eventId}/attendance`;

export async function openCheckIn(eventId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return { message: 'Event not found.' };
  if (event.status !== 'PUBLISHED') return { message: 'Publish the event before opening check-in.' };
  const parsed = parseForm(checkInWindowSchema, formData);
  if (!parsed.ok) return parsed.state;
  await db.event.update({
    where: { id: eventId },
    data: { checkInCode: event.checkInCode ?? makeCode(randomBytes(6)), checkInOpensAt: parsed.data.opensAt, checkInClosesAt: parsed.data.closesAt, updatedBy: admin.email },
  });
  await audit(admin.email, 'checkin.window', 'Event', eventId, `${parsed.data.opensAt.toISOString()} to ${parsed.data.closesAt.toISOString()}`);
  revalidatePath(path(eventId));
  return { saved: true };
}

/** Opens check-in now, with the default window, in one click at the venue. */
export async function openCheckInNow(eventId: string) {
  const admin = await requireRole();
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event || event.status !== 'PUBLISHED') return;
  const window = defaultCheckInWindow(event.startsAt, event.endsAt);
  const now = new Date();
  await db.event.update({
    where: { id: eventId },
    data: { checkInCode: event.checkInCode ?? makeCode(randomBytes(6)), checkInOpensAt: now < window.opensAt ? now : window.opensAt, checkInClosesAt: window.closesAt > now ? window.closesAt : new Date(now.getTime() + 60 * 60 * 1000), updatedBy: admin.email },
  });
  await audit(admin.email, 'checkin.open', 'Event', eventId);
  revalidatePath(path(eventId));
}

export async function closeCheckIn(eventId: string) {
  const admin = await requireRole();
  await db.event.update({ where: { id: eventId }, data: { checkInClosesAt: new Date(), updatedBy: admin.email } });
  await audit(admin.email, 'checkin.close', 'Event', eventId);
  revalidatePath(path(eventId));
}

/** A new code, for when the old one was shared outside the room. */
export async function newCheckInCode(eventId: string) {
  const admin = await requireRole();
  await db.event.update({ where: { id: eventId }, data: { checkInCode: makeCode(randomBytes(6)), updatedBy: admin.email } });
  await audit(admin.email, 'checkin.new-code', 'Event', eventId);
  revalidatePath(path(eventId));
}

export async function addAttendee(eventId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const who = String(formData.get('who') ?? '').trim();
  if (!who) return { errors: { who: 'Enter a handle or an email address.' } };
  const profile = who.includes('@')
    ? await db.memberProfile.findFirst({ where: { user: { email: normaliseEmail(who) } } })
    : await db.memberProfile.findUnique({ where: { handle: who.replace(/^@/, '').toLowerCase() } });
  if (!profile) return { errors: { who: 'No member has that handle or email. They need to sign in to the portal once first.' }, values: formValues(formData) };
  try {
    const result = await checkInByEditor(eventId, profile.userId, admin.email);
    revalidatePath(path(eventId));
    return result.status === 'duplicate' ? { message: `${profile.displayName} is already checked in.` } : { saved: true };
  } catch (error) {
    if (error instanceof RuleError) return { message: error.message };
    throw error;
  }
}

export async function removeAttendee(eventId: string, userId: string) {
  const admin = await requireRole();
  await removeCheckIn(eventId, userId, admin.email);
  revalidatePath(path(eventId));
}

/** Copies the check-in count into the public attendance figure. */
export async function useCheckInCount(eventId: string) {
  const admin = await requireRole();
  const count = await db.checkIn.count({ where: { eventId } });
  await db.event.update({ where: { id: eventId }, data: { attendance: count, updatedBy: admin.email } });
  await audit(admin.email, 'event.attendance', 'Event', eventId, `${count} from check-ins`);
  revalidatePath(path(eventId));
}

/* Materials */

export async function addResource(eventId: string, _state: FormState, formData: FormData): Promise<FormState> {
  await requireRole();
  const parsed = parseForm(resourceSchema, formData);
  if (!parsed.ok) return parsed.state;
  const last = await db.eventResource.aggregate({ where: { eventId }, _max: { order: true } });
  await db.eventResource.create({ data: { ...parsed.data, eventId, order: (last._max.order ?? 0) + 1 } });
  revalidatePath(`/admin/events/${eventId}`);
  return { saved: true };
}

export async function deleteResource(eventId: string, resourceId: string) {
  await requireRole();
  await db.eventResource.deleteMany({ where: { id: resourceId, eventId } });
  revalidatePath(`/admin/events/${eventId}`);
}

/* Photos */

export async function saveEventPhotos(eventId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const event = await db.event.findUnique({ where: { id: eventId }, select: { photos: true } });
  if (!event) return { message: 'Event not found.' };
  const base = publicBaseUrl();
  const photos = [...new Set(formData.getAll('photos').filter((value): value is string => typeof value === 'string' && value !== ''))];
  if (photos.length > MAX_PHOTOS) return { message: `Keep the gallery to ${MAX_PHOTOS} photos.` };
  // Keep photos already saved; accept new ones only from our bucket, under this event.
  const invalid = photos.filter((url) => !event.photos.includes(url) && !(base && isOwnUpload(url, base, 'events', eventId)));
  if (invalid.length) return { message: 'Upload the photos again.' };
  await db.event.update({ where: { id: eventId }, data: { photos, updatedBy: admin.email } });
  await deleteUnused(event.photos, photos);
  revalidatePath(`/admin/events/${eventId}`);
  return { saved: true };
}
