'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Event } from '@/lib/content/types';
import { EventRow } from './EventRow';

type Item = { event: Event; attendance: number | null; recapSlug?: string };

const TAGS: { value: Event['tag'] | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'BOOTCAMP', label: 'Bootcamp' },
  { value: 'BUILD', label: 'Build session' },
  { value: 'TALK', label: 'Talk' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'COMMUNITY_DAY', label: 'Community Day' },
];

/** Filters run in the browser, so the page itself stays static. Every event is in the HTML for search engines. */
export function EventBrowser({ upcoming, past, empty }: { upcoming: Item[]; past: Item[]; empty: React.ReactNode }) {
  const [when, setWhen] = useState<'upcoming' | 'past'>(past.length > 0 ? 'past' : 'upcoming');
  useEffect(() => { if (window.location.hash === '#past-events') setWhen('past'); }, []);
  const [tag, setTag] = useState<(typeof TAGS)[number]['value']>('ALL');
  const [query, setQuery] = useState('');
  const all = useMemo(() => [...upcoming, ...past], [upcoming, past]);
  const usedTags = TAGS.filter((t) => t.value === 'ALL' || all.some((item) => item.event.tag === t.value));

  const list = (when === 'upcoming' ? upcoming : past).filter(({ event }) => {
    if (tag !== 'ALL' && event.tag !== tag) return false;
    const q = query.trim().toLowerCase();
    return !q || `${event.title} ${event.summary} ${event.venue ?? ''}`.toLowerCase().includes(q);
  });

  const tab = (value: 'upcoming' | 'past', label: string, count: number) => (
    <button type="button" aria-pressed={when === value} onClick={() => setWhen(value)} className="when-tab">
      {label} <span className="when-count">{count}</span>
    </button>
  );

  return (
    <div>
      <div className="filter-bar">
        <div className="when-tabs">
          {tab('upcoming', 'Upcoming', upcoming.length)}
          {tab('past', 'Past', past.length)}
        </div>
        {all.length > 4 && (
          <>
            <label htmlFor="event-search" className="sr-only">Search events</label>
            <input id="event-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" className="search-field" />
          </>
        )}
      </div>
      {usedTags.length > 2 && (
        <div role="group" aria-label="Filter by type" className="filter-chips mt-4">
          {usedTags.map((t) => (
            <button key={t.value} type="button" aria-pressed={tag === t.value} onClick={() => setTag(t.value)} className="filter-chip">
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div aria-live="polite" className="mt-6">
        <div key={`${when}|${tag}|${query}`} className="list-swap">
          {list.length > 0 ? (
            list.map((item) => <EventRow key={item.event.id} event={item.event} attendance={when === 'past' ? item.attendance : undefined} recapSlug={item.recapSlug} />)
          ) : when === 'upcoming' && tag === 'ALL' && !query ? (
            <div className="py-8">{empty}</div>
          ) : (
            <p className="py-8 text-text-muted">No events match.</p>
          )}
        </div>
      </div>
    </div>
  );
}
