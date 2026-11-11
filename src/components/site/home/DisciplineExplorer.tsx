'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { STATUS_LABEL, type Discipline } from '@/lib/content/disciplines';
import { SbgIcon } from '../SbgIcon';

/**
 * A vertical tab list of the areas members explore. Each panel says plainly whether the group has covered the area,
 * and links only to records that are published. #explore-<id> in the address opens that tab.
 */
export function DisciplineExplorer({ disciplines, published }: { disciplines: Discipline[]; published: string[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const live = new Set(published);

  useEffect(() => {
    const fromHash = () => {
      const index = disciplines.findIndex((d) => window.location.hash === `#explore-${d.id}`);
      if (index >= 0) setActive(index);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [disciplines]);

  // On phones the panel sits below the list, so choosing a tab brings it into view.
  const select = (index: number) => {
    setActive(index);
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => document.getElementById(`explore-panel-${disciplines[index].id}`)?.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' }));
  };

  const move = (index: number) => {
    const next = (index + disciplines.length) % disciplines.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="explorer">
      <div role="tablist" aria-label="Areas to explore" aria-orientation="vertical" className="explorer-tabs">
        {disciplines.map((d, index) => (
          <button
            key={d.id}
            id={`explore-${d.id}`}
            ref={(element) => { tabs.current[index] = element; }}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`explore-panel-${d.id}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); move(index + 1); }
              if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); move(index - 1); }
              if (event.key === 'Home') { event.preventDefault(); move(0); }
              if (event.key === 'End') { event.preventDefault(); move(disciplines.length - 1); }
            }}
            className={`explorer-tab status-${d.status}`}
          >
            <span className={`swatch swatch-${d.tone}`} aria-hidden="true" />
            <span className="explorer-tab-title">{d.title}</span>
            <span className="explorer-tab-status">{STATUS_LABEL[d.status]}</span>
          </button>
        ))}
      </div>
      {disciplines.map((d, index) => {
        const evidence = d.evidence.filter((e) => live.has(`${e.kind}:${e.slug}`));
        return (
          <div key={d.id} role="tabpanel" id={`explore-panel-${d.id}`} aria-labelledby={`explore-${d.id}`} hidden={active !== index} className="explorer-panel">
            <div className="explorer-icon">
              <SbgIcon name={d.icon} tone={d.tone} size={88} />
            </div>
            <p className={`status-chip status-${d.status}`}>{STATUS_LABEL[d.status]}</p>
            <h3>{d.title}</h3>
            <p className="explorer-line">{d.line}</p>
            <h4 className="type-label text-text-muted">At UCC so far</h4>
            <p>{d.here}</p>
            {evidence.length > 0 && (
              <ul className="explorer-evidence">
                {evidence.map((e) => (
                  <li key={`${e.kind}:${e.slug}`}>
                    <Link href={`/${e.kind === 'event' ? 'events' : 'blog'}/${e.slug}`}>
                      <span className="type-label">{e.kind === 'event' ? 'Session' : 'Story'}</span>
                      {e.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
