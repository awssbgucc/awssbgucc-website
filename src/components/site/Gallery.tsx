'use client';

import Image from 'next/image';
import { PhotoViewer, usePhotoViewer, type ViewerPhoto } from './PhotoViewer';

export type GalleryPhoto = ViewerPhoto & { wide: boolean };

/**
 * Event photos on a four-column grid (two on phones). Upright photos take one column, wide ones two, so every
 * row lines up without cutting off heads. A photo opens in the full-screen viewer, growing out of its thumbnail.
 * Without JavaScript each photo is still a plain link to the full image.
 */
export function Gallery({ photos, title }: { photos: GalleryPhoto[]; title: string }) {
  const viewer = usePhotoViewer(photos.length);
  return (
    <>
      <div className="gallery">
        <ul className="gallery-grid">
          {photos.map((item, index) => (
            <li key={item.src} className={item.wide ? 'gallery-wide' : undefined}>
              <a
                href={item.src}
                onClick={(event) => {
                  event.preventDefault();
                  viewer.open(index, event.currentTarget);
                }}
                className="gallery-thumb"
                aria-label={`Open photo ${index + 1} of ${photos.length}: ${item.alt}`}
              >
                <Image src={item.src} alt={item.alt} fill sizes={item.wide ? '(min-width: 1024px) 600px, 100vw' : '(min-width: 1024px) 300px, 50vw'} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <PhotoViewer photos={photos} index={viewer.index} label={title} onClose={viewer.close} onStep={viewer.step} />
    </>
  );
}
