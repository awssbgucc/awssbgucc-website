import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RewardForm } from '@/components/admin/RewardForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Edit reward' };

type Props = { params: Promise<{ id: string }> };

// Rewards are never deleted once redeemed, so redemption history stays readable. Switch one off instead.
export default async function EditRewardPage({ params }: Props) {
  await requireRole('ADMIN');
  const reward = await db.reward.findUnique({ where: { id: (await params).id } });
  if (!reward) notFound();
  return (
    <>
      <PageHeader title="Edit reward" />
      <RewardForm reward={reward} />
    </>
  );
}
