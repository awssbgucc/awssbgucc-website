import type { Metadata } from 'next';
import Link from 'next/link';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { Empty, LINK, PageHeader, StatusPill, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { handOver, refund } from './actions';

export const metadata: Metadata = { title: 'Rewards' };

export default async function AdminRewardsPage() {
  await requireRole('ADMIN');
  const [rewards, redemptions] = await Promise.all([
    db.reward.findMany({ orderBy: [{ kind: 'asc' }, { order: 'asc' }], include: { _count: { select: { redemptions: { where: { status: { not: 'CANCELLED' } } } } } } }),
    db.redemption.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { reward: { select: { name: true, kind: true } }, user: { select: { profile: { select: { displayName: true } } } } } }),
  ]);
  return (
    <>
      <PageHeader title="Rewards" action={{ href: '/admin/rewards/new', label: 'New reward' }} />
      {rewards.length === 0 ? (
        <Empty>No rewards yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Reward</th>
                <th className={TH}>Kind</th>
                <th className={TH}>Cost</th>
                <th className={TH}>Stock</th>
                <th className={TH}>Redeemed</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id}>
                  <td className={TD}>
                    <Link href={`/admin/rewards/${r.id}`} className={LINK}>
                      {r.name}
                    </Link>
                  </td>
                  <td className={TD}>{r.kind.toLowerCase()}</td>
                  <td className={`${TD} font-display`}>{r.cost}</td>
                  <td className={`${TD} font-display`}>{r.stock ?? 'no limit'}</td>
                  <td className={`${TD} font-display`}>{r._count.redemptions}</td>
                  <td className={TD}>
                    <StatusPill published={r.available} labels={['Off', 'Available']} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <h2 className="mt-12 mb-3 text-lg font-semibold">Redemptions</h2>
      {redemptions.length === 0 ? (
        <Empty>Nobody has redeemed anything yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Date</th>
                <th className={TH}>Member</th>
                <th className={TH}>Reward</th>
                <th className={TH}>Status</th>
                <th className={TH}>Change</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r.id}>
                  <td className={`${TD} font-display text-xs`}>{formatDate(r.createdAt)}</td>
                  <td className={TD}>
                    <Link href={`/admin/members/${r.userId}`} className={LINK}>
                      {r.user.profile?.displayName ?? 'Member'}
                    </Link>
                  </td>
                  <td className={TD}>
                    {r.reward.name} <span className="text-text-muted">({r.cost} cr)</span>
                  </td>
                  <td className={TD}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className={TD}>
                    <div className="flex gap-4">
                      {r.status === 'PENDING' && <ToggleButton action={handOver.bind(null, r.id)} label="Mark handed over" />}
                      {r.status !== 'CANCELLED' && <ConfirmAction action={refund.bind(null, r.id)} label="Cancel and refund" question={`${r.cost} credits go back to the member.`} />}
                    </div>
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
