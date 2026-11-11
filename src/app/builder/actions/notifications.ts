'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireMember } from '@/lib/member';

export async function markAllRead() {
  const { user } = await requireMember();
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath('/builder', 'layout');
}
