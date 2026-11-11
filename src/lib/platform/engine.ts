import { randomUUID } from 'node:crypto';
import type { AwardReason, Prisma } from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { DEFAULTS } from './customise';
import { audit, notify } from './records';
import { codesMatch, checkInState, dueAchievements, isDigitalKind, redemptionError, REFERRAL_MONTHLY_CAP, sessionStreak, type Criterion } from './rules';

// Everything that changes XP, credits, check-ins or achievements goes through here, inside a transaction.
// Duplicate awards are stopped by unique keys (LedgerEntry userId + reason + sourceId, CheckIn eventId + userId,
// MemberAchievement userId + achievementId), so a double click or a retry cannot pay twice.

type Tx = Prisma.TransactionClient;

export class RuleError extends Error {}

/** Creates the entry unless it exists. True when it was created. */
async function awardOnce(tx: Tx, entry: { userId: string; reason: AwardReason; sourceId: string; xp: number; credits: number; note?: string; createdBy?: string }) {
  if (entry.xp === 0 && entry.credits === 0) return false;
  const { count } = await tx.ledgerEntry.createMany({ data: [entry], skipDuplicates: true });
  return count === 1;
}

async function activeRule(tx: Tx, reason: AwardReason) {
  const rule = await tx.awardRule.findUnique({ where: { reason } });
  return rule?.active ? rule : null;
}

/** Locks the member's profile row, so two spends for the same member run one after the other. */
async function lockMember(tx: Tx, userId: string) {
  await tx.$queryRaw`SELECT "userId" FROM "MemberProfile" WHERE "userId" = ${userId} FOR UPDATE`;
}

export async function balances(userId: string, tx: Tx = db) {
  const sum = await tx.ledgerEntry.aggregate({ where: { userId }, _sum: { xp: true, credits: true } });
  return { xp: sum._sum.xp ?? 0, credits: sum._sum.credits ?? 0 };
}

/** The numbers each achievement criterion is measured against, all from verified records. */
export async function criterionCounts(userId: string, tx: Tx = db, now = new Date()): Promise<Record<Criterion, number>> {
  const [checkIns, sessions, submissions, projects, referrals] = await Promise.all([
    tx.checkIn.findMany({ where: { userId }, select: { eventId: true } }),
    tx.event.findMany({ where: { status: 'PUBLISHED', checkInOpensAt: { not: null } }, select: { id: true, startsAt: true, checkInClosesAt: true } }),
    tx.submission.count({ where: { userId, status: 'APPROVED' } }),
    tx.project.count({ where: { ownerId: userId, status: 'APPROVED' } }),
    tx.ledgerEntry.count({ where: { userId, reason: 'REFERRAL' } }),
  ]);
  const attended = new Set(checkIns.map((c) => c.eventId));
  return {
    SESSIONS_ATTENDED: attended.size,
    SESSION_STREAK: sessionStreak(sessions, attended, now).longest,
    SUBMISSIONS_APPROVED: submissions,
    PROJECTS_APPROVED: projects,
    REFERRALS: referrals,
  };
}

/** Gives every achievement the member has earned and not yet received. Safe to call any number of times. */
export async function evaluateAchievements(tx: Tx, userId: string) {
  const [rules, owned, counts] = await Promise.all([
    tx.achievement.findMany({ where: { active: true } }),
    tx.memberAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    criterionCounts(userId, tx),
  ]);
  const due = dueAchievements(rules, counts, new Set(owned.map((o) => o.achievementId)));
  const given = [];
  for (const achievement of due) {
    const { count } = await tx.memberAchievement.createMany({ data: [{ userId, achievementId: achievement.id }], skipDuplicates: true });
    if (count === 0) continue;
    await awardOnce(tx, { userId, reason: 'ACHIEVEMENT', sourceId: achievement.id, xp: achievement.xp, credits: achievement.credits, note: achievement.title });
    await notify(userId, `Achievement: ${achievement.title}`, { body: achievement.description, href: '/builder/progress' }, tx);
    given.push(achievement);
  }
  return given;
}

/* Check-in */

type CheckInResult = { status: 'recorded'; xp: number; credits: number; eventTitle: string } | { status: 'duplicate'; eventTitle: string };

async function recordCheckIn(tx: Tx, event: { id: string; title: string }, userId: string, method: 'CODE' | 'EDITOR', recordedBy?: string): Promise<CheckInResult> {
  const { count } = await tx.checkIn.createMany({ data: [{ eventId: event.id, userId, method, recordedBy }], skipDuplicates: true });
  if (count === 0) return { status: 'duplicate', eventTitle: event.title };

  const rule = await activeRule(tx, 'CHECK_IN');
  const xp = rule?.xp ?? 0;
  const credits = rule?.credits ?? 0;
  await awardOnce(tx, { userId, reason: 'CHECK_IN', sourceId: event.id, xp, credits, note: event.title });
  await notify(userId, `Checked in: ${event.title}`, { body: xp || credits ? `+${xp} XP, +${credits} credits` : undefined, href: '/builder/sessions' }, tx);

  // A referral counts only when the person referred attends their first session.
  const attended = await tx.checkIn.count({ where: { userId } });
  const profile = await tx.memberProfile.findUnique({ where: { userId }, select: { referredById: true, displayName: true } });
  if (attended === 1 && profile?.referredById) await rewardReferral(tx, profile.referredById, userId, profile.displayName);

  await evaluateAchievements(tx, userId);
  return { status: 'recorded', xp, credits, eventTitle: event.title };
}

async function rewardReferral(tx: Tx, referrerId: string, referredId: string, referredName: string) {
  const rule = await activeRule(tx, 'REFERRAL');
  const referrer = await tx.memberProfile.findUnique({ where: { userId: referrerId }, select: { status: true } });
  if (!rule || referrer?.status !== 'ACTIVE') return;
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const thisMonth = await tx.ledgerEntry.count({ where: { userId: referrerId, reason: 'REFERRAL', createdAt: { gte: monthStart } } });
  if (thisMonth >= REFERRAL_MONTHLY_CAP) return;
  const created = await awardOnce(tx, { userId: referrerId, reason: 'REFERRAL', sourceId: referredId, xp: rule.xp, credits: rule.credits, note: `${referredName} attended a session` });
  if (!created) return;
  await notify(referrerId, `${referredName} attended their first session`, { body: `Referral: +${rule.xp} XP, +${rule.credits} credits`, href: '/builder/progress' }, tx);
  await evaluateAchievements(tx, referrerId);
}

/** A member checking in with the code shown at the venue. */
export async function checkInWithCode(userId: string, eventSlug: string, code: string, now = new Date()) {
  return db.$transaction(async (tx) => {
    const event = await tx.event.findFirst({ where: { slug: eventSlug, status: 'PUBLISHED' } });
    if (!event) throw new RuleError('This session was not found.');
    const state = checkInState(event, now);
    if (state === 'not-set') throw new RuleError('Check-in has not been set up for this session.');
    if (state === 'not-open') throw new RuleError('Check-in has not opened yet.');
    if (state === 'closed') throw new RuleError('Check-in for this session has closed. Ask an organiser to add you.');
    if (!codesMatch(event.checkInCode!, code)) throw new RuleError('That code does not match. Check the screen and try again.');
    return recordCheckIn(tx, event, userId, 'CODE');
  });
}

/** An editor adding someone who could not check in themselves. Works outside the window. */
export async function checkInByEditor(eventId: string, userId: string, editorEmail: string) {
  return db.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new RuleError('Event not found.');
    const member = await tx.memberProfile.findUnique({ where: { userId } });
    if (!member) throw new RuleError('Member not found.');
    const result = await recordCheckIn(tx, event, userId, 'EDITOR', editorEmail);
    if (result.status === 'recorded') await audit(editorEmail, 'checkin.add', 'Event', eventId, `user ${userId}`, tx);
    return result;
  });
}

/** Removes a wrong check-in and the XP and credits it gave. Achievements already given stay. */
export async function removeCheckIn(eventId: string, userId: string, editorEmail: string) {
  return db.$transaction(async (tx) => {
    const { count } = await tx.checkIn.deleteMany({ where: { eventId, userId } });
    if (count === 0) return false;
    await tx.ledgerEntry.deleteMany({ where: { userId, reason: 'CHECK_IN', sourceId: eventId } });
    await audit(editorEmail, 'checkin.remove', 'Event', eventId, `user ${userId}`, tx);
    return true;
  });
}

/* Reviews */

type Review = { status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'; score: number | null; feedback: string | null };

/** An approved submission is final. Its award is paid once, from the challenge's own values or the default rule. */
export async function reviewSubmission(submissionId: string, review: Review, editorEmail: string) {
  return db.$transaction(async (tx) => {
    const submission = await tx.submission.findUnique({ where: { id: submissionId }, include: { challenge: true } });
    if (!submission) throw new RuleError('Submission not found.');
    if (submission.status === 'APPROVED') throw new RuleError('This submission is already approved.');
    if (review.score !== null && (review.score < 0 || review.score > submission.challenge.maxScore)) {
      throw new RuleError(`The score must be between 0 and ${submission.challenge.maxScore}.`);
    }
    const { count } = await tx.submission.updateMany({
      where: { id: submissionId, status: { not: 'APPROVED' } },
      data: { status: review.status, score: review.score, feedback: review.feedback, reviewedBy: editorEmail, reviewedAt: new Date() },
    });
    if (count === 0) throw new RuleError('This submission is already approved.');
    await tx.submissionEvent.create({ data: { submissionId, status: review.status, note: review.feedback, actor: editorEmail } });
    const title = submission.challenge.title;
    const href = `/builder/challenges/${submission.challenge.slug}`;
    if (review.status === 'APPROVED') {
      const rule = await activeRule(tx, 'SUBMISSION_APPROVED');
      const xp = submission.challenge.xp ?? rule?.xp ?? 0;
      const credits = submission.challenge.credits ?? rule?.credits ?? 0;
      await awardOnce(tx, { userId: submission.userId, reason: 'SUBMISSION_APPROVED', sourceId: submission.id, xp, credits, note: title });
      await notify(submission.userId, `Approved: ${title}`, { body: xp || credits ? `+${xp} XP, +${credits} credits` : undefined, href }, tx);
      await evaluateAchievements(tx, submission.userId);
    } else {
      const verb = review.status === 'CHANGES_REQUESTED' ? 'Changes requested' : 'Not accepted';
      await notify(submission.userId, `${verb}: ${title}`, { body: review.feedback ?? undefined, href }, tx);
    }
    await audit(editorEmail, `submission.${review.status.toLowerCase()}`, 'Submission', submissionId, undefined, tx);
  });
}

export async function reviewProject(projectId: string, decision: 'APPROVED' | 'REJECTED', note: string | null, editorEmail: string) {
  return db.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id: projectId } });
    if (!project) throw new RuleError('Project not found.');
    await tx.project.update({ where: { id: projectId }, data: { status: decision, reviewNote: note, reviewedBy: editorEmail, reviewedAt: new Date() } });
    if (project.ownerId) {
      const href = `/builder/projects/${project.id}`;
      if (decision === 'APPROVED') {
        const rule = await activeRule(tx, 'PROJECT_APPROVED');
        const xp = rule?.xp ?? 0;
        const credits = rule?.credits ?? 0;
        await awardOnce(tx, { userId: project.ownerId, reason: 'PROJECT_APPROVED', sourceId: project.id, xp, credits, note: project.title });
        await notify(project.ownerId, `Project approved: ${project.title}`, { body: 'It is now on the public projects page.', href }, tx);
        await evaluateAchievements(tx, project.ownerId);
      } else {
        await notify(project.ownerId, `Project not approved: ${project.title}`, { body: note ?? undefined, href }, tx);
      }
    }
    await audit(editorEmail, `project.${decision.toLowerCase()}`, 'Project', projectId, note ?? undefined, tx);
  });
}

/* Credits */

export async function adjustBalance(userId: string, xp: number, credits: number, note: string, adminEmail: string) {
  if (!note.trim()) throw new RuleError('Say why the balance is changing.');
  return db.$transaction(async (tx) => {
    const member = await tx.memberProfile.findUnique({ where: { userId } });
    if (!member) throw new RuleError('Member not found.');
    await tx.ledgerEntry.create({ data: { userId, xp, credits, reason: 'ADJUSTMENT', sourceId: randomUUID(), note, createdBy: adminEmail } });
    await audit(adminEmail, 'ledger.adjust', 'MemberProfile', userId, `${xp} XP, ${credits} credits: ${note}`, tx);
    await notify(userId, 'Your balance was adjusted', { body: note, href: '/builder/progress' }, tx);
    await evaluateAchievements(tx, userId);
  });
}

export async function redeem(userId: string, rewardId: string) {
  return db.$transaction(async (tx) => {
    await lockMember(tx, userId);
    const member = await tx.memberProfile.findUnique({ where: { userId } });
    if (!member || member.status !== 'ACTIVE') throw new RuleError('Your account cannot redeem rewards.');
    const reward = await tx.reward.findUnique({ where: { id: rewardId } });
    if (!reward) throw new RuleError('Reward not found.');
    const [{ credits }, alreadyRedeemed] = await Promise.all([
      balances(userId, tx),
      tx.redemption.count({ where: { userId, rewardId, status: { not: 'CANCELLED' } } }),
    ]);
    const error = redemptionError({ reward, balance: credits, alreadyRedeemed });
    if (error) throw new RuleError(error);
    if (reward.stock !== null) {
      const { count } = await tx.reward.updateMany({ where: { id: rewardId, stock: { gt: 0 } }, data: { stock: { decrement: 1 } } });
      if (count === 0) throw new RuleError('This reward is out of stock.');
    }
    const digital = isDigitalKind(reward.kind);
    const redemption = await tx.redemption.create({
      data: { userId, rewardId, cost: reward.cost, status: digital ? 'FULFILLED' : 'PENDING', handledAt: digital ? new Date() : null },
    });
    await tx.ledgerEntry.create({ data: { userId, credits: -reward.cost, reason: 'REDEMPTION', sourceId: redemption.id, note: reward.name } });
    await notify(userId, `Redeemed: ${reward.name}`, { body: digital ? 'Use it from your profile now.' : 'The team will contact you to hand it over.', href: '/builder/rewards' }, tx);
    return redemption;
  });
}

/** Cancels a redemption and refunds it. A digital reward is taken off the profile if it was in use. */
export async function cancelRedemption(redemptionId: string, actorEmail: string, note: string | null) {
  return db.$transaction(async (tx) => {
    const redemption = await tx.redemption.findUnique({ where: { id: redemptionId }, include: { reward: true } });
    if (!redemption) throw new RuleError('Redemption not found.');
    await lockMember(tx, redemption.userId);
    const { count } = await tx.redemption.updateMany({
      where: { id: redemptionId, status: { not: 'CANCELLED' } },
      data: { status: 'CANCELLED', handledBy: actorEmail, handledAt: new Date(), note },
    });
    if (count === 0) throw new RuleError('This redemption is already cancelled.');
    await awardOnce(tx, { userId: redemption.userId, reason: 'REFUND', sourceId: redemption.id, xp: 0, credits: redemption.cost, note: redemption.reward.name });
    if (redemption.reward.stock !== null) await tx.reward.update({ where: { id: redemption.rewardId }, data: { stock: { increment: 1 } } });
    const { kind, value } = redemption.reward;
    const field = { BANNER: 'bannerKey', ACCENT: 'accentKey', FRAME: 'frameKey', TITLE: 'titleKey' }[kind as string] as keyof typeof DEFAULTS | undefined;
    if (field && value) {
      await tx.memberProfile.updateMany({ where: { userId: redemption.userId, [field]: value }, data: { [field]: DEFAULTS[field] } });
    }
    await audit(actorEmail, 'redemption.cancel', 'Redemption', redemptionId, note ?? undefined, tx);
    await notify(redemption.userId, `Redemption cancelled: ${redemption.reward.name}`, { body: `${redemption.cost} credits refunded.`, href: '/builder/rewards' }, tx);
  });
}

export async function fulfilRedemption(redemptionId: string, adminEmail: string) {
  return db.$transaction(async (tx) => {
    const { count } = await tx.redemption.updateMany({ where: { id: redemptionId, status: 'PENDING' }, data: { status: 'FULFILLED', handledBy: adminEmail, handledAt: new Date() } });
    if (count === 0) throw new RuleError('Only a pending redemption can be marked as handed over.');
    const redemption = await tx.redemption.findUniqueOrThrow({ where: { id: redemptionId }, include: { reward: true } });
    await audit(adminEmail, 'redemption.fulfil', 'Redemption', redemptionId, undefined, tx);
    await notify(redemption.userId, `Handed over: ${redemption.reward.name}`, { href: '/builder/rewards' }, tx);
  });
}
