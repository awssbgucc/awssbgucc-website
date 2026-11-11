import type { NextConfig } from 'next';

// Uploaded images are served from the S3 bucket. Read at build time, so the build needs S3_PUBLIC_BASE_URL.
const uploads = process.env.S3_PUBLIC_BASE_URL ? new URL(process.env.S3_PUBLIC_BASE_URL) : null;

const nextConfig: NextConfig = {
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
