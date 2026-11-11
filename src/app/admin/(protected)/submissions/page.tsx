import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, PageHeader, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Submissions' };

type Props = { searchParams: Promise<{ status?: string; challenge?: string }> };

const STATUSES = ['PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'] as const;

export default async function SubmissionsPage({ searchParams }: Props) {
  await requireRole();
  const params = await searchParams;
  const status = STATUSES.find((s) => s === params.status) ?? 'PENDING';
  const submissions = await db.submission.findMany({
    where: { status, ...(params.challenge ? { challengeId: params.challenge } : {}) },
    orderBy: { updatedAt: 'asc' },
    take: 200,
    include: { challenge: { select: { title: true } }, user: { select: { profile: { select: { displayName: true, handle: true } } } } },
  });
  return (
    <>
      <PageHeader title="Submissions" />
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions?status=${s}${params.challenge ? `&challenge=${params.challenge}` : ''}`}
            aria-current={s === status ? 'page' : undefined}
            className={`min-h-10 rounded-full border px-3.5 py-2 text-sm font-medium ${s === status ? 'border-white text-white' : 'border-border-strong text-text-muted hover:text-white'}`}
          >
            <StatusBadge status={s} />
          </Link>
        ))}
      </nav>
      {submissions.length === 0 ? (
        <Empty>{status === 'PENDING' ? 'Nothing waiting for review.' : 'None.'}</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Challenge</th>
                <th className={TH}>Member</th>
                <th className={TH}>Updated</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className={TD}>
                    <Link href={`/admin/submissions/${s.id}`} className={LINK}>
                      {s.challenge.title}
                    </Link>
                  </td>
                  <td className={TD}>{s.user.profile?.displayName ?? 'Unknown'}</td>
                  <td className={`${TD} font-display text-xs`}>{formatDate(s.updatedAt)}</td>
                  <td className={TD}>
                    <StatusBadge status={s.status} />
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
