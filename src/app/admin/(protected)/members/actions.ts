'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { adjustBalance, RuleError } from '@/lib/platform/engine';
import { audit, notify } from '@/lib/platform/records';
import { deleteUnused } from '@/lib/uploads/s3';
import { adjustSchema } from '@/lib/validation/platform';

export async function setMemberStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
  const admin = await requireRole('ADMIN');
  await db.$transaction(async (tx) => {
    await tx.memberProfile.update({ where: { userId }, data: { status } });
    // Suspension ends every session at once; requireMember() also refuses a suspended profile.
    if (status === 'SUSPENDED') await tx.session.deleteMany({ where: { userId } });
    await audit(admin.email, `member.${status === 'SUSPENDED' ? 'suspend' : 'reactivate'}`, 'MemberProfile', userId, undefined, tx);
  });
  revalidatePath(`/admin/members/${userId}`);
}

export async function adjustMember(userId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole('ADMIN');
  const parsed = parseForm(adjustSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    await adjustBalance(userId, parsed.data.xp, parsed.data.credits, parsed.data.note, admin.email);
  } catch (error) {
    if (error instanceof RuleError) return { message: error.message };
    throw error;
  }
  revalidatePath(`/admin/members/${userId}`);
  return { saved: true };
}

export async function deleteMember(userId: string) {
  const admin = await requireRole('ADMIN');
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/admin/members');
  // Admin accounts are removed from Admin users first, so the last admin cannot be deleted from here.
  if (await db.adminUser.findUnique({ where: { email: user.email } })) redirect(`/admin/members/${userId}?error=admin`);
  // The cascade removes the project rows; their uploaded images are removed from S3 after the transaction.
  const images = await db.project.findMany({ where: { ownerId: userId, imageUrl: { not: null } }, select: { imageUrl: true } });
  await db.$transaction(async (tx) => {
    await tx.privacyRequest.create({ data: { userId, email: user.email, kind: 'DELETE', details: 'Account deleted by an admin.', status: 'DONE', handledBy: admin.email, handledAt: new Date() } });
    await audit(admin.email, 'member.delete', 'User', userId, undefined, tx);
    await tx.user.delete({ where: { id: userId } });
  });
  await deleteUnused(images.map((project) => project.imageUrl));
  redirect('/admin/members');
}

export async function messageMember(userId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const title = String(formData.get('title') ?? '').trim().slice(0, 120);
  if (!title) return { errors: { title: 'Write a short message.' } };
  await notify(userId, title, { body: `From ${admin.name ?? 'the core team'}` });
  await audit(admin.email, 'member.message', 'MemberProfile', userId, title);
  return { saved: true };
}
