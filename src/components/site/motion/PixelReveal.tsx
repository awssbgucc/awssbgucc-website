import type { CSSProperties } from 'react';
import previews from '../../../../content/pixel-previews.json';
import type { PhotoId } from '@/lib/content/media';

const LEVELS = previews as Record<string, string[]>;

/**
 * Pixel to picture: three tiny versions of a photo stacked over it, coarsest on top. The first is mapped to the official
 * SBG colours, so each photo starts as a brand panel and resolves into the people in it. Pure CSS, so it plays before
 * hydration. The layers are hidden by default and shown only by the animation, so without motion the photo shows at once.
 * The data comes from scripts/pixel-previews.py, about 2 KB per photo.
 */
export function PixelReveal({ id, position = '50% 50%', delay = 0 }: { id: PhotoId; position?: string; delay?: number }) {
  const levels = LEVELS[id];
  if (!levels) return null;
  return (
    <span className="pixel-reveal" aria-hidden="true" style={{ '--px-delay': `${delay}ms` } as CSSProperties}>
      {levels.map((src, level) => (
        // Plain img: these are inline data URLs a few hundred bytes long, so next/image adds nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={level} src={src} alt="" className={`pixel-level pixel-level-${level}`} style={{ objectPosition: position }} />
      ))}
    </span>
  );
}
