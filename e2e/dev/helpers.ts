import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { BrowserContext } from '@playwright/test';
import { Client } from 'pg';

// Helpers for the end-to-end tests. They write to the database, so they only run against a local one.

export const DATABASE_URL = process.env.DATABASE_URL ?? '';

export const isLocalDatabase = (() => {
  try {
    return ['localhost', '127.0.0.1'].includes(new URL(DATABASE_URL).hostname);
  } catch {
    return false;
  }
})();

function authSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const match = readFileSync('.env', 'utf8').match(/^AUTH_SECRET=(.*)$/m);
  if (!match) throw new Error('AUTH_SECRET is not set');
  return match[1].trim().replace(/^"|"$/g, '');
}

export async function sql<T = Record<string, unknown>>(text: string, values: unknown[] = []) {
  if (!isLocalDatabase) throw new Error('Refusing to write to a non-local database');
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    return (await client.query(text, values)).rows as T[];
  } finally {
    await client.end();
  }
}

/** A fresh user, and optionally an onboarded member profile. Returns the user id. */
export async function makeUser(prefix: string, { onboarded = true, email }: { onboarded?: boolean; email?: string } = {}) {
  const id = `e2e-${prefix}-${randomUUID().slice(0, 8)}`;
  await sql('INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, true, now(), now())', [id, `E2E ${prefix}`, email ?? `${id}@example.test`]);
  if (onboarded) {
    await sql(
      'INSERT INTO "MemberProfile" ("userId", handle, "displayName", interests, "referralCode", "onboardedAt", "privacyAcceptedAt", "updatedAt") VALUES ($1, $1, $2, $3, $4, now(), now(), now())',
      [id, `E2E ${prefix}`, [], id.toUpperCase().replace(/-/g, '').slice(0, 20)],
    );
  }
  return id;
}

/** A user whose email is in AdminUser, with an onboarded profile. Returns the user id. */
export async function makeAdmin(prefix: string) {
  const email = `e2e-${prefix}-${randomUUID().slice(0, 8)}@example.test`;
  const userId = await makeUser(prefix, { email });
  await sql(`INSERT INTO "AdminUser" (id, email, role, "createdAt") VALUES ($1, $2, 'ADMIN', now())`, [randomUUID(), email]);
  return userId;
}

/** Signs the browser context in as a user, with a session row and a signed cookie like Better Auth's. */
export async function signIn(context: BrowserContext, userId: string, baseURL: string) {
  const token = randomBytes(24).toString('base64url');
  await sql('INSERT INTO "session" (id, "expiresAt", token, "createdAt", "updatedAt", "userId") VALUES ($1, now() + interval \'1 day\', $2, now(), now(), $3)', [randomUUID(), token, userId]);
  const signature = createHmac('sha256', authSecret()).update(token).digest('base64');
  await context.addCookies([{ name: 'better-auth.session_token', value: encodeURIComponent(`${token}.${signature}`), url: baseURL }]);
}

export async function cleanUp() {
  await sql(`DELETE FROM "user" WHERE id LIKE 'e2e-%'`);
  await sql(`DELETE FROM "Event" WHERE id LIKE 'e2e-%' OR slug LIKE 'e2e-%'`);
  await sql(`DELETE FROM "Challenge" WHERE id LIKE 'e2e-%'`);
  await sql(`DELETE FROM "Reward" WHERE id LIKE 'e2e-%'`);
  await sql(`DELETE FROM "TeamMember" WHERE name LIKE 'E2E %'`);
  await sql(`DELETE FROM "AdminUser" WHERE email LIKE 'e2e-%'`);
  // Audit rows have no foreign keys, so nothing above removes them.
  await sql(`DELETE FROM "AuditLog" WHERE "actorEmail" LIKE 'e2e-%' OR "entityId" LIKE 'e2e-%'`);
}
