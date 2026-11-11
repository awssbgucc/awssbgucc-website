import { expect, test } from '@playwright/test';

const FOOTER_LINE =
  'A student-led group in the AWS Student Builder Groups program. Run by students at the University of Cape Coast, not by Amazon Web Services.';

const PAGES = [
  { path: '/', heading: 'A campus of builders.' },
  { path: '/about', heading: 'About' },
  { path: '/events', heading: 'Events' },
  { path: '/team', heading: 'The team' },
  { path: '/partners', heading: 'Partners' },
  { path: '/blog', heading: 'Writing' },
  { path: '/projects', heading: 'Projects' },
  { path: '/contact', heading: 'Contact' },
  { path: '/privacy', heading: 'Privacy notice' },
  { path: '/code-of-conduct', heading: 'Code of conduct' },
];

for (const { path, heading } of PAGES) {
  test(`${path} renders with the compliance line and no horizontal scroll`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText(FOOTER_LINE)).toBeVisible();
    await expect(page.getByRole('link', { name: 'AWS Event Terms and Conditions' }).last()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('the official SBG lockup leads the header, with the campus name', async ({ page }) => {
  await page.goto('/');
  const home = page.getByRole('banner').getByRole('link', { name: 'AWS Student Builder Group at University of Cape Coast, home' });
  await expect(home).toBeVisible();
  await expect(home.locator('img[src="/brand/sbg-wordmark-white.svg"]')).toHaveCount(1);
  await expect(home).toContainText('University of Cape Coast');
});

test('home leaves out gated and draft content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: /crest/ })).toHaveCount(0);
  await expect(page.getByText('CANSSAG')).toHaveCount(0);
  await expect(page.getByText('Zero to Cloud Practitioner: kickoff')).toHaveCount(0);
});

test('unknown pages show the 404', async ({ page }) => {
  const response = await page.goto('/events/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('event and post layouts render from sample records', async ({ page }) => {
  await page.goto('/styleguide/preview');
  await expect(page.getByRole('link', { name: 'RSVP on Meetup' })).toBeVisible();
  await expect(page.getByText(/12 attended/)).toBeVisible();
  await expect(page.getByText(/LinkedIn/)).toBeVisible();
});

test('Cape Coast has its place in the closing section', async ({ page }) => {
  await page.goto('/');
  const map = page.locator('#about').getByRole('img', { name: 'Map of Ghana with Cape Coast highlighted' });
  await map.scrollIntoViewIfNeeded();
  await expect(map).toBeVisible();
});

test('the Community Day page stays off until it is switched on', async ({ page }) => {
  const response = await page.goto('/scd');
  expect(response?.status()).toBe(404);
});
