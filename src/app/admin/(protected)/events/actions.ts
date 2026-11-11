'use server';

import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { audit } from '@/lib/platform/records';
import { deleteUnused, imageError } from '@/lib/uploads/s3';
import { eventSchema } from '@/lib/validation/event';

export async function saveEvent(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(eventSchema, formData);
  if (!parsed.ok) return parsed.state;
  const existing = id ? await db.event.findUnique({ where: { id }, select: { coverImage: true } }) : null;
  const coverError = imageError(parsed.data.coverImage, existing?.coverImage ?? null, 'events', id);
  if (coverError) return { errors: { coverImage: coverError }, values: formValues(formData) };
  const data = { ...parsed.data, updatedBy: admin.email };
  try {
    if (id) await db.event.update({ where: { id }, data });
    else await db.event.create({ data });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return { errors: { slug: 'Another event already uses this slug. Change it to something else.' }, values: formValues(formData) };
  }
  await deleteUnused([existing?.coverImage], [data.coverImage]);
  redirect('/admin/events');
}

export async function deleteEvent(id: string) {
  const admin = await requireRole();
  // Check-ins cascade with the event; the XP and credits they gave are taken back in the same transaction.
  const event = await db.$transaction(async (tx) => {
    await tx.ledgerEntry.deleteMany({ where: { reason: 'CHECK_IN', sourceId: id } });
    await audit(admin.email, 'event.delete', 'Event', id, undefined, tx);
    return tx.event.delete({ where: { id } });
  });
  await deleteUnused([event.coverImage, ...event.photos]);
  redirect('/admin/events');
}
