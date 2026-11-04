'use server';

import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { eventSchema } from '@/lib/validation/event';

export async function saveEvent(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(eventSchema, formData);
  if (!parsed.ok) return parsed.state;
  const data = { ...parsed.data, updatedBy: admin.email };
  try {
    if (id) await db.event.update({ where: { id }, data });
    else await db.event.create({ data });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return { errors: { slug: 'Another event already uses this slug. Change it to something else.' }, values: formValues(formData) };
  }
  redirect('/admin/events');
}

export async function deleteEvent(id: string) {
  await requireRole();
  await db.event.delete({ where: { id } });
  redirect('/admin/events');
}
