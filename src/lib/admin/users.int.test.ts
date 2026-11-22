import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { runsConcurrently } from '@/test/int-fixtures';
import { changeAccess } from './users';

// The "at least one admin" rule only bites when these are the only admins, so the race runs
// only on a real PostgreSQL server with no other admin rows (a fresh test database).
const concurrent = await runsConcurrently();
const otherAdmins = await db.adminUser.count({ where: { role: 'ADMIN' } });
const run = randomUUID().slice(0, 8);
const email = (name: string) => `int-${run}-${name}@example.test`;

afterAll(async () => {
  await db.adminUser.deleteMany({ where: { email: { startsWith: `int-${run}` } } });
  await db.auditLog.deleteMany({ where: { actorEmail: { startsWith: `int-${run}` } } });
});

async function twoAdmins(round: number) {
  const [a, b] = await Promise.all(['a', 'b'].map((name) => db.adminUser.create({ data: { email: email(`${name}${round}`), role: 'ADMIN' } })));
  return { a, b };
}

async function reset() {
  await db.adminUser.deleteMany({ where: { email: { startsWith: `int-${run}` } } });
}

describe('changing dashboard access', () => {
  it('records the change in the audit log', async () => {
    const { a, b } = await twoAdmins(0);
    await changeAccess(a.email, b.id, 'EDITOR');
    expect((await db.adminUser.findUniqueOrThrow({ where: { id: b.id } })).role).toBe('EDITOR');
    expect(await db.auditLog.count({ where: { action: 'admin.role', entityId: b.id } })).toBe(1);
    await changeAccess(a.email, b.id, null);
    expect(await db.adminUser.count({ where: { id: b.id } })).toBe(0);
    expect(await db.auditLog.count({ where: { action: 'admin.remove', entityId: b.id } })).toBe(1);
    await reset();
  });

  it.skipIf(!concurrent || otherAdmins > 0)('two admins demoting or removing each other at once leave one admin', async () => {
    for (const round of [1, 2, 3, 4, 5]) {
      const { a, b } = await twoAdmins(round);
      const results = await Promise.allSettled([changeAccess(a.email, b.id, round % 2 ? 'EDITOR' : null), changeAccess(b.email, a.id, 'EDITOR')]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await db.adminUser.count({ where: { role: 'ADMIN' } })).toBe(1);
      await reset();
    }
  });
});
