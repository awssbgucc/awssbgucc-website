import type { Metadata } from 'next';
import { ChallengeForm } from '@/components/admin/ChallengeForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'New challenge' };

export default async function NewChallengePage() {
  await requireRole();
  const events = await db.event.findMany({ orderBy: { startsAt: 'desc' }, select: { id: true, title: true }, take: 50 });
  return (
    <>
      <PageHeader title="New challenge" />
      <ChallengeForm events={events} />
    </>
  );
}
