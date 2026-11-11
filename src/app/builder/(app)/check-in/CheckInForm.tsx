'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { checkIn, type CheckInState } from '../../actions/sessions';

const INPUT = 'w-full min-h-12 rounded-sm border border-border-strong bg-bg px-3 py-2 text-base text-text aria-[invalid=true]:border-danger';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full justify-center sm:w-auto">
      {pending ? 'Checking in' : 'Check in'}
    </Button>
  );
}

export function CheckInForm({ sessions, event, code }: { sessions: { slug: string; title: string }[]; event: string; code: string }) {
  const [state, action] = useActionState<CheckInState, FormData>(checkIn, {});

  if (state.result) {
    const { title, xp, credits, duplicate } = state.result;
    return (
      <div role="status" className="flash-lime max-w-xl rounded-md border border-lime/40 p-6">
        <p className="type-label text-lime">{duplicate ? 'Already checked in' : 'Checked in'}</p>
        <p className="mt-2 text-xl font-semibold text-white">{title}</p>
        {!duplicate && (xp > 0 || credits > 0) && (
          <p className="mt-2 font-display text-sm text-text-muted">
            +{xp} XP, +{credits} credits
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/builder">Back to home</Button>
          <Link href="/builder/sessions" className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted underline underline-offset-4">
            Session materials
          </Link>
        </div>
      </div>
    );
  }

  const v = (key: string, fallback: string) => state.values?.[key] ?? fallback;
  return (
    <form key={JSON.stringify(state.values ?? {})} action={action} className="flex max-w-xl flex-col gap-6">
      <div>
        <label htmlFor="event" className="mb-1.5 block text-sm font-medium">
          Session
        </label>
        <select id="event" name="event" defaultValue={v('event', event)} aria-invalid={!!state.errors?.event} className={INPUT}>
          {sessions.length > 1 && <option value="">Choose the session</option>}
          {sessions.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
        {state.errors?.event && <p className="mt-1.5 text-sm font-medium text-danger">{state.errors.event}</p>}
      </div>
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium">
          Code
        </label>
        <input
          id="code"
          name="code"
          defaultValue={v('code', code)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          maxLength={12}
          aria-invalid={!!state.errors?.code}
          aria-describedby="code-help"
          className={`${INPUT} font-display text-2xl tracking-[0.3em] uppercase`}
        />
        <p id="code-help" className="mt-1.5 text-sm text-text-muted">
          Six characters, shown on the screen in the room.
        </p>
        {state.errors?.code && <p className="mt-1.5 text-sm font-medium text-danger">{state.errors.code}</p>}
      </div>
      {state.message && (
        <p role="alert" className="text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
      <div>
        <Submit />
      </div>
    </form>
  );
}
