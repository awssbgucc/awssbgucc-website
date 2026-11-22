import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

afterEach(() => vi.restoreAllMocks());

const report = JSON.stringify({
  'csp-report': {
    'effective-directive': 'script-src-elem',
    'blocked-uri': 'https://evil.example/x.js?token=secret',
    'document-uri': 'https://site.example/builder?q=private',
  },
});

// A streamed body has no Content-Length, as with a chunked request.
function streamed(chunk: string, times: number) {
  let sent = 0;
  const pulled = { count: 0 };
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      pulled.count += 1;
      if (sent++ < times) controller.enqueue(new TextEncoder().encode(chunk));
      else controller.close();
    },
  });
  const request = new Request('http://localhost/api/csp-report', { method: 'POST', body, duplex: 'half' } as RequestInit);
  return { request, pulled };
}

describe('csp report route', () => {
  it('logs the directive, the blocked origin and the page path only', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await POST(new Request('http://localhost/api/csp-report', { method: 'POST', body: report }));
    expect(response.status).toBe(204);
    const line = JSON.parse(log.mock.calls[0][0]);
    expect(line).toMatchObject({ event: 'csp_violation', directive: 'script-src-elem', blocked: 'https://evil.example', page: '/builder' });
    expect(log.mock.calls[0][0]).not.toContain('secret');
    expect(log.mock.calls[0][0]).not.toContain('private');
  });

  it('refuses a large body by its Content-Length', async () => {
    const request = new Request('http://localhost/api/csp-report', {
      method: 'POST',
      body: 'x'.repeat(9_000),
      headers: { 'content-length': '9000' },
    });
    expect((await POST(request)).status).toBe(413);
  });

  it('stops reading a streamed body once it passes the limit', async () => {
    const { request, pulled } = streamed('x'.repeat(1_000), 1_000);
    expect((await POST(request)).status).toBe(413);
    expect(pulled.count).toBeLessThan(15);
  });

  it('reads a streamed report under the limit', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { request } = streamed(report, 1);
    expect((await POST(request)).status).toBe(204);
  });
});
