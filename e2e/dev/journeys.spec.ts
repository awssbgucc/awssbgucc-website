import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { cleanUp, isLocalDatabase, makeAdmin, makeUser, signIn, sql } from './helpers';

// End-to-end flows through the builder portal and the dashboard.
// They create their own users and records with an e2e- prefix, and remove them afterwards.

test.skip(!isLocalDatabase, 'These tests write data, so they run only against a local database.');
test.afterAll(async () => {
  if (isLocalDatabase) await cleanUp();
});

const HOUR = 60 * 60 * 1000;

async function openEvent(title: string) {
  const id = `e2e-event-${randomUUID().slice(0, 8)}`;
  const now = Date.now();
  await sql(
    `INSERT INTO "Event" (id, slug, title, tag, format, "startsAt", "endsAt", venue, summary, body, "meetupUrl", photos, status, "checkInCode", "checkInOpensAt", "checkInClosesAt", "createdAt", "updatedAt")
     VALUES ($1, $1, $2, 'BUILD', 'IN_PERSON', $3, $4, 'Test lab', 'Summary', 'Body', 'https://www.meetup.com/x', '{}', 'PUBLISHED', 'E2E234', $5, $6, now(), now())`,
    [id, title, new Date(now - HOUR), new Date(now + HOUR), new Date(now - 2 * HOUR), new Date(now + 2 * HOUR)],
  );
  return id;
}

test.describe('access', () => {
  test('signed out, the portal sends you to sign in', async ({ page }) => {
    await page.goto('/builder/progress');
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  });

  test('a member is refused every admin page', async ({ page, context, baseURL }) => {
    await signIn(context, await makeUser('member'), baseURL!);
    for (const path of ['/admin', '/admin/members', '/admin/rewards', '/admin/settings', '/admin/audit']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/sign-in\?error=NO_ACCESS$/);
    }
    await expect(page.getByRole('main').getByRole('alert')).toHaveText('This account does not have access');
  });

  test('a suspended member is signed out of the portal', async ({ page, context, baseURL }) => {
    const id = await makeUser('suspended');
    await sql(`UPDATE "MemberProfile" SET status = 'SUSPENDED' WHERE "userId" = $1`, [id]);
    await signIn(context, id, baseURL!);
    await page.goto('/builder');
    await expect(page).toHaveURL(/\/sign-in\?error=SUSPENDED$/);
  });
});

test('a new member completes onboarding and lands on the dashboard', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'One run is enough.');
  await signIn(context, await makeUser('newcomer', { onboarded: false }), baseURL!);
  await page.goto('/builder');
  await expect(page).toHaveURL(/\/builder\/welcome$/);
  await page.getByLabel('Your name').fill('Ama Test');
  await page.getByLabel('Handle').fill(`e2e-ama-${Date.now().toString(36)}`);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('Serverless', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('Signed-in members', { exact: true }).click();
  await page.getByRole('checkbox', { name: /privacy notice/ }).check();
  await page.getByRole('button', { name: 'Finish and open the portal' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back, Ama.' })).toBeVisible();
});

test('check-in records once and pays once', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'One run is enough.');
  const userId = await makeUser('checkin');
  const eventId = await openEvent('E2E check-in session');
  await signIn(context, userId, baseURL!);
  await page.goto(`/builder/check-in?event=${eventId}`);
  await page.getByLabel('Code').fill('nope00');
  await page.getByRole('button', { name: 'Check in' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('does not match');
  await page.getByLabel('Code').fill('e2e 234');
  await page.getByRole('button', { name: 'Check in' }).click();
  await expect(page.getByRole('status')).toContainText('Checked in');
  await page.goto(`/builder/check-in?event=${eventId}`);
  await page.getByLabel('Code').fill('E2E234');
  await page.getByRole('button', { name: 'Check in' }).click();
  await expect(page.getByRole('status')).toContainText('Already checked in');
  const rows = await sql<{ count: string }>(`SELECT count(*) FROM "LedgerEntry" WHERE "userId" = $1 AND reason = 'CHECK_IN'`, [userId]);
  expect(Number(rows[0].count)).toBe(1);
});

test('a submission is reviewed by an admin and the award reaches the member', async ({ browser, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'One run is enough.');
  const memberId = await makeUser('builder');
  const adminId = await makeAdmin('reviewer');
  const challengeId = `e2e-challenge-${randomUUID().slice(0, 8)}`;
  await sql(
    `INSERT INTO "Challenge" (id, slug, title, summary, brief, requirements, "startsAt", "endsAt", status, xp, credits, "maxScore", "leaderboardEnabled", "createdAt", "updatedAt")
     VALUES ($1, $1, 'E2E challenge', 'Summary', 'Brief', 'Requirements', now() - interval '1 day', now() + interval '1 day', 'PUBLISHED', 77, 7, 100, true, now(), now())`,
    [challengeId],
  );

  const member = await browser.newContext();
  await signIn(member, memberId, baseURL!);
  const memberPage = await member.newPage();
  await memberPage.goto(`/builder/challenges/${challengeId}`);
  await memberPage.getByLabel('GitHub repository').fill('https://gitlab.com/x/y');
  await memberPage.getByRole('button', { name: 'Submit' }).click();
  await expect(memberPage.getByText(/Use the repository link/)).toBeVisible();
  await memberPage.getByLabel('GitHub repository').fill('https://github.com/example/static-site');
  await memberPage.getByRole('button', { name: 'Submit' }).click();
  await expect(memberPage.getByRole('status')).toHaveText('Saved');

  const admin = await browser.newContext();
  await signIn(admin, adminId, baseURL!);
  const adminPage = await admin.newPage();
  const [{ id: submissionId }] = await sql<{ id: string }>(`SELECT id FROM "Submission" WHERE "challengeId" = $1`, [challengeId]);
  await adminPage.goto(`/admin/submissions/${submissionId}`);
  await adminPage.getByLabel(/Score/).fill('90');
  await adminPage.getByLabel('Feedback for the member').fill('Clear README.');
  await adminPage.getByRole('button', { name: 'Save review' }).click();
  await expect(adminPage).toHaveURL(/\/admin\/submissions$/);

  await memberPage.goto(`/builder/challenges/${challengeId}`);
  // The latest feedback, above the history list that repeats it.
  await expect(memberPage.getByText('Clear README.').first()).toBeVisible();
  await memberPage.goto('/builder/progress');
  await expect(memberPage.getByText('E2E challenge').first()).toBeVisible();
  const rows = await sql<{ xp: number }>(`SELECT xp FROM "LedgerEntry" WHERE "userId" = $1 AND reason = 'SUBMISSION_APPROVED'`, [memberId]);
  expect(rows).toEqual([{ xp: 77 }]);
  await member.close();
  await admin.close();
});

test('credits buy a reward once, and it can be used on the profile', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'One run is enough.');
  const userId = await makeUser('shopper');
  await sql(`INSERT INTO "LedgerEntry" (id, "userId", credits, reason, "sourceId", note, "createdAt") VALUES ($1, $2, 100, 'ADJUSTMENT', $1, 'test', now())`, [randomUUID(), userId]);
  const rewardId = `e2e-reward-${randomUUID().slice(0, 8)}`;
  await sql(
    `INSERT INTO "Reward" (id, slug, name, description, kind, cost, "perMemberLimit", available, value, "order", "createdAt", "updatedAt") VALUES ($1, $1, 'E2E tide banner', 'Test', 'BANNER', 60, 1, true, 'tide', 99, now(), now())`,
    [rewardId],
  );
  await signIn(context, userId, baseURL!);
  await page.goto('/builder/rewards');
  const card = page.getByRole('listitem').filter({ hasText: 'E2E tide banner' });
  await card.getByRole('button', { name: 'Redeem' }).click();
  await card.getByRole('button', { name: 'Spend 60 credits' }).click();
  await expect(card.getByRole('status')).toHaveText('Redeemed');
  await page.reload();
  await expect(page.getByText('You own this.').first()).toBeVisible();
  const balance = await sql<{ sum: string }>(`SELECT sum(credits) FROM "LedgerEntry" WHERE "userId" = $1`, [userId]);
  expect(Number(balance[0].sum)).toBe(40);

  await page.goto('/builder/profile');
  await page.getByRole('button', { name: 'Tide' }).click();
  await expect(page.getByRole('button', { name: 'Tide' })).toHaveAttribute('aria-pressed', 'true');
});

test('a public profile is visible only while it is public', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'One run is enough.');
  const userId = await makeUser('visible');
  await signIn(context, userId, baseURL!);
  await page.goto('/builder/profile');
  await page.getByLabel('Who can see your profile').selectOption('PUBLIC');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByRole('status')).toHaveText('Saved');
  const anonymous = await (await page.context().browser()!.newContext()).newPage();
  expect((await anonymous.goto(`/builders/${userId}`))?.status()).toBe(200);
  await expect(anonymous.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await sql(`UPDATE "MemberProfile" SET visibility = 'PRIVATE' WHERE "userId" = $1`, [userId]);
  expect((await anonymous.goto(`/builders/${userId}`))?.status()).toBe(404);
});

test('an admin creates and publishes an event, and it appears publicly', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'One run is enough.');
  await signIn(context, await makeAdmin('editor'), baseURL!);
  const slug = `e2e-${Date.now().toString(36)}`;
  await page.goto('/admin/events/new');
  await page.getByLabel('Title').fill('E2E published session');
  await page.getByLabel('Slug').fill(slug);
  await page.getByLabel('Start', { exact: true }).fill('2030-01-05T09:30');
  await page.getByLabel('End', { exact: true }).fill('2030-01-05T12:00');
  await page.getByLabel('Venue').fill('LT5');
  await page.getByLabel('Summary').fill('A test session.');
  await page.getByRole('textbox', { name: 'Body' }).fill('The body.');
  await page.getByLabel('Meetup link').fill('https://www.meetup.com/aws-sbg-at-university-of-cape-coast');
  await page.getByLabel('Status').selectOption('PUBLISHED');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/admin\/events$/);
  const response = await page.goto(`/events/${slug}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'E2E published session' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'RSVP on Meetup' })).toBeVisible();
});

/** Public pages refresh every 60 seconds (Amplify has no on-demand revalidation), so this reloads until the change shows. */
async function waitForPublic(page: import('@playwright/test').Page, path: string, check: () => Promise<boolean>) {
  for (let attempt = 0; attempt < 36; attempt++) {
    await page.goto(path);
    if (await check()) return;
    await page.waitForTimeout(5000);
  }
  throw new Error(`${path} did not update within three minutes`);
}

test('an admin adds a team member, who appears publicly, and can edit and hide them', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'One run is enough.');
  test.setTimeout(480_000);
  await signIn(context, await makeAdmin('team'), baseURL!);
  const name = `E2E Ama ${Date.now().toString(36)}`;
  await page.goto('/admin/team/new');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Role', { exact: true }).fill('Technical Lead');
  await page.getByLabel('Role group').selectOption('TECHNICAL');
  await page.getByLabel('Programme').fill('BSc Computer Science');
  await page.getByLabel('Level').fill('Level 300');
  await page.getByLabel('LinkedIn link').fill('https://www.linkedin.com/in/example');
  await page.getByLabel('Show on the public site').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/admin\/team$/);
  await expect(page.getByText(name)).toBeVisible();

  const [member] = await sql<{ id: string; active: boolean; order: number }>(`SELECT id, active, "order" FROM "TeamMember" WHERE name = $1`, [name]);
  expect(member.active).toBe(true);

  const card = () => page.locator('.team-person').filter({ hasText: name });
  await waitForPublic(page, '/team', async () => (await card().count()) > 0);
  await expect(card()).toContainText('Technical Lead');
  await expect(card()).toContainText('BSc Computer Science, Level 300');
  await expect(card().getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/example');

  await page.goto(`/admin/team/${member.id}`);
  await page.getByLabel('Role', { exact: true }).fill('Events Lead');
  await page.getByLabel('Show on the public site').uncheck();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/admin\/team$/);
  const [updated] = await sql<{ role: string; active: boolean }>(`SELECT role, active FROM "TeamMember" WHERE id = $1`, [member.id]);
  expect(updated).toEqual({ role: 'Events Lead', active: false });
  await waitForPublic(page, '/team', async () => (await card().count()) === 0);
});

test('the portal bottom bar opens the rest of the pages on a phone', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'mobile', 'Phone layout only.');
  await signIn(context, await makeUser('phone'), baseURL!);
  await page.goto('/builder');
  const bar = page.getByRole('navigation', { name: 'Builder portal' });
  await expect(bar.getByRole('link', { name: 'Check in' })).toBeVisible();
  await bar.getByRole('button', { name: /More/ }).click();
  const sheet = page.getByRole('dialog', { name: 'More pages' });
  await sheet.getByRole('link', { name: 'Rewards' }).click();
  await expect(page).toHaveURL(/\/builder\/rewards$/);
  await expect(sheet).toBeHidden();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('the dashboard menu folds away on a phone and marks the current page', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'mobile', 'Phone layout only.');
  await signIn(context, await makeAdmin('phone-admin'), baseURL!);
  await page.goto('/admin');
  const nav = page.getByRole('navigation', { name: 'Dashboard' });
  await expect(nav).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeInViewport();
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'Members' }).click();
  await expect(page).toHaveURL(/\/admin\/members$/);
  await expect(nav).toBeHidden();
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(nav.getByRole('link', { name: 'Members' })).toHaveAttribute('aria-current', 'page');
});
