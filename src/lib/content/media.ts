import manifest from '../../../content/media-manifest.json';
import { formatDate } from '@/lib/format';

// Approved photographs and flyers, prepared by scripts/prepare-media.py. Provenance and consent live in the manifest.

export type Photo = { src: string; alt: string; width: number; height: number };

const WIDE_PHOTOS = new Set(['classroom']);

export type PhotoId = (typeof manifest.photos)[number]['id'];

export function photo(id: PhotoId): Photo {
  const entry = manifest.photos.find((p) => p.id === id);
  if (!entry || entry.consent !== 'approved') throw new Error(`Photo ${id} is not approved for publication.`);
  return WIDE_PHOTOS.has(id)
    ? { src: `/media/community/${id}.webp`, alt: entry.alt, width: 1920, height: 1440 }
    : { src: `/media/community/${id}.webp`, alt: entry.alt, width: 1200, height: 1600 };
}

/**
 * Where to crop an image when it cannot show whole, for example a flyer as a list thumbnail.
 * Uploaded images have no entry and crop from the centre.
 */
const FOCUS: Record<string, string> = {
  '/media/events/launch.webp': '60% 50%',
  '/media/events/career.webp': '84% 42%',
  '/media/events/code-to-cloud.webp': '50% 40%',
  '/media/events/freshers.webp': '30% 45%',
  '/media/events/zero-to-cloud.webp': '50% 45%',
  '/media/community/website-on-screen.webp': '62% 55%',
  '/media/community/classroom.webp': '55% 40%',
};

export function focusFor(src: string | null | undefined) {
  return (src && FOCUS[src]) || '50% 50%';
}

/** The day a photo was taken, from the camera's file name (IMG/20261031_185639.jpg), as "Sat 31 Oct 2026". */
export function photoDate(id: PhotoId) {
  const entry = manifest.photos.find((p) => p.id === id);
  const match = entry?.source.match(/(\d{4})(\d{2})(\d{2})_/);
  if (!match) return null;
  const [, y, m, d] = match;
  return formatDate(new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12)));
}

/** Every approved photo, oldest first by file name. */
export function allPhotos() {
  return manifest.photos.filter((p) => p.consent === 'approved').sort((a, b) => a.source.localeCompare(b.source)).map((p) => p.id as PhotoId);
}
