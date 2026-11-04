'use server';

import { revalidatePath } from 'next/cache';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { adminChangeError, type Role } from '@/lib/auth-rules';
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

async function checkChange(id: string, nextRole: Role | null) {
  const actor = await requireRole('ADMIN');
  const [target, adminCount] = await Promise.all([db.adminUser.findUniqueOrThrow({ where: { id } }), db.adminUser.count({ where: { role: 'ADMIN' } })]);
  const error = adminChangeError({ actorEmail: actor.email, targetEmail: target.email, targetRole: target.role, nextRole, adminCount });
  return { target, error };
}

export async function setUserRole(id: string, role: Role) {
  const { error } = await checkChange(id, role);
  if (error) throw new Error(error);
  await db.adminUser.update({ where: { id }, data: { role } });
  revalidatePath('/admin/users');
}

export async function removeUser(id: string) {
  const { target, error } = await checkChange(id, null);
  if (error) throw new Error(error);
  // Deleting the sign-in record also ends their sessions.
  await db.$transaction([db.adminUser.delete({ where: { id } }), db.user.deleteMany({ where: { email: target.email } })]);
  revalidatePath('/admin/users');
}
