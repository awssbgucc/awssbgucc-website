import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, PageHeader, StatusPill, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Challenges' };

export default async function AdminChallengesPage() {
  await requireRole();
  const challenges = await db.challenge.findMany({
    orderBy: { endsAt: 'desc' },
    include: { _count: { select: { submissions: true } }, submissions: { where: { status: 'PENDING' }, select: { id: true } } },
  });
  return (
    <>
      <PageHeader title="Challenges" action={{ href: '/admin/challenges/new', label: 'New challenge' }} />
      {challenges.length === 0 ? (
        <Empty>No challenges yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Title</th>
                <th className={TH}>Window</th>
                <th className={TH}>Submissions</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((c) => (
                <tr key={c.id}>
                  <td className={TD}>
                    <Link href={`/admin/challenges/${c.id}`} className={LINK}>
                      {c.title}
                    </Link>
                  </td>
                  <td className={`${TD} font-display text-xs`}>
                    {formatDate(c.startsAt)} to {formatDate(c.endsAt)}
                  </td>
                  <td className={TD}>
                    <Link href={`/admin/submissions?challenge=${c.id}`} className={LINK}>
                      {c._count.submissions} total, {c.submissions.length} to review
                    </Link>
                  </td>
                  <td className={TD}>
                    <StatusPill published={c.status === 'PUBLISHED'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
