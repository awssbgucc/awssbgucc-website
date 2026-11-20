'use server';

import { revalidatePath } from 'next/cache';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { adminChangeError, isRole, type Role } from '@/lib/auth-rules';
import { db } from '@/lib/db';
import { audit } from '@/lib/platform/records';
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
  return { actor, target, error };
}

export async function setUserRole(id: string, role: Role) {
  const { actor, target, error } = await checkChange(id, role);
  // Bound arguments come back from the browser, so the role is checked here too.
  if (!isRole(role)) throw new Error('Unknown role.');
  if (error) throw new Error(error);
  await db.$transaction([db.adminUser.update({ where: { id }, data: { role } }), audit(actor.email, 'admin.role', 'AdminUser', id, `${target.email}: ${target.role} to ${role}`)]);
  revalidatePath('/admin/users');
}

/**
 * Takes away dashboard access only. The role guard reads AdminUser on every request, so access ends at once.
 * Their member account, attendance and awards stay: core team members are members too.
 */
export async function removeUser(id: string) {
  const { actor, target, error } = await checkChange(id, null);
  if (error) throw new Error(error);
  await db.$transaction([db.adminUser.delete({ where: { id } }), audit(actor.email, 'admin.remove', 'AdminUser', id, target.email)]);
  revalidatePath('/admin/users');
}
