import { logError } from '@/lib/log';

/**
 * Browsers post here when the Content Security Policy blocks something, so a page broken by the policy after a
 * deploy shows up in the server logs. Only the directive, the blocked origin and the page path are kept: full
 * URLs can carry query strings.
 */
const LIMIT = 8_000;

export async function POST(request: Request) {
  const text = await readUpTo(request, LIMIT);
  if (text === null) return new Response(null, { status: 413 });
  try {
    const body = JSON.parse(text);
    const report = body?.['csp-report'] ?? {};
    logError('csp_violation', {
      directive: String(report['effective-directive'] ?? report['violated-directive'] ?? '').slice(0, 60),
      blocked: originOf(report['blocked-uri']),
      page: pathOf(report['document-uri']),
    });
  } catch {
    // Not a report. Nothing to log.
  }
  return new Response(null, { status: 204 });
}

// Reads the body a chunk at a time and gives up past the limit. A chunked request has no Content-Length,
// so checking the header alone would still read the whole body.
async function readUpTo(request: Request, limit: number) {
  if (Number(request.headers.get('content-length') ?? 0) > limit) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function originOf(value: unknown) {
  const text = String(value ?? '');
  try {
    return new URL(text).origin;
  } catch {
    return text.slice(0, 20); // "inline", "eval", "data"
  }
}

function pathOf(value: unknown) {
  try {
    return new URL(String(value)).pathname.slice(0, 200);
  } catch {
    return '';
  }
}
