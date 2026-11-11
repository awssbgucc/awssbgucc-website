'use server';

import { revalidatePath } from 'next/cache';
import { parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { scdFaqSchema, scdSessionSchema, scdSpeakerSchema } from '@/lib/validation/platform';

const done = () => {
  revalidatePath('/admin/scd');
  return { saved: true };
};

async function nextOrder(model: { aggregate: (args: { _max: { order: true } }) => Promise<{ _max: { order: number | null } }> }) {
  return ((await model.aggregate({ _max: { order: true } }))._max.order ?? 0) + 1;
}

export async function addScdSession(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole();
  const parsed = parseForm(scdSessionSchema, formData);
  if (!parsed.ok) return parsed.state;
  await db.scdSession.create({ data: { ...parsed.data, order: await nextOrder(db.scdSession) } });
  return done();
}

export async function addScdSpeaker(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole();
  const parsed = parseForm(scdSpeakerSchema, formData);
  if (!parsed.ok) return parsed.state;
  await db.scdSpeaker.create({ data: { ...parsed.data, order: await nextOrder(db.scdSpeaker) } });
  return done();
}

export async function addScdFaq(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole();
  const parsed = parseForm(scdFaqSchema, formData);
  if (!parsed.ok) return parsed.state;
  await db.scdFaq.create({ data: { ...parsed.data, order: await nextOrder(db.scdFaq) } });
  return done();
}

export async function toggleSpeaker(id: string, status: 'DRAFT' | 'PUBLISHED') {
  await requireRole();
  await db.scdSpeaker.update({ where: { id }, data: { status } });
  revalidatePath('/admin/scd');
}

export async function deleteScdItem(kind: 'session' | 'speaker' | 'faq', id: string) {
  await requireRole();
  if (kind === 'session') await db.scdSession.delete({ where: { id } });
  if (kind === 'speaker') await db.scdSpeaker.delete({ where: { id } });
  if (kind === 'faq') await db.scdFaq.delete({ where: { id } });
  revalidatePath('/admin/scd');
}
