import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { parsePref, resolveTheme, THEME_SCRIPT, THEME_STORAGE_KEY } from './theme';

const css = readFileSync('src/styles/globals.css', 'utf8');

/** The declarations inside the first block that starts with `selector {`. */
function block(selector: string) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block ${selector}`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).replace(/\/\*[\s\S]*?\*\//g, '');
  return Object.fromEntries(
    body
      .split(';')
      .map((line) => line.trim())
      .filter((line) => line.includes(':'))
      .map((line) => [line.slice(0, line.indexOf(':')).trim(), line.slice(line.indexOf(':') + 1).trim()]),
  );
}

const theme = block('@theme');
const light = block(":root[data-theme='light']");
const lightNoScript = block(':root:not([data-theme])');
const darkScope = block('.story-caption');

describe('appearance preference', () => {
  it('accepts only the three choices and falls back to System', () => {
    expect(parsePref('light')).toBe('light');
    expect(parsePref('dark')).toBe('dark');
    expect(parsePref('system')).toBe('system');
    expect(parsePref('sepia')).toBe('system');
    expect(parsePref(null)).toBe('system');
  });

  it('resolves System from the device and a manual choice over it', () => {
    expect(resolveTheme('system', true)).toBe('light');
    expect(resolveTheme('system', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
    expect(resolveTheme('light', false)).toBe('light');
  });
});

/** Runs the head script against a stand-in document, device setting and storage. */
function runScript({ stored, prefersLight, storageThrows = false }: { stored?: string; prefersLight: boolean; storageThrows?: boolean }) {
  const attributes: Record<string, string> = {};
  const listeners: Record<string, ((event: { key: string | null }) => void)[]> = {};
  const media = { matches: prefersLight, change: [] as (() => void)[], addEventListener: (_: string, fn: () => void) => media.change.push(fn) };
  const storage = new Map(stored ? [[THEME_STORAGE_KEY, stored]] : []);
  const window = {
    matchMedia: () => media,
    localStorage: {
      getItem: (key: string) => {
        if (storageThrows) throw new Error('blocked');
        return storage.get(key) ?? null;
      },
    },
    addEventListener: (type: string, fn: (event: { key: string | null }) => void) => (listeners[type] ??= []).push(fn),
  } as Record<string, unknown>;
  const document = { documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) } };
  runInNewContext(THEME_SCRIPT, { window, document });
  return { attributes, media, storage, listeners, window };
}

describe('head script', () => {
  it('follows the device on a first visit', () => {
    expect(runScript({ prefersLight: true }).attributes).toEqual({ 'data-theme': 'light', 'data-theme-pref': 'system' });
    expect(runScript({ prefersLight: false }).attributes).toEqual({ 'data-theme': 'dark', 'data-theme-pref': 'system' });
  });

  it('puts a saved choice before the device setting', () => {
    expect(runScript({ stored: 'dark', prefersLight: true }).attributes['data-theme']).toBe('dark');
    expect(runScript({ stored: 'light', prefersLight: false }).attributes['data-theme']).toBe('light');
  });

  it('ignores an unknown saved value and blocked storage', () => {
    expect(runScript({ stored: 'blue', prefersLight: true }).attributes).toEqual({ 'data-theme': 'light', 'data-theme-pref': 'system' });
    expect(runScript({ stored: 'dark', prefersLight: true, storageThrows: true }).attributes['data-theme']).toBe('light');
  });

  it('follows the device when it changes, only while System is chosen', () => {
    const system = runScript({ prefersLight: false });
    system.media.matches = true;
    system.media.change.forEach((fn) => fn());
    expect(system.attributes['data-theme']).toBe('light');

    const manual = runScript({ stored: 'dark', prefersLight: false });
    manual.media.matches = true;
    manual.media.change.forEach((fn) => fn());
    expect(manual.attributes['data-theme']).toBe('dark');
  });

  it('applies a choice made on the page, and one made in another tab', () => {
    const run = runScript({ prefersLight: false });
    (run.window.__sbgTheme as (pref: string) => void)('light');
    expect(run.attributes).toEqual({ 'data-theme': 'light', 'data-theme-pref': 'light' });
    (run.window.__sbgTheme as (pref: string) => void)('system');
    expect(run.attributes).toEqual({ 'data-theme': 'dark', 'data-theme-pref': 'system' });

    run.storage.set(THEME_STORAGE_KEY, 'light');
    run.listeners.storage.forEach((fn) => fn({ key: THEME_STORAGE_KEY }));
    expect(run.attributes['data-theme']).toBe('light');
  });
});

describe('theme tokens', () => {
  it('writes the light values identically for the attribute and for visitors without JavaScript', () => {
    expect(lightNoScript).toEqual(light);
  });

  it('keeps the dark scope equal to the dark theme', () => {
    for (const [name, value] of Object.entries(darkScope)) {
      if (name in theme) expect(value, name).toBe(theme[name]);
    }
  });

  it('gives every light token a dark value, in @theme or the dark scope', () => {
    for (const name of Object.keys(light)) {
      if (!name.startsWith('--color-')) continue;
      expect(name in theme || name in darkScope, name).toBe(true);
      expect(name in darkScope, `${name} missing from the dark scope`).toBe(true);
    }
  });

  it('never changes the official brand fills', () => {
    for (const name of Object.keys(light)) expect(name.startsWith('--color-sbg-') || name === '--color-logo-purple' || name === '--color-grey-850', name).toBe(false);
  });
});

// WCAG 2 relative luminance and contrast, with alpha colours composited onto their surface.
type Rgb = [number, number, number];
function parse(colour: string, under: Rgb = [255, 255, 255]): Rgb {
  const hex = colour.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)) as Rgb;
  const rgb = colour.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  if (!rgb) throw new Error(`cannot parse ${colour}`);
  const alpha = rgb[4] ? Number(rgb[4]) : 1;
  return [1, 2, 3].map((i, k) => Number(rgb[i]) * alpha + under[k] * (1 - alpha)) as Rgb;
}
const mix = (top: Rgb, alpha: number, under: Rgb) => top.map((c, i) => c * alpha + under[i] * (1 - alpha)) as Rgb;
function luminance([r, g, b]: Rgb) {
  const channel = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function contrast(a: Rgb, b: Rgb) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

describe('light theme contrast (WCAG AA)', () => {
  const surfaces = ['--color-bg', '--color-bg-alt', '--color-card', '--color-card-raised'].map((name) => [name, parse(light[name])] as const);
  const text = ['--color-text', '--color-text-strong', '--color-text-muted'];
  const accents = ['--color-lime', '--color-purple', '--color-lavender', '--color-sky', '--color-cyan', '--color-blue', '--color-magenta', '--color-danger', '--color-success', '--color-warning'];

  it.each([...text, ...accents])('%s is at least 4.5:1 on every surface', (name) => {
    for (const [surface, rgb] of surfaces) expect(contrast(parse(light[name]), rgb), `${name} on ${surface}`).toBeGreaterThanOrEqual(4.5);
  });

  it.each(accents)('%s is at least 4.5:1 on its own 8%% tint (badges and tags)', (name) => {
    const colour = parse(light[name]);
    for (const [surface, rgb] of surfaces) expect(contrast(colour, mix(colour, 0.08, rgb)), `${name} on its tint over ${surface}`).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the primary button, focus ring and input borders readable', () => {
    const paper = parse(light['--color-bg']);
    expect(contrast(parse(light['--color-on-primary']), parse(light['--color-primary']))).toBeGreaterThanOrEqual(4.5);
    // The 90% hover still reads.
    expect(contrast(parse(light['--color-on-primary']), mix(parse(light['--color-primary']), 0.9, paper))).toBeGreaterThanOrEqual(4.5);
    for (const [surface, rgb] of surfaces) {
      expect(contrast(parse(light['--color-focus']), rgb), `focus on ${surface}`).toBeGreaterThanOrEqual(3);
      expect(contrast(parse(light['--color-input-border']), rgb), `input border on ${surface}`).toBeGreaterThanOrEqual(3);
      expect(contrast(parse(light['--color-primary']), rgb), `primary fill on ${surface}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps the Grey 850 text on brand blocks readable', () => {
    for (const fill of ['--color-sbg-purple', '--color-sbg-mint', '--color-sbg-blue', '--color-sbg-magenta']) {
      expect(contrast(parse(theme['--color-grey-850']), parse(theme[fill])), fill).toBeGreaterThanOrEqual(4.5);
    }
  });
});
