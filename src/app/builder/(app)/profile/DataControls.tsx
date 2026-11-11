'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { FormState } from '@/lib/admin/forms';
import { deleteAccount, requestPrivacy } from '../../actions/profile';

const INPUT = 'w-full min-h-11 rounded-sm border border-border-strong bg-bg px-3 py-2 text-base text-text';

function Submit({ label, danger = false }: { label: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`inline-flex min-h-11 items-center rounded-sm px-4 text-sm font-medium disabled:opacity-60 ${danger ? 'border border-danger text-danger hover:bg-danger/8' : 'border border-border-strong text-white hover:border-text-muted'}`}>
      {pending ? 'Sending' : label}
    </button>
  );
}

export function DataControls({ handle }: { handle: string }) {
  const [request, requestAction] = useActionState<FormState, FormData>(requestPrivacy, {});
  const [deletion, deleteAction] = useActionState<FormState, FormData>(deleteAccount, {});
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-8 text-sm">
      <div>
        <p className="font-semibold text-white">Download your data</p>
        <p className="mt-1 text-text-muted">A JSON file with your profile, check-ins, submissions, projects, XP and credit history, and redemptions.</p>
        <a href="/api/me/export" className="mt-3 inline-flex min-h-11 items-center rounded-sm border border-border-strong px-4 font-medium text-white hover:border-text-muted">
          Download JSON
        </a>
      </div>

      <form action={requestAction} className="flex flex-col gap-3">
        <p className="font-semibold text-white">Ask the team to correct something</p>
        <label htmlFor="kind" className="sr-only">
          Request type
        </label>
        <select id="kind" name="kind" className={INPUT} defaultValue="CORRECTION">
          <option value="CORRECTION">Correct a record, such as a missed check-in</option>
          <option value="OTHER">Something else about my data</option>
        </select>
        <label htmlFor="details" className="sr-only">
          Details
        </label>
        <textarea id="details" name="details" rows={3} maxLength={1000} placeholder="What should change?" className={INPUT} />
        {request.saved && <p role="status" className="font-medium text-lime">Sent. The team will reply by email.</p>}
        {request.message && <p role="alert" className="font-medium text-danger">{request.message}</p>}
        <div>
          <Submit label="Send request" />
        </div>
      </form>

      <div className="border-t border-border pt-6">
        <p className="font-semibold text-white">Delete your account</p>
        <p className="mt-1 text-text-muted">Removes your profile, check-ins, submissions, projects, XP, credits and redemptions. It cannot be undone.</p>
        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)} className="mt-3 min-h-11 font-medium text-danger underline underline-offset-4">
            Delete my account
          </button>
        ) : (
          <form action={deleteAction} className="mt-3 flex flex-col gap-3">
            <label htmlFor="confirm" className="font-medium">
              Type <span className="font-display text-white">{handle}</span> to confirm
            </label>
            <input id="confirm" name="confirm" autoComplete="off" className={INPUT} aria-invalid={!!deletion.errors?.confirm} aria-describedby={deletion.errors?.confirm ? 'confirm-error' : undefined} />
            {deletion.errors?.confirm && (
              <p id="confirm-error" className="font-medium text-danger">
                {deletion.errors.confirm}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Submit label="Delete permanently" danger />
              <button type="button" onClick={() => setConfirming(false)} className="min-h-11 font-medium text-text-muted">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
