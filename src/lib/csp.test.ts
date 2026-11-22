import { afterEach, describe, expect, it, vi } from 'vitest';
import { config } from '@/middleware';
import { contentSecurityPolicy, makeNonce, PROTECTED_MATCHER } from './csp';

const BUCKET = 'https://sbg-ucc-uploads.s3.eu-west-1.amazonaws.com';
const directive = (policy: string, name: string) => policy.split('; ').find((d) => d.startsWith(`${name} `)) ?? '';

afterEach(() => vi.unstubAllEnvs());

describe('content security policy', () => {
  it('limits public pages to scripts from this site, the bucket for images and uploads, and no framing', () => {
    const policy = contentSecurityPolicy({ uploadsOrigin: BUCKET });
    expect(directive(policy, 'script-src')).toBe("script-src 'self' 'unsafe-inline'");
    expect(directive(policy, 'img-src')).toBe(`img-src 'self' data: ${BUCKET}`);
    expect(directive(policy, 'connect-src')).toBe(`connect-src 'self' ${BUCKET}`);
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).not.toContain('unsafe-eval');
  });

  it('lets only nonced scripts and the theme script run on per-request pages', () => {
    const policy = contentSecurityPolicy({ uploadsOrigin: BUCKET, nonce: 'abc', themeHash: 'sha256-xyz' });
    expect(directive(policy, 'script-src')).toBe("script-src 'nonce-abc' 'strict-dynamic' 'sha256-xyz'");
  });

  it('allows eval and the reload socket only in development', () => {
    const policy = contentSecurityPolicy({ nonce: 'abc', dev: true });
    expect(directive(policy, 'script-src')).toContain("'unsafe-eval'");
    expect(directive(policy, 'connect-src')).toBe("connect-src 'self' ws:");
  });

  it('makes a fresh nonce each time', () => {
    const nonces = new Set(Array.from({ length: 50 }, makeNonce));
    expect(nonces.size).toBe(50);
    for (const nonce of nonces) expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
  });

  it('runs the middleware on exactly the per-request pages', () => {
    expect(config.matcher).toEqual(PROTECTED_MATCHER);
  });

  it('allows the host the browser sends presigned uploads to', async () => {
    vi.stubEnv('S3_BUCKET', 'sbg-ucc-uploads');
    vi.stubEnv('S3_REGION', 'eu-west-1');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'test-only');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-only');
    const { presignUpload } = await import('./uploads/s3');
    const url = new URL(await presignUpload('projects/p1/x.png', 'image/png', 1000));
    expect(directive(contentSecurityPolicy({ uploadsOrigin: BUCKET }), 'connect-src')).toContain(url.origin);
  });
});
