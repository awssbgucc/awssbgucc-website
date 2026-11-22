import { NextResponse, type NextRequest } from 'next/server';
import { contentSecurityPolicy, makeNonce } from '@/lib/csp';

/**
 * The strict policy for pages that render per request (see src/lib/csp.ts). Next reads the nonce from the
 * request's policy header and adds it to its own scripts. The two values come from next.config.ts at build time.
 */
export function middleware(request: NextRequest) {
  const policy = contentSecurityPolicy({
    nonce: makeNonce(),
    uploadsOrigin: process.env.CSP_UPLOADS_ORIGIN,
    themeHash: process.env.CSP_THEME_HASH,
    dev: process.env.NODE_ENV === 'development',
  });
  const headers = new Headers(request.headers);
  headers.set('content-security-policy', policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('content-security-policy', policy);
  return response;
}

// Kept in step with PROTECTED_MATCHER in src/lib/csp.ts; Next needs the list written out here.
export const config = { matcher: ['/admin/:path*', '/builder/:path*', '/sign-in'] };
