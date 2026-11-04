'use client';

import { useState } from 'react';

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
      <button type="submit" className={`${BUTTON} text-danger underline underline-offset-4`}>
        Yes, {label.toLowerCase()}
      </button>
      <button type="button" onClick={() => setAsking(false)} className={`${BUTTON} text-text-muted`}>
        Cancel
      </button>
    </form>
  );
}
