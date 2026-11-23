'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseForm, type FormState } from '@/lib/admin/forms';
import { moveInList } from '@/lib/admin/order';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { certificationSchema } from '@/lib/validation/certification';

export async function saveCertification(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(certificationSchema, formData);
  if (!parsed.ok) return parsed.state;
  const data = { ...parsed.data, updatedBy: admin.email };
  if (id) {
    await db.memberCertification.update({ where: { id }, data });
  } else {
    const last = await db.memberCertification.aggregate({ _max: { order: true } });
    await db.memberCertification.create({ data: { ...data, order: (last._max.order ?? 0) + 1 } });
  }
  revalidatePath('/certifications');
  redirect('/admin/certifications');
}

export async function toggleCertification(id: string, status: 'DRAFT' | 'PUBLISHED') {
  const admin = await requireRole();
  await db.memberCertification.update({ where: { id }, data: { status, updatedBy: admin.email } });
  revalidatePath('/admin/certifications');
  revalidatePath('/certifications');
}

export async function moveCertification(id: string, direction: 'up' | 'down') {
  const admin = await requireRole();
  const items = await db.memberCertification.findMany({ orderBy: { order: 'asc' }, select: { id: true } });
  const ids = moveInList(items.map((item) => item.id), id, direction);
  await db.$transaction(
    ids.map((certId, index) => db.memberCertification.update({ where: { id: certId }, data: { order: index + 1, updatedBy: admin.email } })),
  );
  revalidatePath('/admin/certifications');
  revalidatePath('/certifications');
}

export async function deleteCertification(id: string) {
  await requireRole();
  await db.memberCertification.delete({ where: { id } });
  revalidatePath('/certifications');
  redirect('/admin/certifications');
}
