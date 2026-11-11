import { describe, expect, it } from 'vitest';
import { isOwnUpload, keyFromUrl, MAX_UPLOAD_BYTES, uploadError, uploadKey } from './rules';

const BASE = 'https://sbg-ucc-uploads.s3.eu-west-1.amazonaws.com';

describe('uploadError', () => {
  it('accepts JPEG, PNG and WebP photos up to 5 MB', () => {
    expect(uploadError('team', 'image/jpeg', 1000)).toBeNull();
    expect(uploadError('events', 'image/png', MAX_UPLOAD_BYTES)).toBeNull();
    expect(uploadError('posts', 'image/webp', 1)).toBeNull();
  });

  it('refuses SVG, GIF and JPEG logos', () => {
    expect(uploadError('partners', 'image/svg+xml', 1000)).toMatch(/PNG or WebP/);
    expect(uploadError('partners', 'image/jpeg', 1000)).toMatch(/PNG or WebP/);
    expect(uploadError('team', 'image/gif', 1000)).toMatch(/JPEG, PNG or WebP/);
    expect(uploadError('team', 'image/svg+xml', 1000)).toMatch(/JPEG, PNG or WebP/);
  });

  it('refuses empty and oversized files', () => {
    expect(uploadError('team', 'image/png', 0)).toMatch(/empty/);
    expect(uploadError('team', 'image/png', 1.5)).toMatch(/empty/);
    expect(uploadError('team', 'image/png', MAX_UPLOAD_BYTES + 1)).toMatch(/over 5 MB/);
  });
});

describe('uploadKey', () => {
  it('follows the folder, record and random layout', () => {
    expect(uploadKey('team', 'seed-team-1', 'image/jpeg', 'abc')).toBe('team/seed-team-1/abc.jpg');
    expect(uploadKey('partners', 'cm123', 'image/webp', 'abc')).toBe('partners/cm123/abc.webp');
  });
});

describe('isOwnUpload', () => {
  const url = `${BASE}/team/seed-team-1/4f1c-9a.jpg`;

  it('accepts a file under the same folder and record', () => {
    expect(isOwnUpload(url, BASE, 'team', 'seed-team-1')).toBe(true);
    expect(isOwnUpload(url, `${BASE}/`, 'team', 'seed-team-1')).toBe(true);
  });

  it('refuses another record, another folder or another host', () => {
    expect(isOwnUpload(url, BASE, 'team', 'seed-team-2')).toBe(false);
    expect(isOwnUpload(url, BASE, 'partners', 'seed-team-1')).toBe(false);
    expect(isOwnUpload('https://example.com/team/seed-team-1/a.jpg', BASE, 'team', 'seed-team-1')).toBe(false);
  });

  it('refuses nested paths, other extensions and query strings', () => {
    expect(isOwnUpload(`${BASE}/team/seed-team-1/x/a.jpg`, BASE, 'team', 'seed-team-1')).toBe(false);
    expect(isOwnUpload(`${BASE}/team/seed-team-1/a.svg`, BASE, 'team', 'seed-team-1')).toBe(false);
    expect(isOwnUpload(`${url}?v=1`, BASE, 'team', 'seed-team-1')).toBe(false);
  });
});

describe('keyFromUrl', () => {
  it('returns the key for our uploads only', () => {
    expect(keyFromUrl(`${BASE}/partners/p1/a-b.png`, BASE)).toBe('partners/p1/a-b.png');
    expect(keyFromUrl('https://example.com/partners/p1/a.png', BASE)).toBeNull();
    expect(keyFromUrl(`${BASE}/other/p1/a.png`, BASE)).toBeNull();
    expect(keyFromUrl(`${BASE}/partners/p1/../a.png`, BASE)).toBeNull();
  });
});
