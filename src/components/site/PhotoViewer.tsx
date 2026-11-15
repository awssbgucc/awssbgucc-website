'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { withViewTransition } from '@/lib/motion';

export type ViewerPhoto = { src: string; alt: string; caption?: string };

/**
 * Full-screen photo viewer on a native modal dialog, so focus stays inside and Escape closes it. Arrow keys and a
 * horizontal swipe move between photos. The caller animates opening, closing and stepping with a view transition, so
 * the photo grows out of its thumbnail; this component only renders the open state.
 */
export function PhotoViewer({ photos, index, label, onClose, onStep }: { photos: ViewerPhoto[]; index: number | null; label: string; onClose: () => void; onStep: (by: number) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;

  // Layout effect, so the dialog is already open when a view transition captures the new state.
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onStep(1);
      if (event.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onStep]);

  const photo = index === null ? null : photos[index];
  return (
    <dialog
      ref={dialog}
      aria-label={photo ? `${label}, photo ${index! + 1} of ${photos.length}` : label}
      className="photo-viewer"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
    >
      {photo && (
        <>
          <div className="photo-viewer-top">
            <p className="type-label text-text-muted" aria-live="polite">{index! + 1} / {photos.length}</p>
            <button type="button" onClick={onClose} aria-label="Close" className="photo-viewer-button" autoFocus>
              <X aria-hidden size={22} />
            </button>
          </div>
          <div
            className="photo-viewer-stage"
            onPointerDown={(event) => { swipe.current = { x: event.clientX, y: event.clientY }; }}
            onPointerUp={(event) => {
              const start = swipe.current;
              swipe.current = null;
              if (!start) return;
              const dx = event.clientX - start.x;
              if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(event.clientY - start.y)) onStep(dx < 0 ? 1 : -1);
            }}
          >
            <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="100vw" className="photo-viewer-image" />
          </div>
          <div className="photo-viewer-foot">
            <p className="photo-viewer-caption">{photo.caption ?? photo.alt}</p>
            {photos.length > 1 && (
              <div className="photo-viewer-steps">
                <button type="button" onClick={() => onStep(-1)} aria-label="Previous photo" className="photo-viewer-button">
                  <ChevronLeft aria-hidden size={20} />
                </button>
                <button type="button" onClick={() => onStep(1)} aria-label="Next photo" className="photo-viewer-button">
                  <ChevronRight aria-hidden size={20} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}

/** Open, step and close with the photo growing out of its thumbnail, and focus returning to it afterwards. */
export function usePhotoViewer(count: number) {
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  // The photo morphs back into its thumbnail only if it is still the photo that was opened.
  const morph = useRef(true);
  const thumb = () => (morph.current ? trigger.current?.querySelector('img') ?? null : null);

  const open = useCallback((at: number, from: HTMLElement) => {
    trigger.current = from;
    morph.current = true;
    const image = thumb();
    if (image) image.style.viewTransitionName = 'vt-photo';
    withViewTransition(() => {
      if (image) image.style.viewTransitionName = '';
      setIndex(at);
    }, 'photo');
  }, []);

  const close = useCallback(() => {
    const image = thumb();
    withViewTransition(() => {
      setIndex(null);
      if (image) image.style.viewTransitionName = 'vt-photo';
    }, 'photo');
    window.setTimeout(() => { if (image) image.style.viewTransitionName = ''; }, 600);
    trigger.current?.focus();
  }, []);

  const step = useCallback((by: number) => {
    morph.current = false;
    withViewTransition(() => setIndex((at) => (at === null ? null : (at + by + count) % count)), 'photo-step');
  }, [count]);

  return { index, open, close, step };
}
