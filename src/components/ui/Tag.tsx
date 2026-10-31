import type { ReactNode } from 'react';

// Keys match the EventTag enum in docs/ADMIN.md.
export type EventTag = 'BOOTCAMP' | 'BUILD' | 'TALK' | 'NETWORKING' | 'COMMUNITY_DAY';

const TAGS: Record<EventTag, { label: string; classes: string }> = {
  BOOTCAMP: { label: 'Bootcamp', classes: 'border-purple/40 bg-purple/8 text-purple' },
  BUILD: { label: 'Build session', classes: 'border-cyan/40 bg-cyan/8 text-cyan' },
  TALK: { label: 'Talk', classes: 'border-lavender/40 bg-lavender/8 text-lavender' },
  NETWORKING: { label: 'Networking', classes: 'border-lime/40 bg-lime/8 text-lime' },
  COMMUNITY_DAY: { label: 'Community Day', classes: 'border-sky/40 bg-sky/8 text-sky' },
};

export function Tag({ tag, icon }: { tag: EventTag; icon?: ReactNode }) {
  const { label, classes } = TAGS[tag];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {icon}
      {label}
    </span>
  );
}
