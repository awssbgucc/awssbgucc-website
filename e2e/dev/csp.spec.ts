import { randomUUID } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { cleanUp, isLocalDatabase, makeAdmin, signIn, sql } from './helpers';

// The Content Security Policy must not break any page. Each page records every policy violation the browser
// reports, and the test fails on the first one. Pages are visited the way a person arrives: a full load.

test.skip(!isLocalDatabase, 'Signs in by writing session rows, so it runs only against a local database.');
test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'One run is enough.'));
test.afterAll(async () => {
  if (isLocalDatabase) await cleanUp();
});

const HOUR = 60 * 60 * 1000;

async function watch(page: Page) {
  await page.addInitScript(() => {
    const found: string[] = [];
    (window as unknown as { cspViolations: string[] }).cspViolations = found;
    document.addEventListener('securitypolicyviolation', (event) => found.push(`${event.effectiveDirective} ${event.blockedURI}`));
  });
}

async function expectClean(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBeLessThan(400);
  await page.waitForLoadState('networkidle');
  // The theme script ran: under the strict policy it is allowed only by its hash.
  await expect(page.locator('html')).toHaveAttribute('data-theme', /^(light|dark)$/);
  expect(await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations), path).toEqual([]);
}

test('public pages carry the fixed policy, per-request pages a fresh nonce', async ({ request }) => {
  const home = (await request.get('/')).headers()['content-security-policy'];
  expect(home).toContain("script-src 'self' 'unsafe-inline'");
  expect(home).not.toContain('nonce-');

  const first = (await request.get('/sign-in')).headers()['content-security-policy'];
  const second = (await request.get('/sign-in')).headers()['content-security-policy'];
  expect(first).toMatch(/script-src 'nonce-[^']+' 'strict-dynamic' 'sha256-/);
  expect(first).not.toBe(second);
  expect(first.split('; ').find((d) => d.startsWith('script-src'))).not.toContain('unsafe-inline');
  for (const policy of [home, first]) expect(policy).toContain("frame-ancestors 'none'");
});

test('Next marks every script on a per-request page with the nonce', async ({ page }) => {
  const response = await page.goto('/sign-in');
  const nonce = response!.headers()['content-security-policy'].match(/'nonce-([^']+)'/)![1];
  const scripts = await page.locator('script').evaluateAll((nodes) => nodes.map((s) => ({ nonce: (s as HTMLScriptElement).nonce, theme: !!s.textContent?.includes('sbg-theme') })));
  expect(scripts.length).toBeGreaterThan(1);
  for (const script of scripts.filter((s) => !s.theme)) expect(script.nonce).toBe(nonce);
});

test('no page reports a policy violation, signed out, as a member or as an admin', async ({ browser, baseURL }) => {
  const visitor = await browser.newPage();
  await watch(visitor);
  for (const path of ['/', '/events', '/projects', '/team', '/about', '/privacy', '/sign-in', '/admin/sign-in']) await expectClean(visitor, path);
  await visitor.close();

  const adminId = await makeAdmin('csp');
  const eventId = `e2e-csp-${randomUUID().slice(0, 8)}`;
  const now = Date.now();
  await sql(
    `INSERT INTO "Event" (id, slug, title, tag, format, "startsAt", "endsAt", venue, summary, body, "meetupUrl", photos, status, "checkInCode", "checkInOpensAt", "checkInClosesAt", "createdAt", "updatedAt")
     VALUES ($1, $1, 'E2E policy session', 'BUILD', 'IN_PERSON', $2, $3, 'Test lab', 'Summary', 'Body', 'https://www.meetup.com/x', '{}', 'PUBLISHED', 'CSP234', $4, $5, now(), now())`,
    [eventId, new Date(now - HOUR), new Date(now + HOUR), new Date(now - 2 * HOUR), new Date(now + 2 * HOUR)],
  );

  const context = await browser.newContext();
  await signIn(context, adminId, baseURL!);
  const page = await context.newPage();
  await watch(page);
  const member = ['/builder', '/builder/sessions', `/builder/sessions/${eventId}`, '/builder/check-in', '/builder/profile', '/builder/projects/new', '/builder/progress', '/builder/rewards'];
  const admin = ['/admin', '/admin/events', `/admin/events/${eventId}`, `/admin/events/${eventId}/attendance`, '/admin/events/new', '/admin/rules', '/admin/users', '/admin/members'];
  for (const path of [...member, ...admin]) await expectClean(page, path);

  // The attendance page's QR code is a data: image, and the event form previews Markdown in the browser.
  await page.goto(`/admin/events/${eventId}/attendance`);
  await expect(page.locator('img[src^="data:image/png"]').first()).toBeVisible();

  // Client code runs under the strict policy: a portal form still works.
  await page.goto(`/builder/check-in?event=${eventId}`);
  await page.getByLabel('Code').fill('CSP234');
  await page.getByRole('button', { name: 'Check in' }).click();
  await expect(page.getByRole('status')).toContainText('Checked in');
  expect(await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations)).toEqual([]);
  await context.close();
});
