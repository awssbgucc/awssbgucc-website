'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { Link } from './motion/TransitionLink';

/**
 * Marks the section you are in with a mint cell, the same cell that marks Cape Coast on the map. The cell slides to
 * whichever link the pointer or keyboard focus is on, and back to the current page when it leaves. Without
 * JavaScript the current page keeps its static marker from CSS.
 */
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const list = useRef<HTMLUListElement>(null);
  const marker = useRef<HTMLSpanElement>(null);

  const moveTo = useCallback((link: HTMLElement | null, instant = false) => {
    const cell = marker.current;
    const host = list.current;
    if (!cell || !host) return;
    if (!link) { cell.dataset.shown = 'false'; return; }
    const x = link.getBoundingClientRect().left - host.getBoundingClientRect().left - 12;
    // Arriving on a page places the cell at once; only pointer and focus moves slide it.
    if (instant) cell.style.transition = 'none';
    cell.style.transform = `translateX(${x}px)`;
    cell.dataset.shown = 'true';
    if (instant) { void cell.offsetWidth; cell.style.transition = ''; }
  }, []);
  const toCurrent = useCallback((instant = false) => moveTo(list.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null, instant), [moveTo]);

  useLayoutEffect(() => {
    list.current?.setAttribute('data-marker', 'live');
    toCurrent(true);
    const onResize = () => toCurrent(true);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pathname, toCurrent]);

  return (
    <ul className="nav-links" ref={list} onPointerLeave={() => toCurrent()} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) toCurrent(); }}>
      {links.map(({ href, label }) => {
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? 'page' : undefined}
              className="nav-link"
              onPointerEnter={(event) => moveTo(event.currentTarget)}
              onFocus={(event) => moveTo(event.currentTarget)}
            >
              {label}
            </Link>
          </li>
        );
      })}
      <li aria-hidden="true" className="nav-marker-slot"><span ref={marker} className="nav-marker" data-shown="false" /></li>
    </ul>
  );
}
