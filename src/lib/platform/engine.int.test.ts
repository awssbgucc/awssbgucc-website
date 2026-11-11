import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { balances, cancelRedemption, checkInByEditor, checkInWithCode, redeem, removeCheckIn, reviewSubmission, RuleError } from './engine';

// Each run makes its own users and events with a unique prefix, and removes them afterwards.
const run = randomUUID().slice(0, 8);
const id = (name: string) => `int-${run}-${name}`;
const HOUR = 60 * 60 * 1000;

async function makeMember(name: string, referredById: string | null = null) {
  const userId = id(name);
  await db.user.create({ data: { id: userId, name, email: `${userId}@example.test`, emailVerified: true } });
  await db.memberProfile.create({
    data: { userId, handle: userId, displayName: name, referralCode: userId.toUpperCase(), referredById, onboardedAt: new Date() },
  });
  return userId;
}

async function makeEvent(name: string, window: 'open' | 'closed' = 'open') {
  const now = Date.now();
  const opens = window === 'open' ? now - HOUR : now - 5 * HOUR;
  const closes = window === 'open' ? now + HOUR : now - 4 * HOUR;
  return db.event.create({
    data: {
      id: id(name),
      slug: id(name),
      title: `Integration ${name}`,
      tag: 'BUILD',
      format: 'IN_PERSON',
      startsAt: new Date(opens),
      endsAt: new Date(closes),
      summary: 's',
      body: 'b',
      status: 'PUBLISHED',
      checkInCode: 'ABC234',
      checkInOpensAt: new Date(opens),
      checkInClosesAt: new Date(closes),
    },
  });
}

let ama: string;
let kofi: string;

beforeAll(async () => {
  // The award rules and achievements come from the seed. Make sure the ones these tests rely on exist.
  await db.awardRule.upsert({ where: { reason: 'CHECK_IN' }, create: { reason: 'CHECK_IN', xp: 50, credits: 10, description: 'test' }, update: { active: true } });
  await db.awardRule.upsert({ where: { reason: 'REFERRAL' }, create: { reason: 'REFERRAL', xp: 25, credits: 5, description: 'test' }, update: { active: true } });
  await db.awardRule.upsert({ where: { reason: 'SUBMISSION_APPROVED' }, create: { reason: 'SUBMISSION_APPROVED', xp: 150, credits: 30, description: 'test' }, update: { active: true } });
  ama = await makeMember('ama');
  kofi = await makeMember('kofi', ama);
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { startsWith: `int-${run}` } } });
  await db.challenge.deleteMany({ where: { id: { startsWith: `int-${run}` } } });
  await db.event.deleteMany({ where: { id: { startsWith: `int-${run}` } } });
  await db.reward.deleteMany({ where: { id: { startsWith: `int-${run}` } } });
  await db.auditLog.deleteMany({ where: { entityId: { startsWith: `int-${run}` } } });
});

describe('check-in', () => {
  it('records once and pays once, even when the same check-in arrives three times at once', async () => {
    const event = await makeEvent('once');
    const results = await Promise.allSettled([1, 2, 3].map(() => checkInWithCode(ama, event.slug, 'abc 234')));
    const statuses = results.map((r) => (r.status === 'fulfilled' ? r.value.status : 'error'));
    expect(statuses.filter((s) => s === 'recorded')).toHaveLength(1);
    expect(await db.checkIn.count({ where: { eventId: event.id, userId: ama } })).toBe(1);
    expect(await db.ledgerEntry.count({ where: { userId: ama, reason: 'CHECK_IN', sourceId: event.id } })).toBe(1);
  });

  it('refuses a wrong code and a closed window', async () => {
    const open = await makeEvent('wrong-code');
    await expect(checkInWithCode(ama, open.slug, 'ZZZZZZ')).rejects.toThrow(RuleError);
    const closed = await makeEvent('closed', 'closed');
    await expect(checkInWithCode(ama, closed.slug, 'ABC234')).rejects.toThrow(/closed/);
  });

  it('pays the referrer once, when the person referred attends a first session', async () => {
    const before = await db.ledgerEntry.count({ where: { userId: ama, reason: 'REFERRAL' } });
    const first = await makeEvent('ref-1');
    const second = await makeEvent('ref-2');
    await checkInWithCode(kofi, first.slug, 'ABC234');
    await checkInWithCode(kofi, second.slug, 'ABC234');
    expect(await db.ledgerEntry.count({ where: { userId: ama, reason: 'REFERRAL' } })).toBe(before + 1);
  });

  it('lets an editor add and remove a check-in, and removing takes the award back', async () => {
    const event = await makeEvent('editor', 'closed');
    const start = await balances(kofi);
    const result = await checkInByEditor(event.id, kofi, 'editor@example.test');
    expect(result.status).toBe('recorded');
    expect((await balances(kofi)).xp).toBeGreaterThan(start.xp);
    expect(await removeCheckIn(event.id, kofi, 'editor@example.test')).toBe(true);
    expect(await db.ledgerEntry.count({ where: { userId: kofi, reason: 'CHECK_IN', sourceId: event.id } })).toBe(0);
    expect(await db.auditLog.count({ where: { entityId: event.id, action: 'checkin.remove' } })).toBe(1);
  });
});

describe('achievements', () => {
  it('gives the first session achievement exactly once', async () => {
    const first = await db.achievement.upsert({
      where: { code: 'first-session' },
      create: { code: 'first-session', title: 'First session', description: 'd', criterion: 'SESSIONS_ATTENDED', threshold: 1, xp: 10 },
      update: { active: true },
    });
    const member = await makeMember('achiever');
    await checkInWithCode(member, (await makeEvent('ach-1')).slug, 'ABC234');
    await checkInWithCode(member, (await makeEvent('ach-2')).slug, 'ABC234');
    expect(await db.memberAchievement.count({ where: { userId: member, achievementId: first.id } })).toBe(1);
    expect(await db.ledgerEntry.count({ where: { userId: member, reason: 'ACHIEVEMENT', sourceId: first.id } })).toBe(1);
  });
});

describe('submission review', () => {
  it('pays on approval once and refuses a second review of an approved submission', async () => {
    const challenge = await db.challenge.create({
      data: { id: id('challenge'), slug: id('challenge'), title: 'C', summary: 's', brief: 'b', requirements: 'r', startsAt: new Date(), endsAt: new Date(Date.now() + HOUR), status: 'PUBLISHED', xp: 70, credits: 7 },
    });
    const submission = await db.submission.create({ data: { challengeId: challenge.id, userId: ama, repoUrl: 'https://github.com/example/repo' } });
    await reviewSubmission(submission.id, { status: 'APPROVED', score: 80, feedback: 'Good' }, 'editor@example.test');
    await expect(reviewSubmission(submission.id, { status: 'APPROVED', score: 90, feedback: null }, 'editor@example.test')).rejects.toThrow(/already approved/);
    const entries = await db.ledgerEntry.findMany({ where: { userId: ama, reason: 'SUBMISSION_APPROVED', sourceId: submission.id } });
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ xp: 70, credits: 7 });
  });

  it('refuses a score above the maximum', async () => {
    const challenge = await db.challenge.create({
      data: { id: id('challenge-2'), slug: id('challenge-2'), title: 'C2', summary: 's', brief: 'b', requirements: 'r', startsAt: new Date(), endsAt: new Date(Date.now() + HOUR), status: 'PUBLISHED', maxScore: 10 },
    });
    const submission = await db.submission.create({ data: { challengeId: challenge.id, userId: kofi, repoUrl: 'https://github.com/example/repo' } });
    await expect(reviewSubmission(submission.id, { status: 'APPROVED', score: 11, feedback: null }, 'e@example.test')).rejects.toThrow(/between 0 and 10/);
  });
});

describe('credits and rewards', () => {
  it('never lets two redemptions at once spend the same credits, and refunds on cancel', async () => {
    const member = await makeMember('spender');
    await db.ledgerEntry.create({ data: { userId: member, credits: 50, reason: 'ADJUSTMENT', sourceId: randomUUID(), note: 'test' } });
    const rewardA = await db.reward.create({ data: { id: id('reward-a'), slug: id('reward-a'), name: 'A', description: 'd', kind: 'BANNER', value: 'tide', cost: 40, available: true } });
    const rewardB = await db.reward.create({ data: { id: id('reward-b'), slug: id('reward-b'), name: 'B', description: 'd', kind: 'BANNER', value: 'scan', cost: 40, available: true } });
    const results = await Promise.allSettled([redeem(member, rewardA.id), redeem(member, rewardB.id)]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect((await balances(member)).credits).toBe(10);

    const done = results.find((r) => r.status === 'fulfilled') as PromiseFulfilledResult<{ id: string }>;
    await cancelRedemption(done.value.id, 'admin@example.test', 'test');
    expect((await balances(member)).credits).toBe(50);
    await expect(cancelRedemption(done.value.id, 'admin@example.test', null)).rejects.toThrow(/already cancelled/);
    expect((await balances(member)).credits).toBe(50);
  });

  it('respects stock and the per-member limit, and refuses unavailable rewards', async () => {
    const member = await makeMember('collector');
    await db.ledgerEntry.create({ data: { userId: member, credits: 500, reason: 'ADJUSTMENT', sourceId: randomUUID(), note: 'test' } });
    const limited = await db.reward.create({ data: { id: id('reward-stock'), slug: id('reward-stock'), name: 'Limited', description: 'd', kind: 'PHYSICAL', cost: 10, stock: 1, perMemberLimit: 5, available: true } });
    const first = await redeem(member, limited.id);
    expect(first.status).toBe('PENDING');
    await expect(redeem(member, limited.id)).rejects.toThrow(/out of stock/);
    const off = await db.reward.create({ data: { id: id('reward-off'), slug: id('reward-off'), name: 'Off', description: 'd', kind: 'OTHER', cost: 1, available: false } });
    await expect(redeem(member, off.id)).rejects.toThrow(/not available/);
  });
});
