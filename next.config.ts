import type { NextConfig } from 'next';

// Uploaded images are served from the S3 bucket. Read at build time, so the build needs S3_PUBLIC_BASE_URL.
const uploads = process.env.S3_PUBLIC_BASE_URL ? new URL(process.env.S3_PUBLIC_BASE_URL) : null;

// Nothing on the site is framed or uses the camera, microphone or location, so all of it can be refused.
// Refusing frames stops another site loading the dashboard invisibly and steering an admin's clicks.
// HSTS is ignored over plain HTTP, so local work is unaffected. A script CSP is a separate decision (audit S7).
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: async () => [{ source: '/:path*', headers: SECURITY_HEADERS }],
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
