import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Writes accounts through Better Auth's own adapter, the same calls its Google callback makes,
// and reads back what reached the database.
const run = randomUUID().slice(0, 8);
const userId = `int-${run}-google`;

afterAll(async () => {
  await db.user.deleteMany({ where: { id: userId } });
});

describe('Google accounts', () => {
  it('keeps no provider tokens when an account is created or refreshed at sign-in', async () => {
    await db.user.create({ data: { id: userId, name: 'Token test', email: `${userId}@example.test`, emailVerified: true } });
    const { internalAdapter } = await auth.$context;
    const soon = new Date(Date.now() + 3600_000);
    const tokens = { accessToken: 'access', refreshToken: 'refresh', idToken: 'id', accessTokenExpiresAt: soon, refreshTokenExpiresAt: soon };

    const created = await internalAdapter.createAccount({ userId, providerId: 'google', accountId: `sub-${run}`, scope: 'openid email profile', ...tokens });
    await internalAdapter.updateAccount(created.id, tokens);
    await internalAdapter.linkAccount({ userId, providerId: 'google', accountId: `sub-${run}-2`, ...tokens });

    const rows = await db.account.findMany({ where: { userId }, orderBy: { accountId: 'asc' } });
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toMatchObject({ providerId: 'google', accessToken: null, refreshToken: null, idToken: null, accessTokenExpiresAt: null, refreshTokenExpiresAt: null });
    }
    expect(rows[0]).toMatchObject({ accountId: `sub-${run}`, scope: 'openid email profile' });
  });
});
