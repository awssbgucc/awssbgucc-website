import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import history from '../../../content/community-history.json';
import manifest from '../../../content/media-manifest.json';
import { MAX_EVENT_PHOTOS } from '@/lib/uploads/rules';
import { DISCIPLINES } from './disciplines';
import { eventPhoto, eventPhotoBySrc, focusFor, photo } from './media';

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

  it('keeps internal process notes out of the public text', () => {
    // Review, consent and verification rules are applied before publishing, not explained to visitors.
    // "Permission errors" on Amazon S3 are lab content, so only "with permission" counts as a process note.
    const internal = /\b(approved|with (the )?permission|consent|verified|reviewed|attendance records?|RSVP totals?)\b/i;
    for (const e of history.events) for (const text of [e.summary, e.body]) expect(text, e.slug).not.toMatch(internal);
    for (const p of history.posts) for (const text of [p.excerpt, p.body]) expect(text, p.slug).not.toMatch(internal);
  });

  it('only points events and posts at media that is published', () => {
    for (const record of [...history.events, ...history.posts]) {
      if (record.coverImage) expect(existsSync(`public${record.coverImage}`), record.coverImage).toBe(true);
    }
  });

  it('gives events only approved photos from their own event, within the gallery limit', () => {
    for (const e of history.events) {
      expect(e.photos.length, e.slug).toBeLessThanOrEqual(MAX_EVENT_PHOTOS);
      expect(new Set(e.photos).size, e.slug).toBe(e.photos.length);
      for (const src of e.photos) {
        expect(existsSync(`public${src}`), src).toBe(true);
        expect(src.startsWith(`/media/events/${e.slug}/`), src).toBe(true);
        expect(eventPhotoBySrc(src), src).not.toBeNull();
      }
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

  it('serves event photos at the listed size, without metadata, under unique ids', () => {
    const ids = [...manifest.photos, ...manifest.eventPhotos].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of manifest.eventPhotos) {
      expect(eventPhoto(entry.id).src).toBe(`/media/events/${entry.event}/${entry.id}.webp`);
      const bytes = readFileSync(`public/media/events/${entry.event}/${entry.id}.webp`);
      // A simple lossy WebP: the VP8 frame header stores width and height in 14 bits each, at bytes 26 and 28.
      expect(bytes.toString('latin1', 12, 16), entry.id).toBe('VP8 ');
      expect([bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff], entry.id).toEqual([entry.width, entry.height]);
      const text = bytes.toString('latin1');
      expect(text.includes('EXIF') || text.includes('XMP ') || text.includes('ICCP'), entry.id).toBe(false);
    }
  });

  it('crops uploads from the centre', () => {
    expect(focusFor('https://bucket.example/events/new.webp')).toBe('50% 50%');
  });
});
