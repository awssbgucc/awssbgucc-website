'use client';

import { useState } from 'react';
import { Cta } from './Cta';

export function UnsubscribePanel({
  token,
  maskedEmail,
  initialStatus,
}: {
  token: string;
  maskedEmail: string;
  initialStatus: 'SUBSCRIBED' | 'UNSUBSCRIBED';
}) {
  const [status, setStatus] = useState<'SUBSCRIBED' | 'UNSUBSCRIBED'>(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(action: 'unsubscribe' | 'resubscribe') {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; status?: 'SUBSCRIBED' | 'UNSUBSCRIBED'; message?: string };
      if (!response.ok || !body.ok || !body.status) {
        setError(body.message ?? 'Could not update your subscription right now.');
        return;
      }
      setStatus(body.status);
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cert-empty">
      <p className="type-label text-text-muted">Newsletter preference</p>
      <h2 className="section-title">{status === 'UNSUBSCRIBED' ? 'You are unsubscribed' : 'Confirm unsubscribe'}</h2>
      <p>
        {status === 'UNSUBSCRIBED'
          ? `We will no longer send newsletter emails to ${maskedEmail}.`
          : `Click below to stop receiving newsletter updates for ${maskedEmail}.`}
      </p>
      {error && (
        <p role="alert" className="mb-4 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        {status === 'SUBSCRIBED' ? (
          <button type="button" disabled={busy} onClick={() => toggle('unsubscribe')} className="cta cta-mint disabled:opacity-60">
            {busy ? 'Updating' : 'Unsubscribe'}
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={() => toggle('resubscribe')} className="cta cta-line disabled:opacity-60">
            {busy ? 'Updating' : 'Subscribe again'}
          </button>
        )}
        <Cta href="/" variant="arrow">
          Back to home
        </Cta>
      </div>
    </div>
  );
}
