'use server';

import { revalidatePath } from 'next/cache';
import { formValues, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { settingsSchema } from '@/lib/validation/settings';

export async function saveSettings(_state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole('ADMIN');
  const parsed = parseForm(settingsSchema, formData);
  if (!parsed.ok) return parsed.state;
  await db.siteSettings.update({ where: { id: 1 }, data: { ...parsed.data, updatedBy: admin.email } });
  revalidatePath('/admin/settings');
  return { saved: true, values: formValues(formData) };
}
