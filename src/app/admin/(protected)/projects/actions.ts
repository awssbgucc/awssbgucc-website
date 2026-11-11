'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviewProject, RuleError } from '@/lib/platform/engine';
import { audit } from '@/lib/platform/records';
import { deleteUnused, imageError } from '@/lib/uploads/s3';
import { adminProjectSchema } from '@/lib/validation/project';
import { resolveSlug } from '@/lib/validation/shared';

/**
 * Curated projects (no owner) are edited directly. A member's project changes status only through
 * a review, so the member is notified and the award is paid once.
 */
export async function saveAdminProject(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(adminProjectSchema, formData);
  if (!parsed.ok) return parsed.state;
  const existing = id ? await db.project.findUnique({ where: { id } }) : null;
  const imageProblem = imageError(parsed.data.imageUrl, existing?.imageUrl ?? null, 'projects', id);
  if (imageProblem) return { errors: { imageUrl: imageProblem }, values: formValues(formData) };
  const { status, ...fields } = parsed.data;
  if (status === 'APPROVED' && !fields.imageUrl) return { errors: { imageUrl: 'Add an image before approving. Public project cards always show one.' }, values: formValues(formData) };
  const data = { ...fields, slug: resolveSlug(fields.slug, fields.title) };
  try {
    if (!existing) {
      const project = await db.project.create({ data: { ...data, status: status === 'APPROVED' ? 'DRAFT' : status } });
      redirect(`/admin/projects/${project.id}`);
    }
    const memberOwned = !!existing.ownerId;
    await db.project.update({ where: { id: existing.id }, data: { ...data, ...(memberOwned ? {} : { status, reviewedBy: admin.email, reviewedAt: new Date() }) } });
    if (memberOwned && status !== existing.status && (status === 'APPROVED' || status === 'REJECTED')) {
      await reviewProject(existing.id, status, String(formData.get('reviewNote') ?? '').trim() || null, admin.email);
    }
  } catch (error) {
    if (error instanceof RuleError) return { message: error.message };
    if (!isUniqueError(error)) throw error;
    return { errors: { slug: 'Another project already uses this slug.' }, values: formValues(formData) };
  }
  await deleteUnused([existing.imageUrl], [data.imageUrl]);
  revalidatePath(`/admin/projects/${existing.id}`);
  return { saved: true };
}

export async function deleteAdminProject(id: string) {
  const admin = await requireRole('ADMIN');
  const project = await db.project.delete({ where: { id } });
  await audit(admin.email, 'project.delete', 'Project', id);
  await deleteUnused([project.imageUrl]);
  redirect('/admin/projects');
}
