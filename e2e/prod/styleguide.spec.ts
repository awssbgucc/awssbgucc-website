import { expect, test } from '@playwright/test';

test('styleguide returns 404 in production', async ({ page }) => {
  const response = await page.goto('/styleguide');
  expect(response?.status()).toBe(404);
});
