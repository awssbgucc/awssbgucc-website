'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, parseForm, type FormState } from '@/lib/admin/forms';
import { moveInList } from '@/lib/admin/order';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteUnused, imageError } from '@/lib/uploads/s3';
import { partnerSchema } from '@/lib/validation/partner';

export async function savePartner(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(partnerSchema, formData);
  if (!parsed.ok) return parsed.state;
  const existing = id ? await db.partner.findUnique({ where: { id }, select: { logoUrl: true } }) : null;
  const logoError = imageError(parsed.data.logoUrl, existing?.logoUrl ?? null, 'partners', id);
  if (logoError) return { errors: { logoUrl: logoError }, values: formValues(formData) };
  const data = { ...parsed.data, updatedBy: admin.email };
  if (id) {
    await db.partner.update({ where: { id }, data });
  } else {
    const last = await db.partner.aggregate({ _max: { order: true } });
    await db.partner.create({ data: { ...data, order: (last._max.order ?? 0) + 1 } });
  }
  await deleteUnused([existing?.logoUrl], [data.logoUrl]);
  redirect('/admin/partners');
}

export async function togglePartner(id: string, status: 'DRAFT' | 'PUBLISHED') {
  const admin = await requireRole();
  await db.partner.update({ where: { id }, data: { status, updatedBy: admin.email } });
  revalidatePath('/admin/partners');
}

export async function movePartner(id: string, direction: 'up' | 'down') {
  const admin = await requireRole();
  const partners = await db.partner.findMany({ orderBy: { order: 'asc' }, select: { id: true } });
  const ids = moveInList(partners.map((p) => p.id), id, direction);
  await db.$transaction(ids.map((partnerId, index) => db.partner.update({ where: { id: partnerId }, data: { order: index + 1, updatedBy: admin.email } })));
  revalidatePath('/admin/partners');
}

export async function deletePartner(id: string) {
  await requireRole();
  const partner = await db.partner.delete({ where: { id } });
  await deleteUnused([partner.logoUrl]);
  redirect('/admin/partners');
}
