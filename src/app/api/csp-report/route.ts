import { logError } from '@/lib/log';

/**
 * Browsers post here when the Content Security Policy blocks something, so a page broken by the policy after a
 * deploy shows up in the server logs. Only the directive, the blocked origin and the page path are kept: full
 * URLs can carry query strings.
 */
export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > 8_000) return new Response(null, { status: 413 });
  try {
    const body = JSON.parse((await request.text()).slice(0, 8_000));
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
