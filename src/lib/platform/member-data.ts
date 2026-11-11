import { db } from '@/lib/db';
import { balances } from './engine';
import { levelFor, sessionStreak } from './rules';

// Read-only views of a member's own record, for the portal. Everything is computed from stored records.

/** Sessions that ran check-in, oldest first. These are the cells of the participation grid. */
export function checkInSessions() {
  return db.event.findMany({
    where: { status: 'PUBLISHED', checkInOpensAt: { not: null } },
    orderBy: { startsAt: 'asc' },
    select: { id: true, slug: true, title: true, startsAt: true, endsAt: true, checkInClosesAt: true },
  });
}

export async function memberRecord(userId: string, now = new Date()) {
  const [totals, sessions, checkIns, approvedSubmissions, approvedProjects, achievements] = await Promise.all([
    balances(userId),
    checkInSessions(),
    db.checkIn.findMany({ where: { userId }, select: { eventId: true, createdAt: true } }),
    db.submission.count({ where: { userId, status: 'APPROVED' } }),
    db.project.count({ where: { ownerId: userId, status: 'APPROVED' } }),
    db.memberAchievement.count({ where: { userId } }),
  ]);
  const attended = new Set(checkIns.map((c) => c.eventId));
  return {
    ...totals,
    level: levelFor(totals.xp),
    sessions,
    attended,
    streak: sessionStreak(sessions, attended, now),
    counts: { sessions: attended.size, approvedSubmissions, approvedProjects, achievements },
  };
}

/** Rewards the member owns and can use: fulfilled redemptions of digital kinds. */
export async function ownedRewardValues(userId: string) {
  const owned = await db.redemption.findMany({ where: { userId, status: 'FULFILLED' }, select: { reward: { select: { kind: true, value: true } } } });
  return owned.map((r) => r.reward);
}

export function activeAnnouncements(now = new Date()) {
  return db.announcement.findMany({
    where: { status: 'PUBLISHED', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });
}

export function openChallenges(now = new Date()) {
  return db.challenge.findMany({ where: { status: 'PUBLISHED', endsAt: { gte: now } }, orderBy: { endsAt: 'asc' } });
}

/** Days with verified activity, for the participation calendar. */
export async function activityDays(userId: string) {
  const since = new Date(Date.now() - 27 * 7 * 24 * 60 * 60 * 1000);
  const entries = await db.ledgerEntry.findMany({
    where: { userId, createdAt: { gte: since }, reason: { in: ['CHECK_IN', 'SUBMISSION_APPROVED', 'PROJECT_APPROVED', 'ACHIEVEMENT'] } },
    select: { createdAt: true },
  });
  return entries.map((e) => e.createdAt);
}
