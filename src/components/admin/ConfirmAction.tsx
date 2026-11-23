'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

type ConfirmActionProps = { action: () => Promise<void>; label: string; question: string };

/** A destructive action, confirmed in the page. Never a browser dialog. */
export function ConfirmAction({ action, label, question }: ConfirmActionProps) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-danger/35 bg-danger/8 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:border-danger hover:bg-danger/15"
      >
        <Trash2 aria-hidden size={13} />
        <span>{label}</span>
      </button>
    );
  }
  return (
    <form action={action} className="inline-flex flex-wrap items-center gap-2.5 rounded-md border border-danger/40 bg-danger/10 px-3 py-2">
      <span className="text-xs font-medium text-text-strong">{question}</span>
      <Choices label={label} onCancel={() => setAsking(false)} />
    </form>
  );
}

/** Both buttons lock while the action runs, so a second click cannot send it twice. */
function Choices({ label, onCancel }: { label: string; onCancel: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center gap-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-8 items-center rounded-md bg-danger px-2.5 py-1 text-xs font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Working' : `Yes, ${label.toLowerCase()}`}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onCancel}
        className="inline-flex min-h-8 items-center rounded-md border border-border-strong bg-bg px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:text-text-strong disabled:opacity-60"
      >
        Cancel
      </button>
    </div>
  );
}
