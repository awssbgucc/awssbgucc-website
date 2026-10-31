import { expect, test } from '@playwright/test';

const FOOTER_LINE =
  'A student-led group in the AWS Student Builder Groups program. Run by students at the University of Cape Coast, not by Amazon Web Services.';

const PAGES = [
  { path: '/', heading: 'Build from Cape Coast.' },
  { path: '/events', heading: 'Events' },
  { path: '/team', heading: 'The team' },
  { path: '/partners', heading: 'Partners' },
  { path: '/blog', heading: 'Writing' },
];

for (const { path, heading } of PAGES) {
  test(`${path} renders with the compliance line and no horizontal scroll`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText(FOOTER_LINE)).toBeVisible();
    await expect(page.getByRole('link', { name: 'AWS Event Terms and Conditions' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('home leaves out gated and draft content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: /crest/ })).toHaveCount(0);
  await expect(page.getByText('CANSSAG')).toHaveCount(0);
  await expect(page.getByText('WhatsApp')).toHaveCount(0);
  await expect(page.getByText('No event scheduled right now.')).toBeVisible();
});

test('unknown pages show the 404', async ({ page }) => {
  const response = await page.goto('/events/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('event and post layouts render from sample records', async ({ page }) => {
  await page.goto('/styleguide/preview');
  await expect(page.getByRole('link', { name: 'RSVP on Meetup' })).toBeVisible();
  await expect(page.getByText('12 attended')).toBeVisible();
  await expect(page.getByText(/on LinkedIn/)).toBeVisible();
});
