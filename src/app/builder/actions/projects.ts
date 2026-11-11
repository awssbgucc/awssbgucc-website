'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, parseForm, type FormState } from '@/lib/admin/forms';
import { db } from '@/lib/db';
import { requireMember } from '@/lib/member';
import { withinLimit } from '@/lib/platform/records';
import { slugify } from '@/lib/slug';
import { deleteUnused, imageError } from '@/lib/uploads/s3';
import { memberProjectSchema } from '@/lib/validation/project';

async function ownProject(id: string, userId: string) {
  return db.project.findFirst({ where: { id, ownerId: userId } });
}

export async function saveMemberProject(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireMember();
  const parsed = parseForm(memberProjectSchema, formData);
  if (!parsed.ok) return parsed.state;
  const existing = id ? await ownProject(id, user.id) : null;
  if (id && !existing) return { message: 'This project was not found.' };
  const imageProblem = imageError(parsed.data.imageUrl, existing?.imageUrl ?? null, 'projects', id);
  if (imageProblem) return { errors: { imageUrl: imageProblem }, values: formValues(formData) };

  if (!existing) {
    if (!(await withinLimit(`project-new:${user.id}`, 10, 24 * 60 * 60 * 1000))) return { message: 'You have started several projects today. Try again tomorrow.' };
    const slug = `${slugify(parsed.data.title).slice(0, 60)}-${randomBytes(3).toString('hex')}`;
    const project = await db.project.create({ data: { ...parsed.data, slug, ownerId: user.id, status: 'DRAFT' } });
    redirect(`/builder/projects/${project.id}`);
  }
  // Editing an approved project sends it back for review, so nothing unreviewed is public.
  const status = existing.status === 'APPROVED' ? 'PENDING' : existing.status;
  await db.project.update({ where: { id: existing.id }, data: { ...parsed.data, status } });
  await deleteUnused([existing.imageUrl], [parsed.data.imageUrl]);
  revalidatePath(`/builder/projects/${existing.id}`);
  return { saved: true };
}

export async function submitProjectForReview(id: string) {
  const { user } = await requireMember();
  const project = await ownProject(id, user.id);
  // An image is required before review, because public project cards always show one.
  if (!project || !project.imageUrl || (project.status !== 'DRAFT' && project.status !== 'REJECTED')) return;
  await db.project.update({ where: { id }, data: { status: 'PENDING' } });
  revalidatePath(`/builder/projects/${id}`);
}

export async function deleteMemberProject(id: string) {
  const { user } = await requireMember();
  const project = await ownProject(id, user.id);
  if (!project) return;
  await db.project.delete({ where: { id } });
  await deleteUnused([project.imageUrl]);
  redirect('/builder/projects');
}
