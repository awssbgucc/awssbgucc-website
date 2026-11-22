import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { ensureRules, fixtures, runsConcurrently } from '@/test/int-fixtures';
import { balances, cancelRedemption, checkInByEditor, checkInWithCode, redeem, reviewSubmission } from './engine';
import { withinLimit } from './records';
import { REFERRAL_MONTHLY_CAP } from './rules';

// Requests that arrive at the same moment, on a real PostgreSQL server. PGlite runs one transaction
// at a time, so there these tests would pass whatever the code did; they are skipped instead.
// A race does not lose every time, so each case runs several rounds.
const concurrent = await runsConcurrently();
const ROUNDS = 5;
const rounds = Array.from({ length: ROUNDS }, (_, i) => i);
const { id, makeMember, makeEvent, cleanUp, HOUR } = fixtures();

const fulfilled = <T>(results: PromiseSettledResult<T>[]) => results.filter((r): r is PromiseFulfilledResult<T> => r.status === 'fulfilled');

async function giveCredits(userId: string, credits: number) {
  await db.ledgerEntry.create({ data: { userId, credits, reason: 'ADJUSTMENT', sourceId: randomUUID(), note: 'test' } });
}

beforeAll(ensureRules);
afterAll(async () => {
  await cleanUp();
  await db.rateLimit.deleteMany({ where: { key: { startsWith: id('') } } });
});

describe.skipIf(!concurrent)('at the same moment, on real PostgreSQL', () => {
  it('a rate limit lets exactly its limit through a burst', async () => {
    const results = await Promise.all(rounds.map((r) => Promise.all(Array.from({ length: 15 }, () => withinLimit(id(`limit-${r}`), 5, 60_000)))));
    expect(results.map((burst) => burst.filter(Boolean).length)).toEqual(rounds.map(() => 5));
  });

  it('two redemptions by one member never spend the same credits', async () => {
    for (const r of rounds) {
      const member = await makeMember(`spender-${r}`);
      await giveCredits(member, 50);
      const rewards = await Promise.all(['a', 'b'].map((k) => db.reward.create({ data: { id: id(`spend-${r}-${k}`), slug: id(`spend-${r}-${k}`), name: k, description: 'd', kind: 'OTHER', cost: 40, available: true } })));
      const results = await Promise.allSettled(rewards.map((reward) => redeem(member, reward.id)));
      expect(fulfilled(results)).toHaveLength(1);
      expect((await balances(member)).credits).toBe(10);
    }
  });

  it('the last item in stock goes to one member', async () => {
    for (const r of rounds) {
      const members = await Promise.all([1, 2, 3, 4, 5, 6].map((n) => makeMember(`stock-${r}-${n}`)));
      await Promise.all(members.map((m) => giveCredits(m, 10)));
      const reward = await db.reward.create({ data: { id: id(`stock-${r}`), slug: id(`stock-${r}`), name: 'Last one', description: 'd', kind: 'PHYSICAL', cost: 5, stock: 1, available: true } });
      const results = await Promise.allSettled(members.map((m) => redeem(m, reward.id)));
      expect(fulfilled(results)).toHaveLength(1);
      expect((await db.reward.findUniqueOrThrow({ where: { id: reward.id } })).stock).toBe(0);
      expect(await db.redemption.count({ where: { rewardId: reward.id } })).toBe(1);
    }
  });

  it('a redemption cancelled twice at once is refunded once', async () => {
    for (const r of rounds) {
      const member = await makeMember(`refund-${r}`);
      await giveCredits(member, 40);
      const reward = await db.reward.create({ data: { id: id(`refund-${r}`), slug: id(`refund-${r}`), name: 'R', description: 'd', kind: 'PHYSICAL', cost: 40, stock: 3, available: true } });
      const redemption = await redeem(member, reward.id);
      const results = await Promise.allSettled([1, 2, 3].map(() => cancelRedemption(redemption.id, 'admin@example.test', null)));
      expect(fulfilled(results)).toHaveLength(1);
      expect((await balances(member)).credits).toBe(40);
      expect((await db.reward.findUniqueOrThrow({ where: { id: reward.id } })).stock).toBe(3);
    }
  });

  it('a submission approved by two editors at once pays once', async () => {
    const member = await makeMember('submitter');
    for (const r of rounds) {
      const challenge = await db.challenge.create({
        data: { id: id(`challenge-${r}`), slug: id(`challenge-${r}`), title: 'C', summary: 's', brief: 'b', requirements: 'r', startsAt: new Date(), endsAt: new Date(Date.now() + HOUR), status: 'PUBLISHED', xp: 70, credits: 7 },
      });
      const submission = await db.submission.create({ data: { challengeId: challenge.id, userId: member, repoUrl: 'https://github.com/example/repo' } });
      const results = await Promise.allSettled(['one', 'two'].map((editor) => reviewSubmission(submission.id, { status: 'APPROVED', score: 80, feedback: null }, `${editor}@example.test`)));
      expect(fulfilled(results)).toHaveLength(1);
      expect(await db.ledgerEntry.count({ where: { userId: member, reason: 'SUBMISSION_APPROVED', sourceId: submission.id } })).toBe(1);
    }
  });

  it('a member and an editor checking the same person in at once record one check-in', async () => {
    const member = await makeMember('both-ways');
    for (const r of rounds) {
      const event = await makeEvent(`both-${r}`);
      await Promise.allSettled([checkInWithCode(member, event.slug, 'ABC234'), checkInByEditor(event.id, member, 'editor@example.test')]);
      expect(await db.checkIn.count({ where: { eventId: event.id, userId: member } })).toBe(1);
      expect(await db.ledgerEntry.count({ where: { userId: member, reason: 'CHECK_IN', sourceId: event.id } })).toBe(1);
    }
  });

  it('someone referred checking in at two sessions at once pays the referrer once', async () => {
    for (const r of rounds) {
      const referrer = await makeMember(`referrer-${r}`);
      const referred = await makeMember(`referred-${r}`, referrer);
      const events = await Promise.all(['a', 'b'].map((k) => makeEvent(`first-${r}-${k}`)));
      await Promise.all(events.map((event) => checkInWithCode(referred, event.slug, 'ABC234')));
      expect(await db.ledgerEntry.count({ where: { userId: referrer, reason: 'REFERRAL' } })).toBe(1);
    }
  });

  it('the monthly referral cap holds when two people referred attend at once', async () => {
    for (const r of rounds) {
      const referrer = await makeMember(`capped-${r}`);
      await db.ledgerEntry.createMany({
        data: Array.from({ length: REFERRAL_MONTHLY_CAP - 1 }, () => ({ userId: referrer, reason: 'REFERRAL' as const, sourceId: randomUUID(), xp: 25, credits: 5 })),
      });
      const referred = await Promise.all(['a', 'b', 'c'].map((k) => makeMember(`capped-${r}-${k}`, referrer)));
      const event = await makeEvent(`capped-${r}`);
      await Promise.all(referred.map((m) => checkInWithCode(m, event.slug, 'ABC234')));
      expect(await db.ledgerEntry.count({ where: { userId: referrer, reason: 'REFERRAL' } })).toBe(REFERRAL_MONTHLY_CAP);
    }
  });
});
