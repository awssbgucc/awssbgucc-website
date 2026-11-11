// Pure rules for the builder portal: levels, streaks, achievements, check-in codes, handles,
// referral codes, rate limit windows and redemption checks. No database, so they are tested directly.

export type Criterion = 'SESSIONS_ATTENDED' | 'SESSION_STREAK' | 'SUBMISSIONS_APPROVED' | 'PROJECTS_APPROVED' | 'REFERRALS';

/* Levels */

/** XP needed to reach each level. Level 1 starts at 0. Published on /builder/progress so the rules are visible. */
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600] as const;

export function levelFor(xp: number) {
  const total = Math.max(0, Math.floor(xp));
  let index = 0;
  while (index + 1 < LEVEL_THRESHOLDS.length && total >= LEVEL_THRESHOLDS[index + 1]) index += 1;
  const floor = LEVEL_THRESHOLDS[index];
  const next = index + 1 < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[index + 1] : null;
  return {
    level: index + 1,
    xp: total,
    floor,
    next,
    toNext: next === null ? 0 : next - total,
    progress: next === null ? 1 : (total - floor) / (next - floor),
  };
}

/* Session streaks: consecutive sessions attended, never days or app visits */

type CountedSession = { id: string; startsAt: Date; checkInClosesAt: Date | null };

/**
 * Sessions count once their check-in has closed, or once the member has checked in.
 * A session still open for check-in does not break a streak.
 */
export function sessionStreak(sessions: CountedSession[], attended: Set<string>, now: Date) {
  const counted = sessions
    .filter((session) => attended.has(session.id) || (session.checkInClosesAt !== null && session.checkInClosesAt <= now))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  let longest = 0;
  let run = 0;
  for (const session of counted) {
    run = attended.has(session.id) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return { current: run, longest };
}

/* Achievements */

export type AchievementRule = { id: string; criterion: Criterion; threshold: number; active: boolean };

/** Active achievements the member has earned but not yet been given. */
export function dueAchievements<T extends AchievementRule>(rules: T[], counts: Record<Criterion, number>, owned: Set<string>) {
  return rules.filter((rule) => rule.active && !owned.has(rule.id) && counts[rule.criterion] >= rule.threshold);
}

export const CRITERION_LABELS: Record<Criterion, string> = {
  SESSIONS_ATTENDED: 'Sessions attended',
  SESSION_STREAK: 'Sessions in a row',
  SUBMISSIONS_APPROVED: 'Challenge submissions approved',
  PROJECTS_APPROVED: 'Projects approved',
  REFERRALS: 'Friends who attended a session',
};

/* Check-in */

// No 0, O, 1, I or L, so a code read off a projector is not mistyped.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CHECK_IN_CODE_LENGTH = 6;

/** Pass crypto random bytes, one per character. */
export function makeCode(bytes: Uint8Array, length = CHECK_IN_CODE_LENGTH) {
  return Array.from(bytes.slice(0, length), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

export function normaliseCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

type CheckInWindow = { checkInCode: string | null; checkInOpensAt: Date | null; checkInClosesAt: Date | null };

export function checkInState(event: CheckInWindow, now: Date): 'not-set' | 'not-open' | 'open' | 'closed' {
  if (!event.checkInCode || !event.checkInOpensAt || !event.checkInClosesAt) return 'not-set';
  if (now < event.checkInOpensAt) return 'not-open';
  if (now > event.checkInClosesAt) return 'closed';
  return 'open';
}

const MINUTE = 60 * 1000;

/** The default window: from 30 minutes before the start to 30 minutes after the end. */
export function defaultCheckInWindow(startsAt: Date, endsAt: Date) {
  return { opensAt: new Date(startsAt.getTime() - 30 * MINUTE), closesAt: new Date(endsAt.getTime() + 30 * MINUTE) };
}

/** Constant-time comparison of two normalised codes. */
export function codesMatch(expected: string, given: string) {
  const a = normaliseCode(expected);
  const b = normaliseCode(given);
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* Handles and referral codes */

const RESERVED_HANDLES = new Set(['admin', 'builder', 'builders', 'api', 'new', 'edit', 'me', 'settings', 'sign-in', 'team', 'ucc', 'aws']);

export function handleError(handle: string) {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(handle)) return 'Use 3 to 30 lowercase letters, numbers or hyphens.';
  if (handle.includes('--')) return 'Use single hyphens only.';
  if (RESERVED_HANDLES.has(handle)) return 'That handle is reserved. Choose another.';
  return null;
}

export function suggestHandle(name: string) {
  const base = name
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return base.length >= 3 ? base : `builder-${base}`.replace(/-$/, '');
}

export function makeReferralCode(bytes: Uint8Array) {
  return makeCode(bytes, 8);
}

/** Verified referral awards a member can earn in one calendar month. */
export const REFERRAL_MONTHLY_CAP = 10;

/* Rate limits */

export function nextWindow(existing: { count: number; resetAt: Date } | null, now: Date, max: number, windowMs: number) {
  if (!existing || existing.resetAt <= now) return { allowed: true, count: 1, resetAt: new Date(now.getTime() + windowMs) };
  if (existing.count >= max) return { allowed: false, count: existing.count, resetAt: existing.resetAt };
  return { allowed: true, count: existing.count + 1, resetAt: existing.resetAt };
}

/* Redemptions */

type RedeemCheck = {
  reward: { available: boolean; cost: number; stock: number | null; perMemberLimit: number };
  balance: number;
  alreadyRedeemed: number;
};

export function redemptionError({ reward, balance, alreadyRedeemed }: RedeemCheck) {
  if (!reward.available) return 'This reward is not available.';
  if (reward.stock !== null && reward.stock <= 0) return 'This reward is out of stock.';
  if (alreadyRedeemed >= reward.perMemberLimit) return 'You have already redeemed this reward.';
  if (balance < reward.cost) return `You need ${reward.cost - balance} more credits.`;
  return null;
}

/** Digital rewards are ready at once. Anything physical waits for a person to hand it over. */
export function isDigitalKind(kind: string) {
  return kind === 'BANNER' || kind === 'ACCENT' || kind === 'FRAME' || kind === 'TITLE';
}
