import type { Metadata } from 'next';
import Link from 'next/link';
import { Panel, TextLink } from '@/components/builder/ui';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ParticipationGrid } from '@/components/ui/ParticipationGrid';
import { Progress } from '@/components/ui/Progress';
import { Stat } from '@/components/ui/Stat';
import { db } from '@/lib/db';
import { formatDate, formatTimeRange } from '@/lib/format';
import { requireMember } from '@/lib/member';
import { activeAnnouncements, memberRecord, openChallenges } from '@/lib/platform/member-data';
import { checkInState } from '@/lib/platform/rules';
import { CopyButton } from './CopyButton';

export const metadata: Metadata = { title: 'Home' };

const REASON_LABELS: Record<string, string> = {
  CHECK_IN: 'Checked in',
  SUBMISSION_APPROVED: 'Submission approved',
  PROJECT_APPROVED: 'Project approved',
  REFERRAL: 'Referral',
  ACHIEVEMENT: 'Achievement',
  ADJUSTMENT: 'Adjustment',
  REDEMPTION: 'Redeemed',
  REFUND: 'Refund',
};

export default async function BuilderHome() {
  const { user, profile } = await requireMember();
  const now = new Date();
  const [record, nextEvents, challenges, announcements, recent, lastCheckIn] = await Promise.all([
    memberRecord(user.id, now),
    db.event.findMany({ where: { status: 'PUBLISHED', endsAt: { gt: now } }, orderBy: { startsAt: 'asc' }, take: 3 }),
    openChallenges(now),
    activeAnnouncements(now),
    db.ledgerEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.checkIn.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, include: { event: { include: { resources: { orderBy: { order: 'asc' } } } } } }),
  ]);
  const mySubmissions = await db.submission.findMany({ where: { userId: user.id, challengeId: { in: challenges.map((c) => c.id) } }, select: { challengeId: true, status: true } });
  const next = nextEvents[0];
  const nextState = next ? checkInState(next, now) : null;
  const firstName = profile.displayName.split(/\s+/)[0];

  return (
    <>
      <header className="mb-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <p className="type-label text-text-muted">{formatDate(now)}</p>
          <h1 className="type-section mt-2">Welcome back, {firstName}.</h1>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-sm font-medium text-white">Level {record.level.level}</p>
            <p className="type-label text-text-muted">{record.level.next === null ? 'Top level' : `${record.level.toNext} XP to level ${record.level.level + 1}`}</p>
          </div>
          <Progress value={record.level.progress} label={`Progress to level ${record.level.level + 1}`} className="mt-3" />
          <div className="mt-3 flex gap-6 font-display text-sm">
            <span>
              <span className="text-white">{record.xp}</span> <span className="text-text-muted">XP</span>
            </span>
            <span>
              <span className="text-white">{record.credits}</span> <span className="text-text-muted">credits</span>
            </span>
            <span>
              <span className="text-white">{record.streak.current}</span> <span className="text-text-muted">in a row</span>
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Next session" action={<TextLink href="/builder/sessions">All sessions</TextLink>}>
            {next ? (
              <div className="grid gap-5 sm:grid-cols-[112px_1fr]">
                <div className="rounded-sm border border-border-strong p-3 text-center">
                  <p className="type-label text-lime">{formatDate(next.startsAt).split(' ')[0]}</p>
                  <p className="font-display text-3xl font-medium text-white">{formatDate(next.startsAt).split(' ')[1]}</p>
                  <p className="type-label text-text-muted">{formatDate(next.startsAt).split(' ')[2]}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    <Link href={`/builder/sessions/${next.slug}`} className="underline-offset-4 hover:underline">
                      {next.title}
                    </Link>
                  </h3>
                  <p className="mt-1 font-display text-sm text-text-muted">
                    {formatTimeRange(next.startsAt, next.endsAt)}, {next.venue ?? 'Online'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {nextState === 'open' && !record.attended.has(next.id) && <Button href={`/builder/check-in?event=${next.slug}`}>Check in now</Button>}
                    {record.attended.has(next.id) && <Badge tone="lime">Checked in</Badge>}
                    {next.meetupUrl && (
                      <Button href={next.meetupUrl} variant={nextState === 'open' ? 'secondary' : 'primary'}>
                        RSVP on Meetup
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState label="Nothing scheduled">The next session will appear here as soon as the team publishes it. RSVPs open on Meetup.</EmptyState>
            )}
          </Panel>

          <Panel title="Open challenges" action={<TextLink href="/builder/challenges">All challenges</TextLink>}>
            {challenges.length === 0 ? (
              <EmptyState label="No open challenges">Challenges are set after sessions. The next one will show here with its brief and deadline.</EmptyState>
            ) : (
              <ul className="divide-y divide-border">
                {challenges.slice(0, 3).map((challenge) => {
                  const mine = mySubmissions.find((s) => s.challengeId === challenge.id);
                  return (
                    <li key={challenge.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <Link href={`/builder/challenges/${challenge.slug}`} className="font-semibold text-white underline-offset-4 hover:underline">
                          {challenge.title}
                        </Link>
                        <p className="type-label mt-1 text-text-muted">Closes {formatDate(challenge.endsAt)}</p>
                      </div>
                      {mine ? <StatusBadge status={mine.status} /> : <Badge tone="cyan">Open</Badge>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="From your last session">
            {lastCheckIn ? (
              <>
                <p className="font-semibold text-white">{lastCheckIn.event.title}</p>
                <p className="type-label mt-1 text-text-muted">{formatDate(lastCheckIn.event.startsAt)}</p>
                {lastCheckIn.event.resources.length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-2">
                    {lastCheckIn.event.resources.map((resource) => (
                      <li key={resource.id}>
                        <a href={resource.url} className="inline-flex min-h-11 items-center gap-3 text-sm font-medium underline-offset-4 hover:underline">
                          <Badge>{resource.kind.toLowerCase()}</Badge>
                          {resource.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-text-muted">No materials were added for this session yet.</p>
                )}
              </>
            ) : (
              <EmptyState label="No sessions yet" action={<Button href="/builder/check-in">Check in</Button>}>
                Check in at a session with the code shown in the room. Its slides and labs will appear here.
              </EmptyState>
            )}
          </Panel>

          <Panel title="Your record" action={<TextLink href="/builder/progress">Progress and rules</TextLink>}>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat value={record.counts.sessions} label="Sessions" />
              <Stat value={record.counts.approvedSubmissions} label="Approved builds" />
              <Stat value={record.counts.approvedProjects} label="Projects shipped" />
              <Stat value={record.counts.achievements} label="Achievements" />
            </div>
            {record.sessions.length > 0 && (
              <div className="mt-6 border-t border-border pt-6">
                <ParticipationGrid sessions={record.sessions} attended={record.attended} />
              </div>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Announcements">
            {announcements.length === 0 ? (
              <p className="text-sm text-text-muted">No announcements right now.</p>
            ) : (
              <ul className="flex flex-col gap-5">
                {announcements.map((a) => (
                  <li key={a.id}>
                    {a.publishedAt && <p className="type-label text-text-muted">{formatDate(a.publishedAt)}</p>}
                    <p className="mt-1 font-semibold text-white">{a.title}</p>
                    <p className="mt-1 text-sm text-text-muted">{a.body}</p>
                    {a.href && (
                      <a href={a.href} className="mt-1 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
                        Read more
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent activity">
            {recent.length === 0 ? (
              <p className="text-sm text-text-muted">Your XP and credits will be listed here as you take part.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{entry.note ?? REASON_LABELS[entry.reason]}</p>
                      <p className="type-label text-text-muted">
                        {REASON_LABELS[entry.reason]}, {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <p className="shrink-0 text-right font-display text-xs text-text-muted">
                      {entry.xp !== 0 && <span className="block text-lime">{entry.xp > 0 ? '+' : ''}{entry.xp} XP</span>}
                      {entry.credits !== 0 && <span className="block">{entry.credits > 0 ? '+' : ''}{entry.credits} cr</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Invite a classmate">
            <p className="text-sm text-text-muted">Share your code. You are credited when they attend their first session, not when they sign up.</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-sm border border-border-strong px-4 py-2">
              <span className="font-display text-lg tracking-wider text-white">{profile.referralCode}</span>
              <CopyButton value={profile.referralCode} label="Copy code" />
            </div>
          </Panel>

          <Panel title="Shortcuts">
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['/builder/check-in', 'Check in'],
                ['/builder/projects/new', 'Add a project'],
                ['/builder/rewards', 'Rewards'],
                ['/builder/profile', 'Edit profile'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="flex min-h-11 items-center rounded-sm border border-border px-3 font-medium text-text-muted transition-colors duration-150 ease-brand hover:border-border-strong hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
