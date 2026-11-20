import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { withinLimit } from './records';

const key = (name: string) => `int-${randomUUID().slice(0, 8)}-${name}`;
const used: string[] = [];

afterAll(async () => {
  await db.rateLimit.deleteMany({ where: { key: { in: used } } });
});

describe('rate limits', () => {
  it('lets exactly the limit through when many requests arrive at once', async () => {
    const k = key('burst');
    used.push(k);
    const results = await Promise.all(Array.from({ length: 12 }, () => withinLimit(k, 5, 60_000)));
    expect(results.filter(Boolean)).toHaveLength(5);
    expect(await withinLimit(k, 5, 60_000)).toBe(false);
  });

  it('starts a new window once the old one has passed', async () => {
    const k = key('window');
    used.push(k);
    expect(await withinLimit(k, 1, 60_000)).toBe(true);
    expect(await withinLimit(k, 1, 60_000)).toBe(false);
    await db.rateLimit.update({ where: { key: k }, data: { resetAt: new Date(Date.now() - 1000) } });
    expect(await withinLimit(k, 1, 60_000)).toBe(true);
  });
});
