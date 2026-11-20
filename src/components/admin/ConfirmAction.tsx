'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

type ConfirmActionProps = { action: () => Promise<void>; label: string; question: string };

const BUTTON = 'min-h-11 text-sm font-medium';

/** A destructive action, confirmed in the page. Never a browser dialog. */
export function ConfirmAction({ action, label, question }: ConfirmActionProps) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={`${BUTTON} text-danger`}>
        {label}
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-4">
      <span className="text-sm">{question}</span>
      <Choices label={label} onCancel={() => setAsking(false)} />
    </form>
  );
}

/** Both buttons lock while the action runs, so a second click cannot send it twice. */
function Choices({ label, onCancel }: { label: string; onCancel: () => void }) {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" disabled={pending} className={`${BUTTON} text-danger underline underline-offset-4 disabled:opacity-60`}>
        {pending ? 'Working' : `Yes, ${label.toLowerCase()}`}
      </button>
      <button type="button" disabled={pending} onClick={onCancel} className={`${BUTTON} text-text-muted disabled:opacity-60`}>
        Cancel
      </button>
    </>
  );
}
