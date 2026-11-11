'use server';

import { redirect } from 'next/navigation';
import { parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { announcementSchema } from '@/lib/validation/platform';

export async function saveAnnouncement(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(announcementSchema, formData);
  if (!parsed.ok) return parsed.state;
  const existing = id ? await db.announcement.findUnique({ where: { id } }) : null;
  // The publish date is set the first time it goes out, and kept after that.
  const publishedAt = parsed.data.status === 'PUBLISHED' ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null;
  const data = { ...parsed.data, publishedAt, updatedBy: admin.email };
  if (existing) await db.announcement.update({ where: { id: existing.id }, data });
  else await db.announcement.create({ data });
  redirect('/admin/announcements');
}

export async function deleteAnnouncement(id: string) {
  await requireRole();
  await db.announcement.delete({ where: { id } });
  redirect('/admin/announcements');
}
