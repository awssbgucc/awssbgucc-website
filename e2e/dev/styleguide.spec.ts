import { expect, test } from '@playwright/test';

test('styleguide shows all three grids with no horizontal scroll', async ({ page }) => {
  await page.goto('/styleguide');

  await expect(page.getByRole('img', { name: 'Map of Ghana with Cape Coast highlighted' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'University of Cape Coast crest in pixel art' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'AWS Student Builder Group pixel chip' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
