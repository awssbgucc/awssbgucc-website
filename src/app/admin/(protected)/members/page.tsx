import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, PageHeader, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Members' };

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function MembersPage({ searchParams }: Props) {
  await requireRole();
  const { q = '', status = '' } = await searchParams;
  const query = q.trim().slice(0, 80);
  const members = await db.memberProfile.findMany({
    where: {
      ...(status === 'ACTIVE' || status === 'SUSPENDED' ? { status } : {}),
      ...(query
        ? { OR: [{ displayName: { contains: query, mode: 'insensitive' } }, { handle: { contains: query, mode: 'insensitive' } }, { user: { email: { contains: query, mode: 'insensitive' } } }] }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { email: true, _count: { select: { checkIns: true } } } } },
  });
  const total = await db.memberProfile.count();

  return (
    <>
      <PageHeader title="Members" />
      <form role="search" className="mb-6 flex max-w-2xl flex-wrap gap-3">
        <label htmlFor="q" className="sr-only">
          Search members
        </label>
        <input id="q" name="q" defaultValue={query} placeholder="Name, handle or email" className="min-h-11 flex-1 rounded-sm border border-border-strong bg-bg px-3" />
        <label htmlFor="status" className="sr-only">
          Status
        </label>
        <select id="status" name="status" defaultValue={status} className="min-h-11 rounded-sm border border-border-strong bg-bg px-3">
          <option value="">Any status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <button type="submit" className="min-h-11 rounded-sm bg-white px-5 text-sm font-medium text-bg">
          Search
        </button>
      </form>
      <p className="mb-4 text-sm text-text-muted">
        Showing {members.length} of {total} members.
      </p>
      {members.length === 0 ? (
        <Empty>No members match.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Member</th>
                <th className={TH}>Programme</th>
                <th className={TH}>Sessions</th>
                <th className={TH}>Joined</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.userId}>
                  <td className={TD}>
                    <Link href={`/admin/members/${m.userId}`} className={LINK}>
                      {m.displayName}
                    </Link>
                    <span className="block text-xs text-text-muted">
                      @{m.handle}, {m.user.email}
                    </span>
                  </td>
                  <td className={TD}>{[m.programme, m.level].filter(Boolean).join(', ')}</td>
                  <td className={`${TD} font-display`}>{m.user._count.checkIns}</td>
                  <td className={`${TD} font-display text-xs`}>{formatDate(m.createdAt)}</td>
                  <td className={TD}>
                    <StatusBadge status={m.onboardedAt ? m.status : 'DRAFT'} />
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
