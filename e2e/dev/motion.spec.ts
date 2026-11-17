import { expect, test } from '@playwright/test';

// Navigation tests open one named, lasting record: a past event from prisma/dev-fixtures.ts, which every local test
// database is seeded with. Records other tests create come and go, and the archive refreshes on a 60-second timer.
const LASTING_EVENT = 'a[href="/events/dev-intro-to-amazon-s3"]';

// The motion layer from docs/MOTION_SYSTEM.md. Each test checks that content and controls work, not timings.

test('hero pixel layers never cover the photo under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const layers = page.locator('.hero-mosaic .pixel-level');
  expect(await layers.count()).toBeGreaterThan(0);
  const visible = await layers.evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== '0').length);
  expect(visible).toBe(0);
});

test('hero pixel layers are gone once the entrance has played', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2500);
  // Cells hidden on phones never render, so their layers never animate; only rendered cells count.
  const visible = await page.locator('.hero-mosaic .pixel-level').evaluateAll((els) => els.filter((el) => el.closest('.cell')!.checkVisibility() && getComputedStyle(el).opacity !== '0').length);
  expect(visible).toBe(0);
  await expect(page.locator('.hero-mosaic img[src*="fcc-lab-bench"]').first()).toBeVisible();
});

test('the technology board links every area to published records only', async ({ page }) => {
  await page.goto('/');
  const rail = page.locator('.board-rail');
  await rail.scrollIntoViewIfNeeded();
  const links = rail.getByRole('link');
  expect(await links.count()).toBeGreaterThan(0);
  for (const href of await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')))) expect(href).toMatch(/^\/(events|blog)\//);
  await page.getByRole('tab', { name: /Data and analytics/ }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Open to explore');
  await expect(rail.locator('.is-lit')).toHaveCount(0);
});

test('route transitions keep links, history and focus normal', async ({ page }) => {
  await page.goto('/events');
  const first = page.locator(LASTING_EVENT).first();
  const title = (await first.textContent())?.trim() ?? '';
  await first.click();
  await expect(page).toHaveURL(/\/events\/[^/]+$/, { timeout: 30_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  await page.goBack();
  await expect(page).toHaveURL(/\/events$/);
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  // No transition is left half-finished on the root.
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.vt ?? '')).toBe('');
});

test('the photo viewer opens, steps by keyboard and returns focus', async ({ page }) => {
  await page.goto('/about');
  const first = page.locator('.photo-wall .wall-photo').first();
  await first.scrollIntoViewIfNeeded();
  await first.click();
  const viewer = page.locator('dialog.photo-viewer');
  await expect(viewer).toBeVisible();
  await expect(viewer).toContainText('1 / 6');
  await page.keyboard.press('ArrowRight');
  await expect(viewer).toContainText('2 / 6');
  await page.keyboard.press('Escape');
  await expect(viewer).not.toBeVisible();
  await expect(first).toBeFocused();
});

test('the photo strips keep every photo reachable by keyboard', async ({ page }) => {
  await page.goto('/');
  const reels = page.locator('.photo-reel');
  // From Code to Cloud, then the bootcamp.
  await expect(reels).toHaveCount(2);
  for (const reel of await reels.all()) {
    const photos = reel.locator('.reel-photo');
    expect(await photos.count()).toBeGreaterThan(8);
    await photos.last().focus();
    await expect(photos.last()).toBeInViewport();
  }
});

test('the nav marker rests on the current page', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'The full navigation shows from 1280 px');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/events');
  const marker = page.locator('.nav-marker');
  await expect(marker).toHaveAttribute('data-shown', 'true');
  const current = await page.locator('.nav-link[aria-current="page"]').boundingBox();
  // Placed at once on arrival, 12 px left of the current link.
  const cell = await marker.boundingBox();
  expect(Math.abs((cell?.x ?? 0) - ((current?.x ?? 0) - 12))).toBeLessThan(3);
  await page.locator('.nav-link').first().hover();
  await expect.poll(async () => Math.round((await marker.boundingBox())?.x ?? 0)).toBe(Math.round(((await page.locator('.nav-link').first().boundingBox())?.x ?? 0) - 12));
});

test('no section is wider than the screen', async ({ page }) => {
  for (const path of ['/', '/events', '/about', '/projects']) {
    await page.goto(path);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main section, main .board, main .explorer')].filter((el) => el.getBoundingClientRect().width > window.innerWidth + 1).map((el) => el.className || el.tagName));
    expect(wide, path).toEqual([]);
  }
});

test('the technology board is fully usable on a phone', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Phone layout');
  await page.goto('/');
  const tabs = page.getByRole('tablist', { name: 'Areas to explore' }).getByRole('tab');
  const count = await tabs.count();
  expect(count).toBe(8);
  for (let i = 0; i < count; i++) {
    const tab = tabs.nth(i);
    await tab.scrollIntoViewIfNeeded();
    const box = await tab.boundingBox();
    // Two columns on a 375 px screen, each a comfortable touch target, fully on screen.
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    const title = (await tab.locator('.board-tile-title').textContent())!.trim();
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    const panel = page.getByRole('tabpanel');
    await expect(panel.getByRole('heading', { level: 3 })).toHaveText(title);
    // Choosing a block brings its panel into view, below the board.
    await expect(panel.getByRole('heading', { level: 3 })).toBeInViewport();
  }
  // Every record on the rail can be scrolled to and opened.
  const stops = page.locator('.board-rail li a');
  const last = stops.last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
  const href = await stops.first().getAttribute('href');
  await stops.first().scrollIntoViewIfNeeded();
  await stops.first().click();
  await expect(page).toHaveURL(new RegExp(`${href}$`), { timeout: 30_000 });
});

test('modified clicks open a new tab and leave the page and its transitions alone', async ({ page, context }) => {
  await page.goto('/events');
  const link = page.locator(LASTING_EVENT).first();
  const [opened] = await Promise.all([context.waitForEvent('page'), link.click({ modifiers: ['Control'] })]);
  await opened.close();
  await expect(page).toHaveURL(/\/events$/);
  expect(await page.evaluate(() => document.documentElement.dataset.vt ?? '')).toBe('');
});

test('links work from the keyboard, and in-page links still jump', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero-fields a[href="#explore-security"]').click();
  await expect(page).toHaveURL(/#explore-security$/);
  await expect(page.getByRole('tab', { name: /Security/ })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/events');
  await page.locator(LASTING_EVENT).first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/events\/[^/]+$/, { timeout: 30_000 });
});

test('under reduced motion, navigation never starts a view transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/events');
  await page.evaluate(() => {
    (window as unknown as { __vt: string[] }).__vt = [];
    new MutationObserver(() => { const v = document.documentElement.dataset.vt; if (v) (window as unknown as { __vt: string[] }).__vt.push(v); }).observe(document.documentElement, { attributes: true });
  });
  // Working tabs prove the page has hydrated, so the link below is a client-side navigation, not a page load.
  const upcoming = page.getByRole('button', { name: /^Upcoming/ });
  const past = page.getByRole('button', { name: /^Past/ });
  await upcoming.click();
  await expect(upcoming).toHaveAttribute('aria-pressed', 'true');
  await past.click();
  await expect(past).toHaveAttribute('aria-pressed', 'true');
  await page.locator(LASTING_EVENT).first().click();
  await expect(page).toHaveURL(/\/events\/[^/]+$/, { timeout: 30_000 });
  // The same window survived (no full reload), and no transition was ever marked on it.
  expect(await page.evaluate(() => (window as unknown as { __vt: string[] }).__vt)).toEqual([]);
  await page.goBack();
  await expect(page).toHaveURL(/\/events$/);
});
