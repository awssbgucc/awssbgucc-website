'use client';

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useRef, useSyncExternalStore, type KeyboardEvent } from 'react';
import { parsePref, setThemePref, type ThemePref } from '@/lib/theme';

const OPTIONS: { value: ThemePref; label: string; Icon: LucideIcon }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme-pref'] });
  return () => observer.disconnect();
}
const current = () => parsePref(document.documentElement.getAttribute('data-theme-pref'));
// The server cannot know the choice. The active option is drawn by CSS from <html data-theme-pref> until hydration.
const serverValue = () => null;

/** The selector with its label, for sidebars, onboarding and sign-in. */
export function AppearanceRow({ className = '' }: { className?: string }) {
  return (
    <div className={`theme-row flex items-center justify-between gap-3 ${className}`}>
      <span className="type-label text-text-muted" aria-hidden>
        Appearance
      </span>
      <ThemeSelector />
    </div>
  );
}

/**
 * System, Light or Dark, as a radio group. Arrow keys move and choose, like any radio group.
 * `labelled` shows the words beside the icons, for menus and sidebars; the compact form is for the header.
 */
export function ThemeSelector({ labelled = false, className = '' }: { labelled?: boolean; className?: string }) {
  const value = useSyncExternalStore(subscribe, current, serverValue);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = OPTIONS.length - 1;
    const next = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = next < 0 ? last : next > last ? 0 : next;
    setThemePref(OPTIONS[target].value);
    buttons.current[target]?.focus();
  }

  return (
    <div role="radiogroup" aria-label="Appearance" className={`theme-selector ${labelled ? 'theme-selector-labelled' : ''} ${className}`}>
      {OPTIONS.map(({ value: option, label, Icon }, index) => {
        const checked = value === option;
        return (
          <button
            key={option}
            ref={(element) => { buttons.current[index] = element; }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={labelled ? undefined : label}
            title={labelled ? undefined : label}
            tabIndex={checked || (value === null && index === 0) ? 0 : -1}
            data-value={option}
            className="theme-option"
            onClick={() => setThemePref(option)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <Icon aria-hidden size={16} strokeWidth={1.75} />
            {labelled && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
