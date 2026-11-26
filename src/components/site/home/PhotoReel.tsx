'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Container } from '@/components/ui/Container';
import { PhotoViewer, usePhotoViewer, type ViewerPhoto } from '../PhotoViewer';

type ReelPhoto = ViewerPhoto & { wide: boolean; date: string | null };

/**
 * Horizontal photo strip with dedicated Previous/Next controls, arrow-key navigation and native touch/trackpad
 * scrolling. Clicking any photograph opens the full-screen viewer.
 */
export function PhotoReel({ photos, label }: { photos: ReelPhoto[]; label: string }) {
  const viewer = usePhotoViewer(photos.length);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(photos.length > 1);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncScrollState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const left = scroller.scrollLeft;
    setCanPrev(left > 4);
    setCanNext(left < maxScroll - 4);

    const track = trackRef.current;
    if (!track || track.children.length === 0) return;

    const origin = (track.children[0] as HTMLElement).offsetLeft;
    let closest = 0;
    let smallestDiff = Number.POSITIVE_INFINITY;
    for (let i = 0; i < track.children.length; i += 1) {
      const child = track.children[i] as HTMLElement;
      const diff = Math.abs(child.offsetLeft - origin - left);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closest = i;
      }
    }
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    syncScrollState();
    window.addEventListener('resize', syncScrollState);
    return () => window.removeEventListener('resize', syncScrollState);
  }, [syncScrollState, photos.length]);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distance = Math.max(260, Math.round(scroller.clientWidth * 0.78));
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollBy({ left: direction * distance, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (viewer.index !== null) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByStep(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByStep(-1);
    }
  };

  return (
    <div className="reel-shell">
      <Container>
        <div className="reel-bar">
          <div className="reel-meta">
            <span className="type-label text-lime" aria-live="polite">
              {String(activeIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>
            <span className="reel-hint">Use arrows or swipe horizontally, or select any photo to enlarge</span>
          </div>
          {photos.length > 1 && (
            <div className="reel-controls">
              <button
                type="button"
                onClick={() => scrollByStep(-1)}
                disabled={!canPrev}
                aria-label="Previous photos"
                className="reel-nav-btn"
              >
                <ChevronLeft aria-hidden size={20} />
              </button>
              <button
                type="button"
                onClick={() => scrollByStep(1)}
                disabled={!canNext}
                aria-label="Next photos"
                className="reel-nav-btn"
              >
                <ChevronRight aria-hidden size={20} />
              </button>
            </div>
          )}
        </div>
      </Container>

      <div
        ref={scrollerRef}
        className="photo-reel"
        role="region"
        aria-label={`${label}, oldest first`}
        tabIndex={0}
        onScroll={syncScrollState}
        onKeyDown={handleKeyDown}
      >
        <ol ref={trackRef} className="reel-track">
          {photos.map((item, index) => (
            <li key={item.src} className={item.wide ? 'reel-wide' : undefined} style={{ '--i': index } as CSSProperties}>
              <button
                type="button"
                className="reel-photo"
                onClick={(event) => viewer.open(index, event.currentTarget)}
                aria-label={`Open photo ${index + 1} of ${photos.length}: ${item.alt}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={item.wide ? '(min-width: 1024px) 532px, 372px' : '(min-width: 1024px) 300px, 210px'}
                />
              </button>
              {item.date && <p className="type-label reel-date">{item.date}</p>}
            </li>
          ))}
        </ol>
        <PhotoViewer photos={photos} index={viewer.index} label={label} onClose={viewer.close} onStep={viewer.step} />
      </div>
    </div>
  );
}
