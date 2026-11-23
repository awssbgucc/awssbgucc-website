'use client';

import { AlertCircle, CheckCircle2, Loader2, Send, TestTube2 } from 'lucide-react';
import { useActionState, useState } from 'react';
import { sendCampaign, sendTestCampaign, type CampaignSendState } from '@/app/admin/(protected)/newsletter/actions';

export function CampaignSendPanel({
  campaignId,
  subscriberCount,
  adminEmail,
  resendConfigured,
}: {
  campaignId: string;
  subscriberCount: number;
  adminEmail: string;
  resendConfigured: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [testState, testAction, testPending] = useActionState<CampaignSendState, FormData>(() => sendTestCampaign(campaignId), {});
  const [sendState, sendAction, sendPending] = useActionState<CampaignSendState, FormData>(() => sendCampaign(campaignId), {});

  const feedback = sendState.message || sendState.error ? sendState : testState;

  return (
    <section className="rounded-lg border border-border-strong bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-strong">Send update</h2>
          <p className="mt-1 text-sm text-text-muted">
            Will email <strong className="font-semibold text-text-strong">{subscriberCount}</strong> active{' '}
            {subscriberCount === 1 ? 'subscriber' : 'subscribers'}. Each email includes a one-click unsubscribe link.
          </p>
        </div>
        {!resendConfigured && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-bg-alt px-3 py-1 text-xs font-medium text-text-muted">
            Resend not connected
          </span>
        )}
      </div>

      {!resendConfigured && (
        <div className="mt-4 rounded-md border border-border-strong bg-bg px-4 py-3 text-xs text-text-muted">
          Set <code className="font-display text-text-strong">RESEND_API_KEY</code> and{' '}
          <code className="font-display text-text-strong">CONTACT_FROM_EMAIL</code> in your environment variables to enable live delivery.
        </div>
      )}

      {feedback.error && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">
          <AlertCircle aria-hidden size={16} className="mt-0.5 shrink-0" />
          <span>{feedback.error}</span>
        </div>
      )}

      {feedback.message && (
        <div role="status" className="mt-4 flex items-start gap-2.5 rounded-md border border-lime/40 bg-lime/10 px-3.5 py-2.5 text-sm font-medium text-lime">
          <CheckCircle2 aria-hidden size={16} className="mt-0.5 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <form action={testAction}>
          <button
            type="submit"
            disabled={testPending || sendPending || !resendConfigured}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border-strong bg-bg px-4 py-2 text-sm font-medium text-text-strong transition-colors hover:border-text-muted hover:bg-card-raised disabled:opacity-50"
          >
            {testPending ? <Loader2 aria-hidden size={15} className="animate-spin" /> : <TestTube2 aria-hidden size={15} />}
            <span>{testPending ? 'Sending test' : `Send test to ${adminEmail}`}</span>
          </button>
        </form>

        {!confirming ? (
          <button
            type="button"
            disabled={subscriberCount === 0 || testPending || sendPending || !resendConfigured}
            onClick={() => setConfirming(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send aria-hidden size={15} />
            <span>Send to {subscriberCount} subscribers</span>
          </button>
        ) : (
          <form
            action={sendAction}
            className="inline-flex flex-wrap items-center gap-2.5 rounded-md border border-lime/40 bg-lime/10 px-3.5 py-2"
          >
            <span className="text-xs font-medium text-text-strong">Send to {subscriberCount} active subscribers now?</span>
            <button
              type="submit"
              disabled={sendPending}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-medium text-on-primary disabled:opacity-60"
            >
              {sendPending && <Loader2 aria-hidden size={13} className="animate-spin" />}
              <span>{sendPending ? 'Sending' : 'Yes, send now'}</span>
            </button>
            <button
              type="button"
              disabled={sendPending}
              onClick={() => setConfirming(false)}
              className="inline-flex min-h-8 items-center rounded-md border border-border-strong bg-bg px-3 py-1 text-xs font-medium text-text-muted hover:text-text-strong"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
