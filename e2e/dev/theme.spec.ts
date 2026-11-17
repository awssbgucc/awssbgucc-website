import { expect, test, type Page } from '@playwright/test';
import { cleanUp, isLocalDatabase, makeAdmin, makeUser, signIn } from './helpers';

// Appearance: System, Light and Dark, across the public site, the Builder Portal and the dashboard.
// The page background is the plainest proof of which theme is showing: Grey 850 on dark, paper on light.
const DARK_BG = 'rgb(22, 29, 38)';
const LIGHT_BG = 'rgb(244, 242, 237)';
const KEY = 'sbg-theme';

const theme = (page: Page) => page.evaluate(() => ({ theme: document.documentElement.dataset.theme, pref: document.documentElement.dataset.themePref }));
const background = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const choose = (page: Page, name: 'System' | 'Light' | 'Dark') => page.getByRole('radio', { name }).first().click();

/** Console lines that point at a hydration problem. */
function watchHydration(page: Page) {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (/hydrat|did not match|server rendered/i.test(message.text())) problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  return problems;
}

test.describe('first visit follows the device', () => {
  test('dark device, dark site', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');
    expect(await theme(page)).toEqual({ theme: 'dark', pref: 'system' });
    expect(await background(page)).toBe(DARK_BG);
    await context.close();
  });

  test('light device, light site', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/');
    expect(await theme(page)).toEqual({ theme: 'light', pref: 'system' });
    expect(await background(page)).toBe(LIGHT_BG);
    await context.close();
  });

  test('without JavaScript the device setting still decides', async ({ browser }) => {
    for (const [colorScheme, expected] of [['light', LIGHT_BG], ['dark', DARK_BG]] as const) {
      const context = await browser.newContext({ colorScheme, javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto('/');
      expect(await background(page)).toBe(expected);
      // The selector cannot work without JavaScript, so it is not shown.
      await expect(page.locator('.theme-selector').first()).toBeHidden();
      await context.close();
    }
  });
});

test.describe('choosing', () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'The header selector shows from 1280px; the phone menu has its own test.'));

  test('a manual choice beats the device, and System hands back to it', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const problems = watchHydration(page);
    await page.goto('/');

    await choose(page, 'Dark');
    expect(await theme(page)).toEqual({ theme: 'dark', pref: 'dark' });
    await expect(page.getByRole('radio', { name: 'Dark' }).first()).toHaveAttribute('aria-checked', 'true');
    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('dark');
    await expect.poll(() => background(page)).toBe(DARK_BG);

    // The device changing does nothing while a manual choice holds.
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.emulateMedia({ colorScheme: 'light' });
    expect((await theme(page)).theme).toBe('dark');

    await choose(page, 'Light');
    expect(await theme(page)).toEqual({ theme: 'light', pref: 'light' });

    await choose(page, 'System');
    expect(await theme(page)).toEqual({ theme: 'light', pref: 'system' });
    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull();

    // With System chosen, the site follows the device as it changes.
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect.poll(async () => (await theme(page)).theme).toBe('dark');
    await expect.poll(() => background(page)).toBe(DARK_BG);
    await page.emulateMedia({ colorScheme: 'light' });
    await expect.poll(async () => (await theme(page)).theme).toBe('light');

    expect(problems).toEqual([]);
    await context.close();
  });

  test('arrow keys move and choose, like any radio group', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('radio', { name: 'System' }).first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Light' }).first()).toBeFocused();
    expect((await theme(page)).pref).toBe('light');
    await page.keyboard.press('ArrowRight');
    expect((await theme(page)).pref).toBe('dark');
    await page.keyboard.press('ArrowRight');
    expect((await theme(page)).pref).toBe('system');
    await page.keyboard.press('ArrowLeft');
    expect((await theme(page)).pref).toBe('dark');
    // Only the chosen option is in the tab order.
    await expect(page.locator('.theme-selector').first().locator('[tabindex="0"]')).toHaveCount(1);
  });

  test('the choice survives a refresh, client navigation and a new visit', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const problems = watchHydration(page);
    await page.goto('/');
    await choose(page, 'Light');

    await page.reload();
    expect(await theme(page)).toEqual({ theme: 'light', pref: 'light' });
    await expect(page.getByRole('radio', { name: 'Light' }).first()).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Events' }).click();
    await page.waitForURL('**/events');
    expect((await theme(page)).theme).toBe('light');
    expect(await background(page)).toBe(LIGHT_BG);

    const later = await context.newPage();
    await later.goto('/team');
    expect(await theme(later)).toEqual({ theme: 'light', pref: 'light' });

    expect(problems).toEqual([]);
    await context.close();
  });

  test('the first frame already has the chosen theme', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    await context.addInitScript((key) => {
      localStorage.setItem(key, 'light');
      // Record the theme at the moment <body> arrives, before anything can paint.
      new MutationObserver((_, observer) => {
        if (!document.body) return;
        (window as unknown as { firstTheme: string | undefined }).firstTheme = document.documentElement.dataset.theme;
        observer.disconnect();
      }).observe(document, { childList: true, subtree: true });
    }, KEY);
    const page = await context.newPage();
    await page.goto('/events');
    expect(await page.evaluate(() => (window as unknown as { firstTheme: string }).firstTheme)).toBe('light');
    await context.close();
  });

  test('switching eases colours only, and not at all under reduced motion', async ({ browser }) => {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      const context = await browser.newContext({ colorScheme: 'dark', reducedMotion, viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await page.goto('/about');
      // The switch holds data-theme-switching for 200ms; read the style it gives while held.
      const during = await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme-switching', '');
        const style = getComputedStyle(document.querySelector('.site-header')!);
        const result = [style.transitionProperty, style.transitionDuration];
        document.documentElement.removeAttribute('data-theme-switching');
        return result;
      });
      if (reducedMotion === 'reduce') expect(during[1]).toBe('0s');
      else expect(during).toEqual(['color, background-color, border-color, fill, stroke', '0.15s, 0.15s, 0.15s, 0.15s, 0.15s']);
      await choose(page, 'Light');
      await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute('data-theme-switching'))).toBe(false);
      await context.close();
    }
  });
});

test.describe('across the site', () => {
  test.skip(!isLocalDatabase, 'Signs in by writing session rows, so it runs only against a local database.');
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'One run is enough.'));
  test.afterAll(async () => {
    if (isLocalDatabase) await cleanUp();
  });

  test('one choice holds on the public site, the portal and the dashboard', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 800 } });
    await signIn(context, await makeAdmin('theme'), baseURL!);
    const page = await context.newPage();
    const problems = watchHydration(page);
    await page.goto('/');
    await choose(page, 'Light');

    for (const path of ['/builder', '/builder/progress', '/admin', '/admin/members', '/sign-in', '/admin/sign-in']) {
      await page.goto(path);
      // /sign-in sends a signed-in member on to the portal, which has the selector too.
      expect((await theme(page)).theme, path).toBe('light');
      await expect(page.getByRole('radio', { name: 'Light' }).first(), path).toHaveAttribute('aria-checked', 'true');
    }
    // Back on the public site from the dashboard, switched there.
    await page.goto('/admin');
    await choose(page, 'Dark');
    await page.goto('/events');
    expect((await theme(page)).theme).toBe('dark');
    expect(await background(page)).toBe(DARK_BG);
    expect(problems).toEqual([]);
    await context.close();
  });

  test('the portal and onboarding offer the selector', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await signIn(context, await makeUser('theme-new', { onboarded: false }), baseURL!);
    const page = await context.newPage();
    await page.goto('/builder/welcome');
    await choose(page, 'Light');
    expect((await theme(page)).theme).toBe('light');
    await context.close();
  });
});

test.describe('surfaces that stay dark, and the phone menu', () => {
  test('the photo viewer stays dark on the light theme', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/events/from-code-to-cloud');
    const thumb = page.locator('.gallery-thumb').first();
    test.skip((await thumb.count()) === 0, 'Needs an event with photos in the local database.');
    await thumb.click();
    const viewer = page.locator('dialog.photo-viewer[open]');
    await expect(viewer).toBeVisible();
    expect(await viewer.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(22, 29, 38, 0.97)');
    expect(await viewer.locator('.photo-viewer-button').first().evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)');
    await page.keyboard.press('Escape');
    await context.close();
  });

  test('the phone menu carries the selector and switches the sheet', async ({ browser }, info) => {
    test.skip(info.project.name !== 'mobile', 'Phone layout only.');
    const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const sheet = page.locator('#mobile-menu');
    await expect(sheet).toBeVisible();
    await sheet.getByRole('radio', { name: 'Light' }).click();
    await expect.poll(() => sheet.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(LIGHT_BG);
    // Touch targets in the sheet are full height.
    const box = await sheet.getByRole('radio', { name: 'Light' }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    await context.close();
  });

  test('the hero still animates on the light theme', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/');
    const names = await page.evaluate(() => document.getAnimations().map((a) => (a as CSSAnimation).animationName));
    expect(names).toContain('cursor-blink');
    await context.close();
  });
});
