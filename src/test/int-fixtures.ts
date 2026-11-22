import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db';

const HOUR = 60 * 60 * 1000;

/** PGlite runs one transaction at a time, so a race test passes there whatever the code does. */
export async function runsConcurrently() {
  const [{ version }] = await db.$queryRaw<{ version: string }[]>`SELECT version()`;
  return !/wasm32|emscripten/i.test(version);
}

/** The award rules the engine tests rely on. The seed makes them in a real database. */
export async function ensureRules() {
  await db.awardRule.upsert({ where: { reason: 'CHECK_IN' }, create: { reason: 'CHECK_IN', xp: 50, credits: 10, description: 'test' }, update: { active: true } });
  await db.awardRule.upsert({ where: { reason: 'REFERRAL' }, create: { reason: 'REFERRAL', xp: 25, credits: 5, description: 'test' }, update: { active: true } });
  await db.awardRule.upsert({ where: { reason: 'SUBMISSION_APPROVED' }, create: { reason: 'SUBMISSION_APPROVED', xp: 150, credits: 30, description: 'test' }, update: { active: true } });
}

/** Records for one test file, all named with a unique prefix so cleanUp() removes only what this run made. */
export function fixtures() {
  const run = randomUUID().slice(0, 8);
  const id = (name: string) => `int-${run}-${name}`;

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

  async function cleanUp() {
    await db.user.deleteMany({ where: { id: { startsWith: `int-${run}` } } });
    await db.challenge.deleteMany({ where: { id: { startsWith: `int-${run}` } } });
    await db.event.deleteMany({ where: { id: { startsWith: `int-${run}` } } });
    await db.reward.deleteMany({ where: { id: { startsWith: `int-${run}` } } });
    await db.auditLog.deleteMany({ where: { entityId: { startsWith: `int-${run}` } } });
  }

  return { run, id, makeMember, makeEvent, cleanUp, HOUR };
}
