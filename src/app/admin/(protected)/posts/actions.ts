'use server';

import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { postSchema } from '@/lib/validation/post';

export async function savePost(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(postSchema, formData);
  if (!parsed.ok) return parsed.state;
  const existing = id ? await db.post.findUnique({ where: { id }, select: { publishedAt: true } }) : null;
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
  redirect('/admin/posts');
}

export async function deletePost(id: string) {
  await requireRole();
  await db.post.delete({ where: { id } });
  redirect('/admin/posts');
}
