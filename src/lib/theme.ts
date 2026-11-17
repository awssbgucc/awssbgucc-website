// Appearance: System, Light or Dark. A visitor preference kept in this browser only, never in the database.
// The resolved theme lives on <html data-theme>, the choice on <html data-theme-pref>; the CSS reads only those.

export const THEME_STORAGE_KEY = 'sbg-theme';
export const THEME_PREFS = ['system', 'light', 'dark'] as const;
export type ThemePref = (typeof THEME_PREFS)[number];
export type Theme = 'light' | 'dark';

/** Browser chrome colour per theme: the page background. The layout gives one per prefers-color-scheme. */
export const THEME_COLOURS: Record<Theme, string> = { dark: '#161d26', light: '#f4f2ed' };

export function parsePref(value: unknown): ThemePref {
  return THEME_PREFS.includes(value as ThemePref) ? (value as ThemePref) : 'system';
}

export function resolveTheme(pref: ThemePref, systemPrefersLight: boolean): Theme {
  if (pref === 'system') return systemPrefersLight ? 'light' : 'dark';
  return pref;
}

/*
 * Inlined in <head> and run before the first paint, so the first frame already has the right colours. It also
 * keeps System live (the device switching between light and dark) and follows a change made in another tab.
 * Plain ES5 on purpose. If it fails, the CSS fallback still follows prefers-color-scheme on its own.
 */
export const THEME_SCRIPT = `(function (key) {
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: light)');
  var chosen = null;
  function read() {
    if (chosen) return chosen;
    try {
      var value = window.localStorage.getItem(key);
      return value === 'light' || value === 'dark' ? value : 'system';
    } catch (error) {
      return 'system';
    }
  }
  function apply(pref) {
    if (pref) chosen = pref;
    var current = read();
    var theme = current === 'system' ? (media.matches ? 'light' : 'dark') : current;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-pref', current);
  }
  apply();
  if (media.addEventListener) media.addEventListener('change', function () { apply(); });
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) { chosen = null; apply(); }
  });
  window.__sbgTheme = apply;
})(${JSON.stringify(THEME_STORAGE_KEY)});`;

type ThemeWindow = Window & { __sbgTheme?: (pref?: ThemePref) => void };

/** Saves the visitor's choice and applies it, easing colours only while the switch happens. */
export function setThemePref(pref: ThemePref) {
  const root = document.documentElement;
  try {
    if (pref === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Storage blocked: the choice still applies to this page.
  }
  root.setAttribute('data-theme-switching', '');
  const apply = (window as ThemeWindow).__sbgTheme;
  if (apply) apply(pref);
  else {
    root.setAttribute('data-theme', resolveTheme(pref, window.matchMedia('(prefers-color-scheme: light)').matches));
    root.setAttribute('data-theme-pref', pref);
  }
  window.setTimeout(() => root.removeAttribute('data-theme-switching'), 200);
}
