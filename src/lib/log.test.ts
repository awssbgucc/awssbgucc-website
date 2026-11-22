import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorMessage, logError } from './log';

afterEach(() => vi.restoreAllMocks());

describe('server logs', () => {
  it('writes one JSON line with the event name', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logError('request_error', { path: '/builder', digest: '123' });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0][0] as string;
    expect(line).not.toContain('\n');
    expect(JSON.parse(line)).toMatchObject({ level: 'error', event: 'request_error', path: '/builder', digest: '123' });
  });

  it('keeps the error name and message, cut short, without the stack', () => {
    const error = new TypeError('x'.repeat(1000));
    const message = errorMessage(error);
    expect(message.startsWith('TypeError: xxx')).toBe(true);
    expect(message).toHaveLength(300);
    expect(errorMessage('plain')).toBe('plain');
  });
});
