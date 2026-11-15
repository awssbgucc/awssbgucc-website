import { expect, test } from '@playwright/test';

// Pages that exist only under next dev (they return 404 in production, which e2e/prod checks).

test('styleguide shows all three grids with no horizontal scroll', async ({ page }) => {
  await page.goto('/styleguide');

  await expect(page.getByRole('img', { name: 'Map of Ghana with Cape Coast highlighted' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'University of Cape Coast crest in pixel art' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'AWS Student Builder Group pixel chip' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('event and post layouts render from sample records', async ({ page }) => {
  await page.goto('/styleguide/preview');
  await expect(page.getByRole('link', { name: 'RSVP on Meetup' })).toBeVisible();
  await expect(page.getByText(/12 attended/)).toBeVisible();
  await expect(page.getByText(/LinkedIn/)).toBeVisible();
});

test('the motion page shows the three hero concepts and a labelled sample agenda', async ({ page }) => {
  await page.goto('/styleguide/motion');
  await expect(page.locator('.concept-label')).toHaveCount(4);
  await expect(page.getByRole('tablist', { name: 'Areas to explore' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Map of Ghana with Cape Coast highlighted' }).first()).toBeVisible();
  const live = page.locator('.agenda-row.is-live');
  await expect(live).toHaveCount(1);
  await expect(live).toContainText('Sample session, in progress');
  await expect(live.getByText('Now')).toBeVisible();
  // The room filter is a view-transition swap; it must still filter.
  await page.getByRole('button', { name: 'Sample room A' }).click();
  await expect(page.locator('.agenda-row')).toHaveCount(2);
});
