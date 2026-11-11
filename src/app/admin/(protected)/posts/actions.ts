'use server';

import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteUnused, imageError } from '@/lib/uploads/s3';
import { postSchema } from '@/lib/validation/post';

export async function savePost(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(postSchema, formData);
  if (!parsed.ok) return parsed.state;
  const existing = id ? await db.post.findUnique({ where: { id }, select: { publishedAt: true, coverImage: true } }) : null;
  const coverError = imageError(parsed.data.coverImage, existing?.coverImage ?? null, 'posts', id);
  if (coverError) return { errors: { coverImage: coverError }, values: formValues(formData) };
  // The date is set on first publish and kept after that, so an edit does not move a post up the list.
  const publishedAt = existing?.publishedAt ?? (parsed.data.status === 'PUBLISHED' ? new Date() : null);
  const data = { ...parsed.data, publishedAt, updatedBy: admin.email };
  try {
    if (id) await db.post.update({ where: { id }, data });
    else await db.post.create({ data });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return { errors: { slug: 'Another post already uses this slug. Change it to something else.' }, values: formValues(formData) };
  }
  await deleteUnused([existing?.coverImage], [data.coverImage]);
  redirect('/admin/posts');
}

export async function deletePost(id: string) {
  await requireRole();
  const post = await db.post.delete({ where: { id } });
  await deleteUnused([post.coverImage]);
  redirect('/admin/posts');
}
