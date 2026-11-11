'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { redeemReward, type RedeemState } from '../../actions/rewards';

function Confirm({ cost }: { cost: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center rounded-sm bg-white px-4 text-sm font-medium text-bg hover:bg-white/90 disabled:opacity-60">
      {pending ? 'Redeeming' : `Spend ${cost} credits`}
    </button>
  );
}

/** A two-step redeem, confirmed in the page. */
export function RedeemButton({ rewardId, cost, disabledReason }: { rewardId: string; cost: number; disabledReason: string | null }) {
  const [state, action] = useActionState<RedeemState>(redeemReward.bind(null, rewardId), {});
  const [asking, setAsking] = useState(false);

  if (state.ok) return <p role="status" className="text-sm font-medium text-lime">Redeemed</p>;
  if (disabledReason) return <p className="text-sm text-text-muted">{disabledReason}</p>;
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className="inline-flex min-h-11 items-center rounded-sm border border-border-strong px-4 text-sm font-medium text-white hover:border-text-muted">
        Redeem
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <Confirm cost={cost} />
      <button type="button" onClick={() => setAsking(false)} className="min-h-11 text-sm font-medium text-text-muted">
        Cancel
      </button>
      {state.message && (
        <p role="alert" className="w-full text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
