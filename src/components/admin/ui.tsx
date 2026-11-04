import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

export const TABLE = 'w-full min-w-[560px] text-left text-sm';
export const TH = 'border-b border-border-strong py-3 pr-4 font-medium text-text-muted';
export const TD = 'border-b border-border py-3 pr-4 align-middle';
export const LINK = 'font-medium underline-offset-4 hover:underline';

export function PageHeader({ title, action }: { title: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="type-section">{title}</h1>
      {action && <Button href={action.href}>{action.label}</Button>}
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function StatusPill({ published, labels = ['Draft', 'Published'] }: { published: boolean; labels?: [string, string] }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${published ? 'border-lime/40 bg-lime/8 text-lime' : 'border-border-strong text-text-muted'}`}>
      {published ? labels[1] : labels[0]}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-text-muted">{children}</p>;
}

type MoveButtonsProps = { name: string; onUp: () => Promise<void>; onDown: () => Promise<void> };

export function MoveButtons({ name, onUp, onDown }: MoveButtonsProps) {
  const classes = 'flex size-11 items-center justify-center text-text-muted hover:text-white';
  return (
    <div className="flex">
      <form action={onUp}>
        <button type="submit" aria-label={`Move ${name} up`} className={classes}>
          <ChevronUp aria-hidden size={18} />
        </button>
      </form>
      <form action={onDown}>
        <button type="submit" aria-label={`Move ${name} down`} className={classes}>
          <ChevronDown aria-hidden size={18} />
        </button>
      </form>
    </div>
  );
}

export function ToggleButton({ action, label }: { action: () => Promise<void>; label: string }) {
  return (
    <form action={action}>
      <button type="submit" className="min-h-11 text-sm font-medium text-text-muted underline underline-offset-4 hover:text-white">
        {label}
      </button>
    </form>
  );
}
