import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentMember } from '@/lib/member';
import { withinLimit } from '@/lib/platform/records';

// The member's own data, as a download. Only their own: the user id comes from the session, never the request.
export async function GET() {
  const member = await currentMember();
  if (!member) return NextResponse.json({ message: 'Sign in to download your data.' }, { status: 401 });
  const userId = member.user.id;
  if (!(await withinLimit(`export:${userId}`, 10, 60 * 60 * 1000))) return NextResponse.json({ message: 'Try again later.' }, { status: 429 });

  const [checkIns, submissions, projects, ledger, achievements, redemptions, notifications] = await Promise.all([
    db.checkIn.findMany({ where: { userId }, select: { createdAt: true, method: true, event: { select: { title: true, startsAt: true } } } }),
    db.submission.findMany({ where: { userId }, include: { challenge: { select: { title: true } }, history: true } }),
    db.project.findMany({ where: { ownerId: userId } }),
    db.ledgerEntry.findMany({ where: { userId }, select: { createdAt: true, reason: true, xp: true, credits: true, note: true } }),
    db.memberAchievement.findMany({ where: { userId }, select: { awardedAt: true, achievement: { select: { title: true } } } }),
    db.redemption.findMany({ where: { userId }, select: { createdAt: true, status: true, cost: true, reward: { select: { name: true } } } }),
    db.notification.findMany({ where: { userId }, select: { createdAt: true, title: true, body: true, readAt: true } }),
  ]);
  // Who referred the member is someone else's id, so it stays out of the file.
  const profile = Object.fromEntries(Object.entries(member.profile).filter(([key]) => key !== 'referredById'));
  const body = {
    exportedAt: new Date().toISOString(),
    account: { name: member.user.name, email: member.user.email, createdAt: member.user.createdAt },
    profile,
    checkIns,
    submissions,
    projects,
    ledger,
    achievements,
    redemptions,
    notifications,
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="sbg-ucc-${member.profile.handle}.json"`,
      'cache-control': 'no-store',
    },
  });
}
