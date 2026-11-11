import type { ReactNode } from 'react';

/** A recorded number. Callers render it only when the value comes from real records. */
export function Stat({ value, label, hint }: { value: ReactNode; label: string; hint?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="font-display text-3xl font-medium text-white lg:text-4xl">{value}</p>
      <p className="mt-1 text-sm font-medium text-text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
