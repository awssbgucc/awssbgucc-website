import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChallengeForm } from '@/components/admin/ChallengeForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { LINK, PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteChallenge } from '../actions';

export const metadata: Metadata = { title: 'Edit challenge' };

type Props = { params: Promise<{ id: string }> };

export default async function EditChallengePage({ params }: Props) {
  const admin = await requireRole();
  const { id } = await params;
  const [challenge, events] = await Promise.all([
    db.challenge.findUnique({ where: { id } }),
    db.event.findMany({ orderBy: { startsAt: 'desc' }, select: { id: true, title: true }, take: 50 }),
  ]);
  if (!challenge) notFound();
  return (
    <>
      <PageHeader title="Edit challenge" />
      <Link href={`/admin/submissions?challenge=${challenge.id}`} className={`${LINK} mb-6 inline-flex min-h-11 items-center text-sm underline`}>
        Review submissions
      </Link>
      <ChallengeForm challenge={challenge} events={events} />
      {admin.role === 'ADMIN' && (
        <div className="mt-10 border-t border-border pt-6">
          <ConfirmAction action={deleteChallenge.bind(null, challenge.id)} label="Delete challenge" question="Its submissions are deleted too. XP already awarded stays." />
        </div>
      )}
    </>
  );
}
