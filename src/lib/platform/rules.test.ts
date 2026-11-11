import { describe, expect, it } from 'vitest';
import { ownedKeys } from './customise';
import {
  checkInState,
  codesMatch,
  defaultCheckInWindow,
  dueAchievements,
  handleError,
  levelFor,
  makeCode,
  nextWindow,
  normaliseCode,
  redemptionError,
  sessionStreak,
  suggestHandle,
} from './rules';

const day = (n: number) => new Date(Date.UTC(2026, 9, n, 10));

describe('levels', () => {
  it('starts at level 1 and moves up at each threshold', () => {
    expect(levelFor(0)).toMatchObject({ level: 1, floor: 0, next: 100, toNext: 100 });
    expect(levelFor(99).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(260)).toMatchObject({ level: 3, toNext: 240 });
  });

  it('caps at the last level and never goes below zero', () => {
    expect(levelFor(1_000_000)).toMatchObject({ level: 10, next: null, progress: 1 });
    expect(levelFor(-50)).toMatchObject({ level: 1, xp: 0 });
  });
});

describe('session streaks', () => {
  const sessions = [1, 2, 3, 4, 5].map((n) => ({ id: `s${n}`, startsAt: day(n), checkInClosesAt: day(n) }));

  it('counts consecutive sessions attended, not days', () => {
    expect(sessionStreak(sessions, new Set(['s1', 's2', 's4', 's5']), day(20))).toEqual({ current: 2, longest: 2 });
    expect(sessionStreak(sessions, new Set(['s1', 's2', 's3']), day(20))).toEqual({ current: 0, longest: 3 });
  });

  it('does not break a streak on a session whose check-in is still open', () => {
    const open = [...sessions.slice(0, 2), { id: 's3', startsAt: day(3), checkInClosesAt: day(30) }];
    expect(sessionStreak(open, new Set(['s1', 's2']), day(3)).current).toBe(2);
  });

  it('ignores sessions that never opened check-in', () => {
    const unopened = [...sessions.slice(0, 2), { id: 'x', startsAt: day(3), checkInClosesAt: null }];
    expect(sessionStreak(unopened, new Set(['s1', 's2']), day(20)).current).toBe(2);
  });
});

describe('achievements', () => {
  const rules = [
    { id: 'a', criterion: 'SESSIONS_ATTENDED' as const, threshold: 1, active: true },
    { id: 'b', criterion: 'SESSIONS_ATTENDED' as const, threshold: 5, active: true },
    { id: 'c', criterion: 'PROJECTS_APPROVED' as const, threshold: 1, active: false },
  ];
  const counts = { SESSIONS_ATTENDED: 5, SESSION_STREAK: 0, SUBMISSIONS_APPROVED: 0, PROJECTS_APPROVED: 3, REFERRALS: 0 };

  it('awards what is earned, once, and skips inactive rules', () => {
    expect(dueAchievements(rules, counts, new Set()).map((r) => r.id)).toEqual(['a', 'b']);
    expect(dueAchievements(rules, counts, new Set(['a'])).map((r) => r.id)).toEqual(['b']);
  });
});

describe('check-in codes', () => {
  it('uses an unambiguous alphabet and the requested length', () => {
    const code = makeCode(new Uint8Array([0, 1, 2, 3, 4, 255, 9, 9]));
    expect(code).toHaveLength(6);
    expect(code).not.toMatch(/[01OIL]/);
  });

  it('matches regardless of case, spaces and hyphens', () => {
    expect(normaliseCode(' ab-c 23 ')).toBe('ABC23');
    expect(codesMatch('ABC234', 'abc 234')).toBe(true);
    expect(codesMatch('ABC234', 'ABC235')).toBe(false);
    expect(codesMatch('ABC234', '')).toBe(false);
  });

  it('knows when the window is open', () => {
    const event = { checkInCode: 'ABC234', checkInOpensAt: day(2), checkInClosesAt: day(3) };
    expect(checkInState(event, day(1))).toBe('not-open');
    expect(checkInState(event, day(2))).toBe('open');
    expect(checkInState(event, day(4))).toBe('closed');
    expect(checkInState({ ...event, checkInCode: null }, day(2))).toBe('not-set');
  });

  it('opens 30 minutes before and closes 30 minutes after by default', () => {
    const start = new Date('2026-11-14T09:30:00Z');
    const end = new Date('2026-11-14T13:00:00Z');
    const window = defaultCheckInWindow(start, end);
    expect(window.opensAt.toISOString()).toBe('2026-11-14T09:00:00.000Z');
    expect(window.closesAt.toISOString()).toBe('2026-11-14T13:30:00.000Z');
  });
});

describe('handles', () => {
  it('accepts simple lowercase handles and rejects the rest', () => {
    expect(handleError('ama-mensah')).toBeNull();
    expect(handleError('Am')).not.toBeNull();
    expect(handleError('-ama')).not.toBeNull();
    expect(handleError('ama--m')).not.toBeNull();
    expect(handleError('admin')).not.toBeNull();
  });

  it('suggests a valid handle from a name', () => {
    expect(suggestHandle('Joel Anarba Amuni')).toBe('joel-anarba-amuni');
    expect(handleError(suggestHandle('Al'))).toBeNull();
  });
});

describe('rate limit windows', () => {
  const now = day(1);
  it('counts within a window and refuses past the limit', () => {
    const first = nextWindow(null, now, 2, 60_000);
    expect(first).toMatchObject({ allowed: true, count: 1 });
    const second = nextWindow(first, now, 2, 60_000);
    expect(second).toMatchObject({ allowed: true, count: 2 });
    expect(nextWindow(second, now, 2, 60_000).allowed).toBe(false);
    expect(nextWindow(second, new Date(now.getTime() + 61_000), 2, 60_000)).toMatchObject({ allowed: true, count: 1 });
  });
});

describe('redemptions', () => {
  const reward = { available: true, cost: 50, stock: 3, perMemberLimit: 1 };
  it('explains why a redemption is refused', () => {
    expect(redemptionError({ reward, balance: 60, alreadyRedeemed: 0 })).toBeNull();
    expect(redemptionError({ reward: { ...reward, available: false }, balance: 60, alreadyRedeemed: 0 })).toMatch(/not available/);
    expect(redemptionError({ reward: { ...reward, stock: 0 }, balance: 60, alreadyRedeemed: 0 })).toMatch(/out of stock/);
    expect(redemptionError({ reward, balance: 60, alreadyRedeemed: 1 })).toMatch(/already/);
    expect(redemptionError({ reward, balance: 20, alreadyRedeemed: 0 })).toBe('You need 30 more credits.');
  });
});

describe('customisation', () => {
  it('allows free keys and owned reward values only', () => {
    const keys = ownedKeys('BANNER', [
      { kind: 'BANNER', value: 'tide' },
      { kind: 'ACCENT', value: 'sky' },
    ]);
    expect(keys.has('grid')).toBe(true);
    expect(keys.has('tide')).toBe(true);
    expect(keys.has('cells')).toBe(false);
    expect(keys.has('sky')).toBe(false);
  });
});
