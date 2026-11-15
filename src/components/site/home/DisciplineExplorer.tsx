'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from '../motion/TransitionLink';
import { STATUS_LABEL, type BoardRecord, type Discipline } from '@/lib/content/disciplines';
import { dateParts } from '@/lib/format';
import { SbgIcon } from '../SbgIcon';

type Trace = { key: string; d: string; length: number };

const short = (iso: string) => { const { day, month } = dateParts(new Date(iso)); return `${day} ${month}`; };


/**
 * The technology board. Each area is a block whose fill says how far the group has got with it: solid when a session
 * covered it, half when one is on the calendar, outlined when announced, dashed when it is still open. Choosing a block
 * draws circuit traces down to the real sessions and stories on the rail below, oldest first. The blocks are a normal
 * tab list, so arrow keys, Home and End work, and #explore-<id> in the address opens that tab. The traces are drawn
 * from the laid-out positions and are decoration only: the panel and the rail say the same thing in text.
 */
export function DisciplineExplorer({ disciplines, records }: { disciplines: Discipline[]; records: BoardRecord[] }) {
  const [active, setActive] = useState(0);
  const [traces, setTraces] = useState<Trace[]>([]);
  // The first routes draw when the board comes into view, not at load while it is still off screen.
  const [seen, setSeen] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stops = useRef(new Map<string, HTMLElement>());
  const rail = useRef<HTMLDivElement>(null);
  const onRail = new Set(records.map((r) => r.key));
  const linked = (d: Discipline) => d.evidence.map((e) => `${e.kind}:${e.slug}`).filter((key) => onRail.has(key));
  const current = disciplines[active];
  const lit = new Set(linked(current));

  useEffect(() => {
    const fromHash = () => {
      const index = disciplines.findIndex((d) => window.location.hash === `#explore-${d.id}`);
      if (index >= 0) setActive(index);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [disciplines]);

  // Orthogonal routes, like tracks on a board: down from the block, along a bus, down into the record. They run
  // behind the blocks, so a route from the top row passes under the row below. A new key per selection replays the
  // drawing; a resize only moves the routes.
  const measure = useCallback(() => {
    const host = board.current;
    const tab = tabs.current[active];
    if (!host || !tab) return;
    const origin = host.getBoundingClientRect();
    const from = tab.getBoundingClientRect();
    const keys = linked(disciplines[active]);
    const railTop = rail.current?.getBoundingClientRect().top;
    if (railTop === undefined || keys.length === 0) { setTraces([]); return; }
    const top = railTop - origin.top;
    const startY = from.bottom - origin.top;
    const next = keys.flatMap((key, index) => {
      const to = stops.current.get(key)?.getBoundingClientRect();
      if (!to) return [];
      const x1 = Math.round(from.left - origin.left + ((index + 1) * from.width) / (keys.length + 1));
      const x2 = Math.round(to.left - origin.left + to.width / 2);
      const bus = Math.round(top - 16 - index * 8);
      const endY = Math.round(to.top - origin.top);
      const length = Math.ceil(bus - startY + Math.abs(x2 - x1) + endY - bus);
      return [{ key, d: `M${x1} ${startY} V${bus} H${x2} V${endY}`, length }];
    });
    setTraces(next);
    // disciplines is stable; linked reads it and the rail refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, disciplines]);

  // Measured only once the board has been seen, and after the next paint, so neither page load nor a tap waits on
  // these layout reads: the selection paints first, the routes follow.
  // Below 1024 px the routes are hidden, so nothing is measured at all.
  useEffect(() => {
    const host = board.current;
    if (!host || !seen) return;
    const wide = window.matchMedia('(min-width: 1024px)');
    let timer = 0;
    const later = () => { window.clearTimeout(timer); if (wide.matches) timer = window.setTimeout(measure, 0); };
    const frame = requestAnimationFrame(later);
    const sizer = new ResizeObserver(later);
    sizer.observe(host);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); sizer.disconnect(); };
  }, [measure, seen]);

  useEffect(() => {
    const host = board.current;
    if (!host || seen) return;
    const watcher = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setSeen(true); watcher.disconnect(); } }, { threshold: 0.35 });
    watcher.observe(host);
    return () => watcher.disconnect();
  }, [seen]);

  // On phones the panel sits below the board, so choosing a block brings it into view.
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
      <div className="board" ref={board}>
        <div role="tablist" aria-label="Areas to explore" aria-orientation="horizontal" className="board-tiles">
          {disciplines.map((d, index) => {
            const count = linked(d).length;
            return (
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
                className={`board-tile tone-${d.tone} status-${d.status}`}
                style={{ '--i': index } as CSSProperties}
              >
                <span className="board-fill" aria-hidden="true" />
                <span className="board-tile-title">{d.title}</span>
                <span className="board-tile-status">
                  {STATUS_LABEL[d.status]}
                  {count > 0 && <span className="board-count">, {count} {count === 1 ? 'record' : 'records'}</span>}
                </span>
              </button>
            );
          })}
        </div>

        {records.length > 0 && (
          <>
            <svg className="board-traces" aria-hidden="true">
              {traces.map((trace) => (
                <path key={`${trace.key}-${active}`} d={trace.d} className={`board-trace tone-${current.tone}`} style={{ '--length': trace.length } as CSSProperties} />
              ))}
            </svg>
            <div className="board-rail" ref={rail}>
              <ol>
                {records.map((record) => (
                  <li key={record.key} ref={(element) => { if (element) stops.current.set(record.key, element); }} className={lit.has(record.key) ? 'is-lit' : undefined}>
                    <Link href={`/${record.kind === 'event' ? 'events' : 'blog'}/${record.slug}`} className={`board-stop tone-${current.tone}`}>
                      <span className="board-stop-cell" aria-hidden="true" />
                      <span className="type-label">{record.kind === 'event' ? 'Session' : 'Story'}{record.date && `, ${short(record.date)}`}</span>
                      <span className="board-stop-title">{record.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="board-rail-label type-label text-text-muted">The record so far: sessions by date, then stories</p>
            </div>
          </>
        )}
      </div>

      {disciplines.map((d, index) => {
        const evidence = d.evidence.filter((e) => onRail.has(`${e.kind}:${e.slug}`));
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
