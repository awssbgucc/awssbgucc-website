'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Holds a pixel grid's row fade until it scrolls into view. Without JS, or when
 * it is already in view, the grid plays or shows normally.
 */
export function FadeOnView({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.fade = 'waiting';
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      delete el.dataset.fade;
      observer.disconnect();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
