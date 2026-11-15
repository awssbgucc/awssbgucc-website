'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PhotoViewer, usePhotoViewer, type ViewerPhoto } from '../PhotoViewer';

type ReelPhoto = ViewerPhoto & { wide: boolean; date: string | null };

/**
 * Every approved bootcamp photograph as one strip, oldest first. On wide screens the strip drifts sideways as the
 * page scrolls past, like film through a gate. It is still a normal horizontal scroller: focusing a photo stops the
 * drift so the browser can bring it into view, and under reduced motion or without scroll-driven animation it just
 * scrolls. Each photo opens full screen with its date.
 */
export function PhotoReel({ photos }: { photos: ReelPhoto[] }) {
  const viewer = usePhotoViewer(photos.length);
  return (
    <div className="photo-reel" role="region" aria-label="Bootcamp photographs, oldest first" tabIndex={0}>
      <ol className="reel-track">
        {photos.map((item, index) => (
          <li key={item.src} className={item.wide ? 'reel-wide' : undefined} style={{ '--i': index } as CSSProperties}>
            <button type="button" className="reel-photo" onClick={(event) => viewer.open(index, event.currentTarget)} aria-label={`Open photo ${index + 1} of ${photos.length}: ${item.alt}`}>
              <Image src={item.src} alt={item.alt} fill sizes={item.wide ? '(min-width: 1024px) 532px, 372px' : '(min-width: 1024px) 300px, 210px'} />
            </button>
            {item.date && <p className="type-label reel-date">{item.date}</p>}
          </li>
        ))}
      </ol>
      <PhotoViewer photos={photos} index={viewer.index} label="Bootcamp photographs" onClose={viewer.close} onStep={viewer.step} />
    </div>
  );
}
