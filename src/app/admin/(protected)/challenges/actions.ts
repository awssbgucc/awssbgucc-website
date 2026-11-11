'use server';

import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { audit } from '@/lib/platform/records';
import { challengeSchema } from '@/lib/validation/platform';

export async function saveChallenge(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(challengeSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (parsed.data.eventId && !(await db.event.findUnique({ where: { id: parsed.data.eventId }, select: { id: true } }))) {
    return { errors: { eventId: 'That event was not found.' }, values: formValues(formData) };
  }
  const data = { ...parsed.data, updatedBy: admin.email };
  try {
    if (id) await db.challenge.update({ where: { id }, data });
    else await db.challenge.create({ data });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return { errors: { slug: 'Another challenge already uses this slug.' }, values: formValues(formData) };
  }
  redirect('/admin/challenges');
}

/** Submissions are deleted with the challenge. XP already awarded for approved work stays. */
export async function deleteChallenge(id: string) {
  const admin = await requireRole('ADMIN');
  await db.challenge.delete({ where: { id } });
  await audit(admin.email, 'challenge.delete', 'Challenge', id);
  redirect('/admin/challenges');
}
