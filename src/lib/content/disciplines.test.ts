import { describe, expect, it } from 'vitest';
import { boardRecords, DISCIPLINES } from './disciplines';

const day = (iso: string) => new Date(`${iso}T09:00:00Z`);

describe('boardRecords', () => {
  const events = [
    { slug: 'from-code-to-cloud', title: 'From Code to Cloud: deploy your portfolio', startsAt: day('2026-11-14') },
    { slug: 'aws-sbg-ucc-launch', title: 'AWS SBG UCC Launch', startsAt: day('2026-08-22') },
    { slug: 'not-on-the-board', title: 'Something else', startsAt: day('2026-09-01') },
  ];
  const posts = [
    { slug: 'first-website-on-amazon-s3', title: 'Our first website on Amazon S3', publishedAt: day('2026-11-01') },
    { slug: 'certifications-are-part-of-the-path', title: 'Certifications are part of the path', publishedAt: null },
  ];

  it('keeps only records an area points at, dated ones oldest first, undated stories last', () => {
    const records = boardRecords(DISCIPLINES, events, posts);
    expect(records.map((r) => r.key)).toEqual([
      'event:aws-sbg-ucc-launch',
      'post:first-website-on-amazon-s3',
      'event:from-code-to-cloud',
      'post:certifications-are-part-of-the-path',
    ]);
    expect(records.at(-1)?.date).toBeNull();
  });

  it('shortens event titles at the colon', () => {
    const records = boardRecords(DISCIPLINES, events, posts);
    expect(records.find((r) => r.slug === 'from-code-to-cloud')?.title).toBe('From Code to Cloud');
  });

  it('returns nothing when nothing is published', () => {
    expect(boardRecords(DISCIPLINES, [], [])).toEqual([]);
  });
});
