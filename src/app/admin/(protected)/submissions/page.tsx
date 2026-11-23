import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, FilterPills, LINK, PageHeader, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Submissions' };

type Props = { searchParams: Promise<{ status?: string; challenge?: string }> };

const STATUSES = [
  { key: 'PENDING', label: 'In review' },
  { key: 'CHANGES_REQUESTED', label: 'Changes requested' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Not accepted' },
] as const;

export default async function SubmissionsPage({ searchParams }: Props) {
  await requireRole();
  const params = await searchParams;
  const status = STATUSES.find((s) => s.key === params.status)?.key ?? 'PENDING';
  const [submissions, counts] = await Promise.all([
    db.submission.findMany({
      where: { status, ...(params.challenge ? { challengeId: params.challenge } : {}) },
      orderBy: { updatedAt: 'asc' },
      take: 200,
      include: { challenge: { select: { title: true } }, user: { select: { profile: { select: { displayName: true, handle: true } } } } },
    }),
    db.submission.groupBy({
      by: ['status'],
      where: params.challenge ? { challengeId: params.challenge } : undefined,
      _count: true,
    }),
  ]);
  const countMap = new Map(counts.map((c) => [c.status, c._count]));

  return (
    <>
      <PageHeader title="Submissions" description="Review challenge repositories submitted by members and award XP or credits." />
      <FilterPills
        label="Filter by status"
        items={STATUSES.map(({ key, label }) => ({
          label,
          href: `/admin/submissions?status=${key}${params.challenge ? `&challenge=${params.challenge}` : ''}`,
          active: key === status,
          count: countMap.get(key) ?? 0,
        }))}
      />
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
                  <td className={`${TD} font-display text-xs whitespace-nowrap`}>{formatDate(s.updatedAt)}</td>
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
