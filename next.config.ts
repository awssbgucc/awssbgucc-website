import { createHash } from 'node:crypto';
import type { NextConfig } from 'next';
import { contentSecurityPolicy } from './src/lib/csp';
import { THEME_SCRIPT } from './src/lib/theme';

// Uploaded images are served from the S3 bucket. Read at build time, so the build needs S3_PUBLIC_BASE_URL.
const uploads = process.env.S3_PUBLIC_BASE_URL ? new URL(process.env.S3_PUBLIC_BASE_URL) : null;

// Nothing on the site is framed or uses the camera, microphone or location, so all of it can be refused.
// Refusing frames stops another site loading the dashboard invisibly and steering an admin's clicks.
// HSTS is ignored over plain HTTP, so local work is unaffected.
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

// The Content Security Policy (src/lib/csp.ts). Public pages get the fixed form here; the portal, the dashboard
// and the sign-in pages get a per-request nonce from src/middleware.ts, which reads these two values.
const dev = process.env.NODE_ENV === 'development';
const CSP_UPLOADS_ORIGIN = uploads?.origin ?? '';
const CSP_THEME_HASH = `sha256-${createHash('sha256').update(THEME_SCRIPT).digest('base64')}`;
const PUBLIC_PAGES = '/:path((?!admin(?:/|$)|builder(?:/|$)|sign-in(?:/|$)).*)';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: { CSP_UPLOADS_ORIGIN, CSP_THEME_HASH },
  headers: async () => [
    { source: '/:path*', headers: SECURITY_HEADERS },
    { source: PUBLIC_PAGES, headers: [{ key: 'Content-Security-Policy', value: contentSecurityPolicy({ uploadsOrigin: CSP_UPLOADS_ORIGIN, dev }) }] },
  ],
  // A separate output folder lets a local review build run beside next dev, which owns .next.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // Keep production prerendering within this laptop's memory budget.
  experimental: { cpus: 1 },
  images: {
    remotePatterns: uploads
      ? [{ protocol: 'https', hostname: uploads.hostname, pathname: '/{events,team,partners,posts,projects}/**' }]
      : [],
  },
};

export default nextConfig;
