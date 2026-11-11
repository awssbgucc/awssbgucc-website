import type { Metadata } from 'next';
import { Empty, PageHeader, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/format';

export const metadata: Metadata = { title: 'Audit log' };

type Props = { searchParams: Promise<{ action?: string }> };

export default async function AuditPage({ searchParams }: Props) {
  await requireRole('ADMIN');
  const { action = '' } = await searchParams;
  const filter = action.trim().slice(0, 40);
  const entries = await db.auditLog.findMany({ where: filter ? { action: { startsWith: filter } } : {}, orderBy: { createdAt: 'desc' }, take: 300 });
  return (
    <>
      <PageHeader title="Audit log" />
      <p className="mb-6 max-w-[62ch] text-sm text-text-muted">Sensitive actions: check-in changes, reviews, balance adjustments, rewards, suspensions and deletions. Content edits are recorded on each record instead.</p>
      <form className="mb-6 flex max-w-md gap-3" role="search">
        <label htmlFor="action" className="sr-only">
          Filter by action
        </label>
        <input id="action" name="action" defaultValue={filter} placeholder="For example member. or checkin." className="min-h-11 flex-1 rounded-sm border border-border-strong bg-bg px-3" />
        <button type="submit" className="min-h-11 rounded-sm bg-white px-5 text-sm font-medium text-bg">
          Filter
        </button>
      </form>
      {entries.length === 0 ? (
        <Empty>Nothing recorded yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>When</th>
                <th className={TH}>Who</th>
                <th className={TH}>Action</th>
                <th className={TH}>Record</th>
                <th className={TH}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className={`${TD} font-display text-xs whitespace-nowrap`}>
                    {formatDate(e.createdAt)} {formatTime(e.createdAt)}
                  </td>
                  <td className={TD}>{e.actorEmail}</td>
                  <td className={`${TD} font-display text-xs`}>{e.action}</td>
                  <td className={`${TD} text-xs text-text-muted`}>
                    {e.entityType} {e.entityId}
                  </td>
                  <td className={`${TD} text-xs`}>{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
