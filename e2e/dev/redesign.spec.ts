import { expect, test } from '@playwright/test';

test('reduced motion shows every section finished, with no hidden reveals', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.classList.contains('motion-ready'))).toBe(false);
  const cell = page.locator('.hero-mosaic > .cell').first();
  expect(await cell.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  const hidden = await page.locator('[data-reveal]').evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity === '0').length);
  expect(hidden).toBe(0);
  const ring = page.locator('#about .pixel-ring');
  expect(await ring.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('the hero shows real photographs and the next session or the latest one', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-mosaic img[src*="classroom"]')).toBeVisible();
  await expect(page.locator('.m-next')).toContainText(/Next session|Most recent session|Sessions/);
});

test('the discipline explorer works by keyboard and only claims what has run', async ({ page }) => {
  await page.goto('/');
  const tabs = page.getByRole('tablist', { name: 'Areas to explore' });
  await tabs.scrollIntoViewIfNeeded();
  const first = tabs.getByRole('tab').first();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  const second = tabs.getByRole('tab').nth(1);
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  const last = tabs.getByRole('tab').last();
  await expect(last).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Open to explore');
});

test('mobile menu contains focus, closes on Escape and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open menu' });
  await trigger.click();
  const menu = page.getByRole('dialog', { name: 'Menu' });
  await expect(menu).toBeVisible();
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press('Tab');
    expect(await menu.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await menu.getByRole('link', { name: /Events$/ }).click();
  // next dev compiles the route on the first client navigation, which can take several seconds on this laptop.
  await expect(page).toHaveURL(/\/events$/, { timeout: 30_000 });
  await expect(menu).not.toBeVisible();
});

test('event filters swap the list without leaving rows hidden', async ({ page }) => {
  await page.goto('/events');
  const past = page.getByRole('button', { name: /^Past/ });
  await past.click();
  await expect(past).toHaveAttribute('aria-pressed', 'true');
  const rows = page.locator('#past-events .event-row');
  const count = await rows.count();
  if (count === 0) return;
  await expect(rows.first()).toBeVisible();
  const talk = page.getByRole('group', { name: 'Filter by type' }).getByRole('button', { name: 'Talk' });
  if (await talk.count()) {
    await talk.click();
    await expect(rows.first()).toBeVisible();
  }
});
