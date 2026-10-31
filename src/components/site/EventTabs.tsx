'use client';

import { useState, type ReactNode } from 'react';

const TAB = 'min-h-11 border-b-2 px-1 text-sm font-medium transition-colors duration-150 ease-brand';

export function EventTabs({ upcoming, past }: { upcoming: ReactNode; past: ReactNode }) {
  const [showPast, setShowPast] = useState(false);
  const tab = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${TAB} ${active ? 'border-white text-white' : 'border-transparent text-text-muted hover:text-white'}`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="mb-8 flex gap-6 border-b border-border">
        {tab('Upcoming', !showPast, () => setShowPast(false))}
        {tab('Past', showPast, () => setShowPast(true))}
      </div>
      {showPast ? past : upcoming}
    </>
  );
}
