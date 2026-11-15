'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PhotoViewer, usePhotoViewer, type ViewerPhoto } from './PhotoViewer';

type WallPhoto = ViewerPhoto & { shape: string };

/** The About page photo wall. Each photo opens full screen, growing out of its place in the wall. */
export function PhotoWall({ photos, label }: { photos: WallPhoto[]; label: string }) {
  const viewer = usePhotoViewer(photos.length);
  return (
    <>
      <div className="photo-wall" data-reveal="steps">
        {photos.map((item, index) => (
          <figure key={item.src} className={`wall-${item.shape}`} style={{ '--i': index } as CSSProperties}>
            <button type="button" className="wall-photo" onClick={(event) => viewer.open(index, event.currentTarget)} aria-label={`Open photo ${index + 1} of ${photos.length}: ${item.alt}`}>
              <Image src={item.src} alt={item.alt} fill sizes="(min-width: 1024px) 33vw, 50vw" />
            </button>
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
      <PhotoViewer photos={photos} index={viewer.index} label={label} onClose={viewer.close} onStep={viewer.step} />
    </>
  );
}
