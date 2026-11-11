'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Event photos in a strict 3:2 grid. A photo opens in a viewer with keyboard support.
 * Without JavaScript each photo is still a plain link to the full image.
 */
export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastTrigger.current?.focus();
  }, []);
  const step = useCallback((by: number) => setOpen((index) => (index === null ? null : (index + by + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, step]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {photos.map((url, index) => (
          <li key={url} className={index === 0 && photos.length > 4 ? 'col-span-2 row-span-2' : ''}>
            <a
              href={url}
              onClick={(event) => {
                event.preventDefault();
                lastTrigger.current = event.currentTarget;
                setOpen(index);
              }}
              className="relative block aspect-[3/2] h-full overflow-hidden rounded-sm bg-card-raised"
            >
              <Image src={url} alt={`${title}, photo ${index + 1} of ${photos.length}`} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-opacity duration-150 ease-brand hover:opacity-90" />
            </a>
          </li>
        ))}
      </ul>
      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${title}, photo ${open + 1} of ${photos.length}`} className="fixed inset-0 z-50 flex flex-col bg-bg/95">
          <div className="flex items-center justify-between p-4">
            <p className="type-label text-text-muted">
              {open + 1} / {photos.length}
            </p>
            <button ref={closeRef} type="button" onClick={close} aria-label="Close" className="flex size-11 items-center justify-center text-white">
              <X aria-hidden size={22} />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image src={photos[open]} alt={`${title}, photo ${open + 1} of ${photos.length}`} fill sizes="100vw" className="object-contain" />
          </div>
          {photos.length > 1 && (
            <div className="flex justify-center gap-4 p-4">
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="flex size-12 items-center justify-center rounded-sm border border-border-strong text-white">
                <ChevronLeft aria-hidden size={20} />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className="flex size-12 items-center justify-center rounded-sm border border-border-strong text-white">
                <ChevronRight aria-hidden size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
