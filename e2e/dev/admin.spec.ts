import { expect, test } from '@playwright/test';

for (const path of ['/admin', '/admin/events', '/admin/settings', '/admin/users', '/admin/preview/events/x']) {
  test(`an unauthenticated visit to ${path} redirects to sign in`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/sign-in$/);
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });
}

test('a failed sign-in shows only the no access message', async ({ page }) => {
  await page.goto('/admin/sign-in?error=NO_ACCESS');
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('This account does not have access');
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toHaveCount(0);
});

test('the dashboard is not indexed', async ({ page }) => {
  await page.goto('/admin/sign-in');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('a signed-out request for an upload URL is refused', async ({ request }) => {
  const response = await request.post('/api/uploads', {
    data: { folder: 'team', recordId: 'seed-team-1', type: 'image/png', size: 1000 },
  });
  expect(response.status()).toBe(401);
  expect(await response.json()).not.toHaveProperty('uploadUrl');
});
