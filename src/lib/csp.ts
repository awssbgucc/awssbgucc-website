// The Content Security Policy, in two forms.
//
// Public pages are built ahead and refreshed every 60 seconds, so everyone gets the same HTML and it cannot carry
// a per-request nonce. Scripts there may come from this site only, inline included.
//
// The portal, the dashboard and the sign-in pages render on every request. src/middleware.ts gives each response
// a nonce, and only scripts carrying it (and the scripts they load) may run, plus the theme script by its hash.
// An injected <script> on those pages does nothing.
//
// Both forms allow images, fonts and requests from this site, and the uploads bucket for images and the
// browser's presigned PUT. Nothing may frame the site, submit a form elsewhere or load a plugin.

export const PROTECTED_MATCHER = ['/admin/:path*', '/builder/:path*', '/sign-in'];

export const REPORT_PATH = '/api/csp-report';

type Options = {
  /** The S3 bucket's origin, from S3_PUBLIC_BASE_URL. */
  uploadsOrigin?: string | null;
  /** Set for per-request pages. Without it, the public form. */
  nonce?: string;
  /** "sha256-..." of THEME_SCRIPT, allowed beside the nonce. */
  themeHash?: string;
  /** next dev needs eval for fast refresh and a websocket for reloads. */
  dev?: boolean;
};

export function contentSecurityPolicy({ uploadsOrigin, nonce, themeHash, dev = false }: Options) {
  const uploads = uploadsOrigin ? [uploadsOrigin] : [];
  const scripts = nonce ? [`'nonce-${nonce}'`, "'strict-dynamic'", ...(themeHash ? [`'${themeHash}'`] : [])] : ["'self'", "'unsafe-inline'"];
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': dev ? [...scripts, "'unsafe-eval'"] : scripts,
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', ...uploads],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...uploads, ...(dev ? ['ws:'] : [])],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'report-uri': [REPORT_PATH],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

/** A random nonce for one response. Works in the Edge runtime, where middleware runs. */
export function makeNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
