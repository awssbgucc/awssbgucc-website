'use client';

import Image from 'next/image';
import { PhotoViewer, usePhotoViewer } from './PhotoViewer';

/**
 * Event photos in a strict 3:2 grid. A photo opens in the full-screen viewer, growing out of its thumbnail.
 * Without JavaScript each photo is still a plain link to the full image.
 */
export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const viewer = usePhotoViewer(photos.length);
  const items = photos.map((src, index) => ({ src, alt: `${title}, photo ${index + 1} of ${photos.length}` }));
  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.src} className={index === 0 && photos.length > 4 ? 'col-span-2 row-span-2' : ''}>
            <a
              href={item.src}
              onClick={(event) => {
                event.preventDefault();
                viewer.open(index, event.currentTarget);
              }}
              className="gallery-thumb relative block aspect-[3/2] h-full overflow-hidden rounded-sm bg-card-raised"
            >
              <Image src={item.src} alt={item.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
            </a>
          </li>
        ))}
      </ul>
      <PhotoViewer photos={items} index={viewer.index} label={title} onClose={viewer.close} onStep={viewer.step} />
    </>
  );
}
