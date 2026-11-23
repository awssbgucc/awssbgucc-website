import { ArrowRight, ChevronDown, ChevronUp, Inbox, Plus } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const TABLE = 'w-full min-w-[600px] border-collapse text-left text-sm';
export const TH = 'border-b border-border bg-bg-alt/70 px-4 py-3 text-xs font-medium tracking-wider uppercase text-text-muted first:pl-5 last:pr-5';
export const TD = 'border-b border-border px-4 py-3.5 align-middle text-text first:pl-5 last:pr-5';
export const LINK = 'font-medium text-text-strong underline-offset-4 transition-colors hover:text-lime hover:underline';

type HeaderAction = { href: string; label: string; external?: boolean };

function PrimaryAction({ action }: { action: HeaderAction }) {
  const isAdd = /^(new|add|compose)\b/i.test(action.label.trim());
  const classes =
    'inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-xs transition-colors hover:bg-primary/90';
  const content = (
    <>
      {isAdd && <Plus aria-hidden size={16} />}
      <span>{action.label}</span>
      {!isAdd && <ArrowRight aria-hidden size={16} />}
    </>
  );
  if (action.external) {
    return (
      <a href={action.href} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={action.href} className={classes}>
      {content}
    </Link>
  );
}

function SecondaryAction({ action }: { action: HeaderAction }) {
  const classes =
    'inline-flex min-h-10 items-center gap-2 rounded-md border border-border-strong bg-card px-3.5 py-2 text-sm font-medium text-text-strong transition-colors hover:border-text-muted hover:bg-card-raised';
  if (action.external) {
    return (
      <a href={action.href} className={classes}>
        {action.label}
      </a>
    );
  }
  return (
    <Link href={action.href} className={classes}>
      {action.label}
    </Link>
  );
}

export function PageHeader({
  title,
  description,
  action,
  secondaryAction,
}: {
  title: string;
  description?: string;
  action?: HeaderAction;
  secondaryAction?: HeaderAction;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-[68ch] text-sm text-text-muted">{description}</p>}
      </div>
      {(secondaryAction || action) && (
        <div className="flex flex-wrap items-center gap-2.5">
          {secondaryAction && <SecondaryAction action={secondaryAction} />}
          {action && <PrimaryAction action={action} />}
        </div>
      )}
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-strong bg-card [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-hover-tint [&_tbody_tr:last-child_td]:border-b-0">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function StatusPill({ published, labels = ['Draft', 'Published'] }: { published: boolean; labels?: [string, string] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        published ? 'border-lime/40 bg-lime/10 text-lime' : 'border-border-strong bg-bg-alt text-text-muted'
      }`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${published ? 'bg-lime' : 'bg-text-faint'}`} />
      {published ? labels[1] : labels[0]}
    </span>
  );
}

export function Empty({
  children,
  icon,
  action,
}: {
  children: ReactNode;
  icon?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-card/60 px-6 py-10 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-border-strong bg-bg-alt text-text-muted">
        {icon ?? <Inbox aria-hidden size={18} />}
      </div>
      <p className="max-w-md text-sm text-text-muted">{children}</p>
      {action && (
        <div className="mt-4">
          <PrimaryAction action={action} />
        </div>
      )}
    </div>
  );
}

type MoveButtonsProps = { name: string; onUp: () => Promise<void>; onDown: () => Promise<void> };

export function MoveButtons({ name, onUp, onDown }: MoveButtonsProps) {
  const classes =
    'flex size-8 items-center justify-center rounded-md border border-border bg-bg text-text-muted transition-colors hover:border-border-strong hover:bg-card-raised hover:text-text-strong';
  return (
    <div className="inline-flex items-center gap-1">
      <form action={onUp}>
        <button type="submit" aria-label={`Move ${name} up`} className={classes}>
          <ChevronUp aria-hidden size={16} />
        </button>
      </form>
      <form action={onDown}>
        <button type="submit" aria-label={`Move ${name} down`} className={classes}>
          <ChevronDown aria-hidden size={16} />
        </button>
      </form>
    </div>
  );
}

export function ToggleButton({ action, label }: { action: () => Promise<void>; label: string }) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border-strong bg-bg px-3 py-1.5 text-xs font-medium text-text-strong transition-colors hover:border-text-muted hover:bg-card-raised"
      >
        {label}
      </button>
    </form>
  );
}

type StatTone = 'lime' | 'purple' | 'blue' | 'magenta' | 'neutral';

const STAT_TONES: Record<StatTone, string> = {
  lime: 'border-lime/35 bg-lime/10 text-lime',
  purple: 'border-purple/35 bg-purple/10 text-purple',
  blue: 'border-blue/35 bg-blue/10 text-blue',
  magenta: 'border-magenta/35 bg-magenta/10 text-magenta',
  neutral: 'border-border-strong bg-bg-alt text-text-muted',
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: StatTone;
  href?: string;
}) {
  const body = (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wider uppercase text-text-muted">{label}</p>
        <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-text-strong tabular-nums">{value}</p>
        {hint && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
      </div>
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${STAT_TONES[tone]}`}>{icon}</div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg border border-border-strong bg-card p-5 transition-colors hover:border-text-muted hover:bg-card-raised"
      >
        {body}
      </Link>
    );
  }
  return <div className="rounded-lg border border-border-strong bg-card p-5">{body}</div>;
}

export function Panel({
  title,
  description,
  action,
  children,
  className = '',
  bodyClassName = 'p-5',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-lg border border-border-strong bg-card ${className}`}>
      {(title || description || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-text-strong">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function FilterPills({
  items,
  label = 'Filter',
}: {
  items: { label: string; href: string; active: boolean; count?: number }[];
  label?: string;
}) {
  return (
    <nav aria-label={label} className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            item.active
              ? 'border-primary bg-primary text-on-primary'
              : 'border-border-strong bg-card text-text-muted hover:border-text-muted hover:bg-card-raised hover:text-text-strong'
          }`}
        >
          <span>{item.label}</span>
          {item.count !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.5 font-display text-[11px] leading-none tabular-nums ${
                item.active ? 'bg-on-primary/15 text-on-primary' : 'bg-bg-alt text-text-muted'
              }`}
            >
              {item.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
