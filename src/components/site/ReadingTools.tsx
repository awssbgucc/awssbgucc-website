'use client';

import { Check, Link2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { HeadingItem } from '@/lib/content/reading';

/** Fixed 3px scroll progress indicator across the top of the viewport while reading an article. */
export function ReadingProgress() {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const article = rootRef.current?.closest('article');
      let ratio = 0;
      if (article) {
        const rect = article.getBoundingClientRect();
        const scrollable = Math.max(1, article.offsetHeight - window.innerHeight * 0.6);
        const travelled = Math.max(0, 80 - rect.top);
        ratio = Math.min(1, travelled / scrollable);
      } else {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        ratio = Math.min(1, Math.max(0, window.scrollY / max));
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="reading-progress" aria-hidden="true">
      <div ref={fillRef} className="reading-progress-bar" />
    </div>
  );
}

/** Copies the current article URL to the clipboard with polite status feedback. */
export function SharePostButton() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    timerRef.current = window.setTimeout(() => setStatus('idle'), 2500);
  }

  const label = status === 'copied' ? 'Link copied' : status === 'error' ? 'Unable to copy link' : 'Copy link';

  return (
    <button type="button" onClick={handleCopy} className="reading-share-btn">
      {status === 'copied' ? <Check size={15} aria-hidden /> : <Link2 size={15} aria-hidden />}
      <span>{label}</span>
      <span className="sr-only" role="status">
        {status === 'copied' ? 'Article link copied to clipboard.' : status === 'error' ? 'Could not copy link.' : ''}
      </span>
    </button>
  );
}

/** Sticky desktop table of contents that highlights the active section heading. */
export function ReadingToc({ headings }: { headings: HeadingItem[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '');

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const firstVisible = headings.find((h) => visible.has(h.id));
        if (firstVisible) setActiveId(firstVisible.id);
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="On this page" className="reading-toc">
      <p className="type-label text-text-muted">On this page</p>
      <ol className="reading-toc-list">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'reading-toc-sub' : undefined}>
            <a href={`#${h.id}`} aria-current={activeId === h.id ? 'location' : undefined} onClick={() => setActiveId(h.id)}>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
