import type { Metadata } from 'next';
import { AchievementForm } from '@/components/admin/AchievementForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New achievement' };

export default async function NewAchievementPage() {
  await requireRole('ADMIN');
  return (
    <>
      <PageHeader title="New achievement" />
      <AchievementForm />
    </>
  );
}
