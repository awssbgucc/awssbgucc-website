import { expect, test } from '@playwright/test';

for (const path of ['/styleguide', '/styleguide/preview']) {
  test(`${path} returns 404 in production`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  });
}

test('the dashboard redirects to sign in on a production build', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/sign-in$/);
});

test('the sitemap lists public pages only', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/partners');
  expect(sitemap).not.toContain('/styleguide');
  expect(sitemap).not.toContain('/admin');
});
