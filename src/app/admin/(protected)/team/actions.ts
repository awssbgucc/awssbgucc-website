'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, parseForm, type FormState } from '@/lib/admin/forms';
import { moveInList } from '@/lib/admin/order';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteUnused, imageError } from '@/lib/uploads/s3';
import { teamSchema } from '@/lib/validation/team';

export async function saveMember(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(teamSchema, formData);
  if (!parsed.ok) return parsed.state;
  const existing = id ? await db.teamMember.findUnique({ where: { id }, select: { photoUrl: true } }) : null;
  const photoError = imageError(parsed.data.photoUrl, existing?.photoUrl ?? null, 'team', id);
  if (photoError) return { errors: { photoUrl: photoError }, values: formValues(formData) };
  const data = { ...parsed.data, updatedBy: admin.email };
  if (id) {
    await db.teamMember.update({ where: { id }, data });
  } else {
    const last = await db.teamMember.aggregate({ _max: { order: true } });
    await db.teamMember.create({ data: { ...data, order: (last._max.order ?? 0) + 1 } });
  }
  await deleteUnused([existing?.photoUrl], [data.photoUrl]);
  redirect('/admin/team');
}

export async function toggleMember(id: string, active: boolean) {
  const admin = await requireRole();
  await db.teamMember.update({ where: { id }, data: { active, updatedBy: admin.email } });
  revalidatePath('/admin/team');
}

export async function moveMember(id: string, direction: 'up' | 'down') {
  const admin = await requireRole();
  const members = await db.teamMember.findMany({ orderBy: { order: 'asc' }, select: { id: true } });
  const ids = moveInList(members.map((m) => m.id), id, direction);
  await db.$transaction(ids.map((memberId, index) => db.teamMember.update({ where: { id: memberId }, data: { order: index + 1, updatedBy: admin.email } })));
  revalidatePath('/admin/team');
}

export async function deleteMember(id: string) {
  await requireRole();
  const member = await db.teamMember.delete({ where: { id } });
  await deleteUnused([member.photoUrl]);
  redirect('/admin/team');
}
