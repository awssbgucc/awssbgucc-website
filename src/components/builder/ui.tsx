import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageTitle({ title, intro, action, label }: { title: string; intro?: ReactNode; action?: ReactNode; label?: string }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {label && <p className="type-label mb-2 text-text-muted">{label}</p>}
        <h1 className="type-section">{title}</h1>
        {intro && <div className="mt-3 max-w-[62ch] text-text-muted">{intro}</div>}
      </div>
      {action}
    </header>
  );
}

export function Panel({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-md border border-border bg-card p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted underline-offset-4 hover:text-white hover:underline">
      {children}
    </Link>
  );
}

/** A dated row: mono date column, then content. Used for sessions, history and activity. */
export function DatedRow({ date, children, href }: { date: ReactNode; children: ReactNode; href?: string }) {
  const body = (
    <div className="grid grid-cols-[88px_1fr] items-start gap-4 border-b border-border py-4 sm:grid-cols-[120px_1fr]">
      <p className="type-label pt-0.5 text-text-muted">{date}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
  return href ? (
    <Link href={href} className="block transition-colors duration-150 ease-brand hover:bg-card/60">
      {body}
    </Link>
  ) : (
    body
  );
}
