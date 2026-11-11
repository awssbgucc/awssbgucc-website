import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AchievementForm } from '@/components/admin/AchievementForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Edit achievement' };

type Props = { params: Promise<{ id: string }> };

// Achievements are switched off rather than deleted, so members keep what they earned.
export default async function EditAchievementPage({ params }: Props) {
  await requireRole('ADMIN');
  const achievement = await db.achievement.findUnique({ where: { id: (await params).id } });
  if (!achievement) notFound();
  return (
    <>
      <PageHeader title="Edit achievement" />
      <AchievementForm achievement={achievement} />
    </>
  );
}
