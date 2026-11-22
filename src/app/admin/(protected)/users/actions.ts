'use server';

import { revalidatePath } from 'next/cache';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { changeAccess } from '@/lib/admin/users';
import { requireRole } from '@/lib/auth';
import { isRole, type Role } from '@/lib/auth-rules';
import { db } from '@/lib/db';
import { userSchema } from '@/lib/validation/user';

export async function addUser(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole('ADMIN');
  const parsed = parseForm(userSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    await db.adminUser.create({ data: parsed.data });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return { errors: { email: 'This email already has access.' }, values: formValues(formData) };
  }
  revalidatePath('/admin/users');
  return { saved: true };
}

export async function setUserRole(id: string, role: Role) {
  const actor = await requireRole('ADMIN');
  // Bound arguments come back from the browser, so the role is checked here too.
  if (!isRole(role)) throw new Error('Unknown role.');
  await changeAccess(actor.email, id, role);
  revalidatePath('/admin/users');
}

/**
 * Takes away dashboard access only. The role guard reads AdminUser on every request, so access ends at once.
 * Their member account, attendance and awards stay: core team members are members too.
 */
export async function removeUser(id: string) {
  const actor = await requireRole('ADMIN');
  await changeAccess(actor.email, id, null);
  revalidatePath('/admin/users');
}
