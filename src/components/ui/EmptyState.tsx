import type { ReactNode } from 'react';

type EmptyStateProps = { label: string; children: ReactNode; action?: ReactNode; className?: string };

/** Every list has one: a mono label, one plain line, and the next useful action. */
export function EmptyState({ label, children, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`rounded-md border border-dashed border-border-strong px-6 py-8 ${className}`}>
      <p className="type-label text-text-muted">{label}</p>
      <div className="mt-2 max-w-[56ch]">{children}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
