import { Search } from 'lucide-react';
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
      <PageHeader title="Members" description="Builder Portal accounts, session check-ins and profile status." />
      <form role="search" className="mb-6 flex max-w-3xl flex-wrap items-center gap-3 rounded-lg border border-border-strong bg-card p-3.5">
        <div className="relative min-w-[200px] flex-1">
          <Search aria-hidden size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
          <label htmlFor="q" className="sr-only">
            Search members
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Name, handle or email"
            className="min-h-10 w-full rounded-md border border-input-border bg-input pr-3 pl-9 text-sm text-text-strong placeholder:text-text-faint focus:border-focus focus:outline-none"
          />
        </div>
        <label htmlFor="status" className="sr-only">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="min-h-10 rounded-md border border-input-border bg-input px-3 text-sm text-text-strong focus:border-focus focus:outline-none"
        >
          <option value="">Any status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <button
          type="submit"
          className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
        >
          Search
        </button>
      </form>
      <p className="mb-4 text-xs font-medium text-text-muted">
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
                  <td className={`${TD} font-display text-xs whitespace-nowrap`}>{formatDate(m.createdAt)}</td>
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
