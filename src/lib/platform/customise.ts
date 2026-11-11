// Profile customisation. Every option is built from the design tokens, so nothing here imitates AWS branding.
// Free options are open to every member. The rest need a fulfilled redemption whose reward value is the key.

export type CustomKind = 'BANNER' | 'ACCENT' | 'FRAME' | 'TITLE';

type Option = { key: string; label: string; free: boolean };

export const BANNERS: Option[] = [
  { key: 'grid', label: 'Grid', free: true },
  { key: 'coast', label: 'Coastline', free: true },
  { key: 'cells', label: 'Pixel cells', free: false },
  { key: 'scan', label: 'Scan lines', free: false },
  { key: 'tide', label: 'Tide', free: false },
];

export const ACCENTS: Option[] = [
  { key: 'lime', label: 'Lime', free: true },
  { key: 'cyan', label: 'Cyan', free: true },
  { key: 'sky', label: 'Sky', free: false },
  { key: 'lavender', label: 'Lavender', free: false },
];

export const FRAMES: Option[] = [
  { key: 'none', label: 'No frame', free: true },
  { key: 'pixel', label: 'Pixel corners', free: false },
  { key: 'double', label: 'Double line', free: false },
];

// Group titles only. Never AWS certification names, so nobody mistakes them for credentials.
export const TITLES: Option[] = [
  { key: 'lab-regular', label: 'Lab regular', free: false },
  { key: 'first-deploy', label: 'First deploy', free: false },
  { key: 'peer-reviewer', label: 'Peer reviewer', free: false },
  { key: 'night-builder', label: 'Night builder', free: false },
];

export const OPTIONS: Record<CustomKind, Option[]> = { BANNER: BANNERS, ACCENT: ACCENTS, FRAME: FRAMES, TITLE: TITLES };

export const DEFAULTS = { bannerKey: 'grid', accentKey: 'lime', frameKey: 'none', titleKey: null } as const;

export function optionLabel(kind: CustomKind, key: string | null) {
  return OPTIONS[kind].find((option) => option.key === key)?.label ?? null;
}

/** Keys the member may use: the free ones, plus values of rewards they own. */
export function ownedKeys(kind: CustomKind, owned: { kind: string; value: string | null }[]) {
  const keys = new Set(OPTIONS[kind].filter((option) => option.free).map((option) => option.key));
  for (const item of owned) if (item.kind === kind && item.value) keys.add(item.value);
  return keys;
}

export function isKnownKey(kind: CustomKind, key: string) {
  return OPTIONS[kind].some((option) => option.key === key);
}

/** Tailwind text and border classes for each accent, from the tokens. */
export const ACCENT_CLASSES: Record<string, { text: string; border: string; bg: string }> = {
  lime: { text: 'text-lime', border: 'border-lime', bg: 'bg-lime' },
  cyan: { text: 'text-cyan', border: 'border-cyan', bg: 'bg-cyan' },
  sky: { text: 'text-sky', border: 'border-sky', bg: 'bg-sky' },
  lavender: { text: 'text-lavender', border: 'border-lavender', bg: 'bg-lavender' },
};

export const INTERESTS = [
  'Cloud foundations',
  'Serverless',
  'Containers',
  'Data and analytics',
  'AI and machine learning',
  'Generative AI',
  'DevOps and CI/CD',
  'Security',
  'Networking',
  'Web development',
  'Mobile development',
  'Cloud Practitioner prep',
] as const;

export const LEVELS_OF_STUDY = ['Level 100', 'Level 200', 'Level 300', 'Level 400', 'Graduate', 'Other'] as const;
