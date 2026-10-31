import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-md border border-border bg-card p-6 transition-colors duration-150 ease-brand hover:border-border-strong ${className}`}
    >
      {children}
    </div>
  );
}
