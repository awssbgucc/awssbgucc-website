import type { Metadata } from 'next';
import { PageTitle, Panel, TextLink } from '@/components/builder/ui';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { requireMember } from '@/lib/member';
import { balances } from '@/lib/platform/engine';
import { redemptionError } from '@/lib/platform/rules';
import { RedeemButton } from './RedeemButton';

export const metadata: Metadata = { title: 'Rewards' };

const KIND_LABELS: Record<string, string> = { BANNER: 'Profile banners', ACCENT: 'Accent colours', FRAME: 'Frames', TITLE: 'Titles', PHYSICAL: 'Items from the team', OTHER: 'Other' };
const KIND_ORDER = ['BANNER', 'ACCENT', 'FRAME', 'TITLE', 'PHYSICAL', 'OTHER'];

export default async function RewardsPage() {
  const { user } = await requireMember();
  const [{ credits }, rewards, redemptions] = await Promise.all([
    balances(user.id),
    db.reward.findMany({ where: { available: true }, orderBy: [{ kind: 'asc' }, { order: 'asc' }] }),
    db.redemption.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, include: { reward: true } }),
  ]);
  const active = redemptions.filter((r) => r.status !== 'CANCELLED');
  const count = (rewardId: string) => active.filter((r) => r.rewardId === rewardId).length;
  const groups = KIND_ORDER.map((kind) => ({ kind, items: rewards.filter((r) => r.kind === kind) })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageTitle
        label="Rewards"
        title="Spend your credits"
        intro="Credits come from the same verified activity as XP. Spending credits never lowers your XP or level."
        action={
          <div className="rounded-md border border-border bg-card px-5 py-3 text-right">
            <p className="type-label text-text-muted">Balance</p>
            <p className="font-display text-3xl font-medium text-white">{credits}</p>
          </div>
        }
      />

      {groups.length === 0 ? (
        <EmptyState label="Nothing to redeem yet">The team has not added rewards. Your credits stay in your balance.</EmptyState>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(({ kind, items }) => (
            <section key={kind} aria-labelledby={`kind-${kind}`}>
              <h2 id={`kind-${kind}`} className="type-label mb-4 text-text-muted">
                {KIND_LABELS[kind]}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((reward) => {
                  const taken = count(reward.id);
                  const reason = taken >= reward.perMemberLimit ? 'You own this.' : redemptionError({ reward, balance: credits, alreadyRedeemed: taken });
                  return (
                    <li key={reward.id} className="flex flex-col rounded-md border border-border bg-card">
                      {reward.kind === 'BANNER' && reward.value && <div className={`banner-${reward.value} h-20 rounded-t-md border-b border-border`} aria-hidden />}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-white">{reward.name}</p>
                          <span className="shrink-0 font-display text-sm text-lime">{reward.cost} cr</span>
                        </div>
                        <p className="mt-2 flex-1 text-sm text-text-muted">{reward.description}</p>
                        {reward.stock !== null && <p className="type-label mt-3 text-text-muted">{reward.stock} left</p>}
                        <div className="mt-4">
                          <RedeemButton rewardId={reward.id} cost={reward.cost} disabledReason={reason} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Panel title="Your redemptions" className="mt-10" action={<TextLink href="/builder/profile#customise">Use what you redeemed</TextLink>}>
        {redemptions.length === 0 ? (
          <p className="text-sm text-text-muted">Nothing redeemed yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {redemptions.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-white">{r.reward.name}</p>
                  <p className="type-label text-text-muted">
                    {formatDate(r.createdAt)}, {r.cost} credits{r.status === 'CANCELLED' ? ', refunded' : ''}
                  </p>
                </div>
                {r.status === 'PENDING' ? <Badge tone="lavender">Waiting for hand-over</Badge> : <StatusBadge status={r.status} />}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
