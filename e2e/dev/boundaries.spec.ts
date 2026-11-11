import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { cleanUp, isLocalDatabase, makeAdmin, makeUser, signIn, sql } from './helpers';

// Permission, privacy and money boundaries, checked through the real pages and routes.
// Like journeys.spec.ts, every record has an e2e- prefix and is removed afterwards.

test.skip(!isLocalDatabase, 'These tests write data, so they run only against a local database.');
test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'One run is enough.'));
test.afterAll(async () => {
  if (isLocalDatabase) await cleanUp();
});

const HOUR = 60 * 60 * 1000;

async function makeChallenge() {
  const id = `e2e-challenge-${randomUUID().slice(0, 8)}`;
  await sql(
    `INSERT INTO "Challenge" (id, slug, title, summary, brief, requirements, "startsAt", "endsAt", status, xp, credits, "maxScore", "leaderboardEnabled", "createdAt", "updatedAt")
     VALUES ($1, $1, 'E2E boundary challenge', 'Summary', 'Brief', 'Requirements', now() - interval '1 day', now() + interval '1 day', 'PUBLISHED', 40, 4, 100, true, now(), now())`,
    [id],
  );
  return id;
}

async function makeSubmission(challengeId: string, userId: string, repoUrl: string) {
  const id = `e2e-submission-${randomUUID().slice(0, 8)}`;
  await sql(`INSERT INTO "Submission" (id, "challengeId", "userId", "repoUrl", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, 'PENDING', now(), now())`, [id, challengeId, userId, repoUrl]);
  return id;
}

test('a rejected submission pays nothing, and the member reads why', async ({ browser, baseURL }) => {
  const memberId = await makeUser('rejected');
  const challengeId = await makeChallenge();
  const submissionId = await makeSubmission(challengeId, memberId, 'https://github.com/example/rejected');

  const admin = await browser.newContext();
  await signIn(admin, await makeAdmin('rejecter'), baseURL!);
  const adminPage = await admin.newPage();
  await adminPage.goto(`/admin/submissions/${submissionId}`);
  await adminPage.getByLabel('Decision').selectOption('REJECTED');
  await adminPage.getByRole('button', { name: 'Save review' }).click();
  await expect(adminPage.getByText('Say what to change, so the member can act on it.')).toBeVisible();
  await adminPage.getByLabel('Feedback for the member').fill('The repository is empty.');
  await adminPage.getByRole('button', { name: 'Save review' }).click();
  await expect(adminPage).toHaveURL(/\/admin\/submissions$/);

  const member = await browser.newContext();
  await signIn(member, memberId, baseURL!);
  const memberPage = await member.newPage();
  await memberPage.goto(`/builder/challenges/${challengeId}`);
  await expect(memberPage.getByText('The repository is empty.').first()).toBeVisible();

  const ledger = await sql(`SELECT 1 FROM "LedgerEntry" WHERE "userId" = $1`, [memberId]);
  expect(ledger).toHaveLength(0);
  const audit = await sql(`SELECT 1 FROM "AuditLog" WHERE action = 'submission.rejected' AND "entityId" = $1`, [submissionId]);
  expect(audit).toHaveLength(1);
  await admin.close();
  await member.close();
});

test('a member reaches only their own records', async ({ page, context, baseURL, request }) => {
  const otherId = await makeUser('other');
  const projectId = `e2e-project-${randomUUID().slice(0, 8)}`;
  await sql(
    `INSERT INTO "Project" (id, slug, title, summary, stack, status, "ownerId", "createdAt", "updatedAt") VALUES ($1, $1, 'E2E someone else''s draft', 'Private', '{}', 'DRAFT', $2, now(), now())`,
    [projectId, otherId],
  );
  const challengeId = await makeChallenge();
  await makeSubmission(challengeId, otherId, 'https://github.com/example/not-yours');

  // Signed out, the data download and the upload route refuse.
  expect((await request.get('/api/me/export')).status()).toBe(401);

  const memberId = await makeUser('nosy');
  await signIn(context, memberId, baseURL!);
  expect((await page.goto(`/builder/projects/${projectId}`))?.status()).toBe(404);
  await page.goto(`/builder/challenges/${challengeId}`);
  await expect(page.getByText('not-yours')).toHaveCount(0);

  const exported = await page.request.get('/api/me/export');
  expect(exported.status()).toBe(200);
  expect(exported.headers()['cache-control']).toContain('no-store');
  const text = await exported.text();
  expect(JSON.parse(text).account.email).toBe(`${memberId}@example.test`);
  expect(text).not.toContain(otherId);
  expect(text).not.toContain('not-yours');

  for (const data of [
    { folder: 'projects', recordId: projectId, type: 'image/png', size: 1000 },
    { folder: 'team', recordId: 'seed-team-1', type: 'image/png', size: 1000 },
  ]) {
    const response = await page.request.post('/api/uploads', { data });
    expect(response.status()).toBe(401);
    expect(await response.json()).not.toHaveProperty('uploadUrl');
  }
});

test('wrong check-in codes are limited, and the limit holds for the right code too', async ({ page, context, baseURL }) => {
  const userId = await makeUser('guesser');
  const eventId = `e2e-event-${randomUUID().slice(0, 8)}`;
  const now = Date.now();
  await sql(
    `INSERT INTO "Event" (id, slug, title, tag, format, "startsAt", "endsAt", venue, summary, body, "meetupUrl", photos, status, "checkInCode", "checkInOpensAt", "checkInClosesAt", "createdAt", "updatedAt")
     VALUES ($1, $1, 'E2E guessed session', 'BUILD', 'IN_PERSON', $2, $3, 'Test lab', 'Summary', 'Body', 'https://www.meetup.com/x', '{}', 'PUBLISHED', 'RIGHT7', $4, $5, now(), now())`,
    [eventId, new Date(now - HOUR), new Date(now + HOUR), new Date(now - 2 * HOUR), new Date(now + 2 * HOUR)],
  );
  await signIn(context, userId, baseURL!);
  await page.goto(`/builder/check-in?event=${eventId}`);
  const alert = page.getByRole('main').getByRole('alert');
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    await page.getByLabel('Code').fill(`WRONG${attempt}`);
    await page.getByRole('button', { name: 'Check in' }).click();
    await expect(alert).toContainText('does not match');
    // The message is the same each time, so wait for the button to settle before the next try.
    await expect(page.getByRole('button', { name: 'Check in' })).toBeEnabled();
  }
  await page.getByLabel('Code').fill('RIGHT7');
  await page.getByRole('button', { name: 'Check in' }).click();
  await expect(alert).toContainText('Too many attempts');
  const rows = await sql(`SELECT 1 FROM "CheckIn" WHERE "userId" = $1`, [userId]);
  expect(rows).toHaveLength(0);
});

test('an admin suspension ends the member session and is audited', async ({ browser, baseURL }) => {
  const memberId = await makeUser('to-suspend');
  const member = await browser.newContext();
  await signIn(member, memberId, baseURL!);
  const memberPage = await member.newPage();
  await memberPage.goto('/builder');
  await expect(memberPage).toHaveURL(/\/builder$/);

  const admin = await browser.newContext();
  await signIn(admin, await makeAdmin('suspender'), baseURL!);
  const adminPage = await admin.newPage();
  await adminPage.goto(`/admin/members/${memberId}`);
  await adminPage.getByRole('button', { name: 'Suspend member' }).click();
  await expect(adminPage.getByRole('button', { name: 'Reactivate member' })).toBeVisible();

  await memberPage.goto('/builder');
  await expect(memberPage).toHaveURL(/\/sign-in/);
  expect((await memberPage.request.get('/api/me/export')).status()).toBe(401);
  const audit = await sql(`SELECT 1 FROM "AuditLog" WHERE action = 'member.suspend' AND "entityId" = $1`, [memberId]);
  expect(audit).toHaveLength(1);
  await admin.close();
  await member.close();
});

test('an admin refund returns the credits once and takes the reward off the profile', async ({ browser, baseURL }) => {
  const memberId = await makeUser('refunded');
  await sql(`INSERT INTO "LedgerEntry" (id, "userId", credits, reason, "sourceId", note, "createdAt") VALUES ($1, $2, 100, 'ADJUSTMENT', $1, 'test', now())`, [randomUUID(), memberId]);
  const rewardId = `e2e-reward-${randomUUID().slice(0, 8)}`;
  await sql(
    `INSERT INTO "Reward" (id, slug, name, description, kind, cost, "perMemberLimit", available, value, "order", "createdAt", "updatedAt") VALUES ($1, $1, 'E2E refund banner', 'Test', 'BANNER', 60, 1, true, 'tide', 99, now(), now())`,
    [rewardId],
  );
  const member = await browser.newContext();
  await signIn(member, memberId, baseURL!);
  const memberPage = await member.newPage();
  await memberPage.goto('/builder/rewards');
  const card = memberPage.getByRole('listitem').filter({ hasText: 'E2E refund banner' });
  await card.getByRole('button', { name: 'Redeem' }).click();
  await card.getByRole('button', { name: 'Spend 60 credits' }).click();
  await expect(card.getByRole('status')).toHaveText('Redeemed');
  await memberPage.goto('/builder/profile');
  await memberPage.getByRole('button', { name: 'Tide' }).click();
  await expect(memberPage.getByRole('button', { name: 'Tide' })).toHaveAttribute('aria-pressed', 'true');

  const admin = await browser.newContext();
  await signIn(admin, await makeAdmin('refunder'), baseURL!);
  const adminPage = await admin.newPage();
  await adminPage.goto('/admin/rewards');
  const row = adminPage.getByRole('row').filter({ hasText: 'E2E refund banner' });
  await row.getByRole('button', { name: 'Cancel and refund' }).click();
  await row.getByRole('button', { name: 'Yes, cancel and refund' }).click();
  await expect(row.getByText('Cancelled')).toBeVisible();
  await expect(row.getByRole('button', { name: 'Cancel and refund' })).toHaveCount(0);

  const balance = await sql<{ sum: string }>(`SELECT sum(credits) FROM "LedgerEntry" WHERE "userId" = $1`, [memberId]);
  expect(Number(balance[0].sum)).toBe(100);
  const refunds = await sql(`SELECT 1 FROM "LedgerEntry" WHERE "userId" = $1 AND reason = 'REFUND'`, [memberId]);
  expect(refunds).toHaveLength(1);
  const [profile] = await sql<{ bannerKey: string }>(`SELECT "bannerKey" FROM "MemberProfile" WHERE "userId" = $1`, [memberId]);
  expect(profile.bannerKey).not.toBe('tide');
  const [{ id: redemptionId }] = await sql<{ id: string }>(`SELECT id FROM "Redemption" WHERE "userId" = $1`, [memberId]);
  const audit = await sql(`SELECT 1 FROM "AuditLog" WHERE action = 'redemption.cancel' AND "entityId" = $1`, [redemptionId]);
  expect(audit).toHaveLength(1);
  await admin.close();
  await member.close();
});

test('a member downloads their data, then deletes their account', async ({ page, context, baseURL }) => {
  const userId = await makeUser('leaving');
  await sql(`INSERT INTO "LedgerEntry" (id, "userId", xp, reason, "sourceId", note, "createdAt") VALUES ($1, $2, 25, 'ADJUSTMENT', $1, 'e2e history', now())`, [randomUUID(), userId]);
  await signIn(context, userId, baseURL!);
  await page.goto('/builder/profile');

  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download JSON' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe(`sbg-ucc-${userId}.json`);
  const exported = await page.request.get('/api/me/export');
  const data = await exported.json();
  expect(data.profile.handle).toBe(userId);
  expect(data.ledger).toEqual([expect.objectContaining({ xp: 25, note: 'e2e history' })]);
  expect(data.profile).not.toHaveProperty('referredById');

  await page.getByRole('button', { name: 'Delete my account' }).click();
  await page.getByLabel(/to confirm/).fill('not-my-handle');
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page.getByText(`Type ${userId} to confirm.`)).toBeVisible();
  await page.getByLabel(/to confirm/).fill(userId);
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  expect(await sql(`SELECT 1 FROM "user" WHERE id = $1`, [userId])).toHaveLength(0);
  expect(await sql(`SELECT 1 FROM "session" WHERE "userId" = $1`, [userId])).toHaveLength(0);
  expect(await sql(`SELECT 1 FROM "LedgerEntry" WHERE "userId" = $1`, [userId])).toHaveLength(0);
  expect(await sql(`SELECT 1 FROM "PrivacyRequest" WHERE "userId" = $1 AND kind = 'DELETE' AND status = 'DONE'`, [userId])).toHaveLength(1);
  expect(await sql(`SELECT 1 FROM "AuditLog" WHERE action = 'member.delete' AND "entityId" = $1`, [userId])).toHaveLength(1);
  await page.goto('/builder');
  await expect(page).toHaveURL(/\/sign-in$/);
  await sql(`DELETE FROM "PrivacyRequest" WHERE "userId" = $1`, [userId]);
});
