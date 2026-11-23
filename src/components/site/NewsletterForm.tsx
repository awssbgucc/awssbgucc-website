'use client';

import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';

type StatusState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'done'; message: string }
  | { kind: 'error'; message: string };

export function NewsletterForm({ source = 'site' }: { source?: string }) {
  const scope = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<StatusState>({ kind: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === 'submitting') return;
    setStatus({ kind: 'submitting' });

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, source, website }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) {
        setStatus({ kind: 'error', message: body.message ?? 'Could not subscribe right now. Try again in a moment.' });
        return;
      }
      setStatus({
        kind: 'done',
        message: body.message ?? 'You are subscribed. Check your inbox for future event updates and recaps.',
      });
    } catch {
      setStatus({ kind: 'error', message: 'Network error. Check your connection and try again.' });
    }
  }

  if (status.kind === 'done') {
    return (
      <div className="newsletter-done" role="status">
        <div className="newsletter-done-head">
          <CheckCircle2 aria-hidden size={20} className="text-lime" />
          <p className="type-label text-lime">Subscribed</p>
        </div>
        <p className="newsletter-done-text">{status.message}</p>
        <button
          type="button"
          onClick={() => {
            setName('');
            setEmail('');
            setStatus({ kind: 'idle' });
          }}
          className="newsletter-reset"
        >
          Subscribe another address
        </button>
      </div>
    );
  }

  const busy = status.kind === 'submitting';
  return (
    <form onSubmit={onSubmit} className="newsletter-form" noValidate>
      <div className="newsletter-fields">
        <div className="contact-field">
          <label htmlFor={`${scope}-name`} className="type-label">
            First name <span className="contact-opt">(optional)</span>
          </label>
          <input
            id={`${scope}-name`}
            name="name"
            type="text"
            autoComplete="given-name"
            placeholder="Ama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            className="contact-input"
          />
        </div>
        <div className="contact-field">
          <label htmlFor={`${scope}-email`} className="type-label">
            Email address
          </label>
          <input
            id={`${scope}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            aria-invalid={status.kind === 'error'}
            className="contact-input"
          />
        </div>
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${scope}-website`}>Website</label>
        <input
          id={`${scope}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status.kind === 'error' && (
        <p role="alert" className="contact-error">
          {status.message}
        </p>
      )}

      <div className="newsletter-foot">
        <p className="text-xs text-text-muted">Event announcements and session recaps only. Unsubscribe anytime.</p>
        <button type="submit" disabled={busy} className="cta cta-mint disabled:opacity-60">
          {busy ? <Loader2 aria-hidden size={16} className="animate-spin" /> : null}
          <span>{busy ? 'Subscribing' : 'Subscribe'}</span>
          {!busy && <ArrowRight aria-hidden size={16} className="cta-arrow-icon" />}
        </button>
      </div>
    </form>
  );
}
