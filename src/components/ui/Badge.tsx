import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'lime' | 'cyan' | 'sky' | 'lavender' | 'danger';

const TONES: Record<Tone, string> = {
  neutral: 'border-border-strong text-text-muted',
  lime: 'border-lime/40 bg-lime/8 text-lime',
  cyan: 'border-cyan/40 bg-cyan/8 text-cyan',
  sky: 'border-sky/40 bg-sky/8 text-sky',
  lavender: 'border-lavender/40 bg-lavender/8 text-lavender',
  danger: 'border-danger/40 bg-danger/8 text-danger',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]}`}>{children}</span>;
}

const STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: 'In review', tone: 'lavender' },
  APPROVED: { label: 'Approved', tone: 'lime' },
  CHANGES_REQUESTED: { label: 'Changes requested', tone: 'sky' },
  REJECTED: { label: 'Not accepted', tone: 'danger' },
  DRAFT: { label: 'Draft', tone: 'neutral' },
  PUBLISHED: { label: 'Published', tone: 'lime' },
  FULFILLED: { label: 'Fulfilled', tone: 'lime' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  OPEN: { label: 'Open', tone: 'lavender' },
  DONE: { label: 'Done', tone: 'lime' },
  ACTIVE: { label: 'Active', tone: 'lime' },
  SUSPENDED: { label: 'Suspended', tone: 'danger' },
};

export function StatusBadge({ status }: { status: string }) {
  const { label, tone } = STATUS[status] ?? { label: status, tone: 'neutral' as Tone };
  return <Badge tone={tone}>{label}</Badge>;
}
