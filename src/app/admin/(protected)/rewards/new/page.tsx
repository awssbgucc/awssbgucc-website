import type { Metadata } from 'next';
import { RewardForm } from '@/components/admin/RewardForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New reward' };

export default async function NewRewardPage() {
  await requireRole('ADMIN');
  return (
    <>
      <PageHeader title="New reward" />
      <RewardForm />
    </>
  );
}
