import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import history from '../../../content/community-history.json';
import manifest from '../../../content/media-manifest.json';
import { DISCIPLINES } from './disciplines';
import { focusFor, photo } from './media';

const slugs = new Set([...history.events.map((e) => `event:${e.slug}`), ...history.posts.map((p) => `post:${p.slug}`)]);

describe('discipline explorer', () => {
  it('links only to records in the reviewed content file', () => {
    for (const d of DISCIPLINES) for (const e of d.evidence) expect(slugs, `${d.id} -> ${e.slug}`).toContain(`${e.kind}:${e.slug}`);
  });

  it('never marks an area covered without evidence and a source', () => {
    for (const d of DISCIPLINES.filter((d) => d.status === 'covered')) {
      expect(d.evidence.length, d.id).toBeGreaterThan(0);
      expect(d.sources.length, d.id).toBeGreaterThan(0);
    }
  });
});

describe('reviewed content', () => {
  it('keeps unpublishable records out of the preview', () => {
    for (const e of history.events) if (!e.meetupUrl) expect(e.review.state, e.slug).toBe('draft-only');
  });

  it('only points events and posts at media that is published', () => {
    for (const record of [...history.events, ...history.posts]) {
      if (record.coverImage) expect(existsSync(`public${record.coverImage}`), record.coverImage).toBe(true);
    }
  });
});

describe('media manifest', () => {
  it('publishes approved flyers and withholds the rest', () => {
    for (const flyer of manifest.flyers) {
      expect(existsSync(`public/media/events/${flyer.id}.webp`), flyer.id).toBe(flyer.status === 'published');
    }
  });

  it('serves only approved photographs, without metadata', () => {
    for (const entry of manifest.photos) {
      expect(photo(entry.id).src).toBe(`/media/community/${entry.id}.webp`);
      // WebP files written by Pillow without exif or xmp carry no EXIF or XMP chunk.
      const bytes = readFileSync(`public/media/community/${entry.id}.webp`).toString('latin1');
      expect(bytes.includes('EXIF') || bytes.includes('XMP '), entry.id).toBe(false);
    }
  });

  it('crops uploads from the centre', () => {
    expect(focusFor('https://bucket.example/events/new.webp')).toBe('50% 50%');
  });
});
