// Shared copy rules. Used by scripts/check-copy.mjs (repo scan) and by
// src/lib/copy-rules.ts (admin form validation), so the codebase and the
// live site follow the same rules.
// check-copy:off

/** Characters that are never allowed. Written as escapes so this file stays clean. */
export const BANNED_CHARS = [
  { char: '—', name: 'em dash' },
  { char: '–', name: 'en dash' },
  { char: '―', name: 'horizontal bar' },
];

/** Pictographic symbols that count as legal marks, not emojis. */
const ALLOWED_SYMBOLS = new Set(['©', '®', '™']); // copyright, registered, trademark

const EMOJI = /\p{Extended_Pictographic}/gu;

/**
 * Phrases that read as machine-written. `level: 'error'` fails the check,
 * `level: 'warn'` is printed for a human to judge in context.
 */
export const BANNED_PHRASES = [
  ['delve', 'error'], ['unlock', 'error'], ['unleash', 'error'], ['elevate', 'error'],
  ['empower', 'error'], ['empowering', 'error'], ['harness', 'error'], ['leverage', 'error'],
  ['seamless', 'error'], ['seamlessly', 'error'], ['robust', 'error'], ['cutting-edge', 'error'],
  ['game-changer', 'error'], ['game changer', 'error'], ['world-class', 'error'],
  ['state-of-the-art', 'error'], ['supercharge', 'error'], ['revolutionize', 'error'],
  ['revolutionise', 'error'], ['transformative', 'error'], ['tapestry', 'error'],
  ['landscape', 'error'], ['realm', 'error'], ['embark', 'error'],
  ['next generation of', 'error'], ['vibrant community', 'error'], ['look no further', 'error'],
  ["whether you're a", 'error'], ['whether you are a', 'error'], ["in today's fast-paced", 'error'],
  ['lorem ipsum', 'error'], ['take it to the next level', 'error'],
  ["it's not just", 'warn'], ['journey', 'warn'], ['ready to', 'warn'], ['dive into', 'warn'],
  ['passionate', 'warn'], ['innovative', 'warn'], ['exciting', 'warn'],
].map(([phrase, level]) => ({
  phrase,
  level,
  re: new RegExp(`(^|[^a-z])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^a-z])`, 'i'),
}));
// check-copy:on

/**
 * Returns a list of problems in a piece of text.
 * @param {string} text
 * @returns {{ level: 'error' | 'warn', message: string, index: number }[]}
 */
export function findCopyIssues(text) {
  const issues = [];
  for (const { char, name } of BANNED_CHARS) {
    let i = text.indexOf(char);
    while (i !== -1) {
      issues.push({ level: 'error', message: `${name} found`, index: i });
      i = text.indexOf(char, i + 1);
    }
  }
  for (const m of text.matchAll(EMOJI)) {
    if (ALLOWED_SYMBOLS.has(m[0])) continue;
    issues.push({ level: 'error', message: `emoji "${m[0]}" found`, index: m.index });
  }
  for (const { phrase, level, re } of BANNED_PHRASES) {
    const m = re.exec(text);
    if (m) issues.push({ level, message: `phrase "${phrase}"`, index: m.index });
  }
  return issues;
}

/** True when text has no error-level issues. For use in zod refinements. */
export function isCleanCopy(text) {
  return !findCopyIssues(text).some((i) => i.level === 'error');
}
