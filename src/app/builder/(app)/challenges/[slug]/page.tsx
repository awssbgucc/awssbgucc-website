import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { TextArea, TextField } from '@/components/admin/fields';
import { Panel } from '@/components/builder/ui';
import { Markdown } from '@/components/site/Markdown';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { db } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/format';
import { requireMember } from '@/lib/member';
import { submitChallenge } from '../../../actions/challenges';

export const metadata: Metadata = { title: 'Challenge' };

type Props = { params: Promise<{ slug: string }> };

export default async function ChallengePage({ params }: Props) {
  const { user } = await requireMember();
  const { slug } = await params;
  const challenge = await db.challenge.findFirst({ where: { slug, status: 'PUBLISHED' }, include: { event: { select: { slug: true, title: true } } } });
  if (!challenge) notFound();
  const [submission, rule, board] = await Promise.all([
    db.submission.findUnique({ where: { challengeId_userId: { challengeId: challenge.id, userId: user.id } }, include: { history: { orderBy: { createdAt: 'desc' } } } }),
    db.awardRule.findUnique({ where: { reason: 'SUBMISSION_APPROVED' } }),
    challenge.leaderboardEnabled
      ? db.submission.findMany({
          where: { challengeId: challenge.id, status: 'APPROVED' },
          orderBy: [{ score: { sort: 'desc', nulls: 'last' } }, { reviewedAt: 'asc' }],
          take: 20,
          include: { user: { select: { profile: { select: { displayName: true, handle: true, showOnLeaderboards: true } } } } },
        })
      : Promise.resolve([]),
  ]);
  const now = new Date();
  const open = challenge.startsAt <= now && challenge.endsAt >= now;
  const editable = open && (!submission || submission.status === 'PENDING' || submission.status === 'CHANGES_REQUESTED');
  const xp = challenge.xp ?? (rule?.active ? rule.xp : 0);
  const credits = challenge.credits ?? (rule?.active ? rule.credits : 0);

  return (
    <>
      <Link href="/builder/challenges" className="type-label inline-flex min-h-11 items-center text-text-muted hover:text-white">
        All challenges
      </Link>
      <h1 className="type-section mt-2 max-w-[24ch]">{challenge.title}</h1>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-display text-sm text-text-muted">
        <span>Opens {formatDate(challenge.startsAt)}</span>
        <span>
          Closes {formatDate(challenge.endsAt)}, {formatTime(challenge.endsAt)}
        </span>
        <span className="text-lime">
          On approval: +{xp} XP, +{credits} credits
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Brief">
            <Markdown>{challenge.brief}</Markdown>
          </Panel>
          <Panel title="Requirements">
            <Markdown>{challenge.requirements}</Markdown>
          </Panel>
          {challenge.rules && (
            <Panel title="Rules">
              <Markdown>{challenge.rules}</Markdown>
            </Panel>
          )}
          {challenge.event && (
            <p className="text-sm text-text-muted">
              Set at{' '}
              <Link href={`/builder/sessions/${challenge.event.slug}`} className="underline underline-offset-4">
                {challenge.event.title}
              </Link>
              .
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Your submission" action={submission ? <StatusBadge status={submission.status} /> : undefined}>
            {submission?.feedback && (
              <div className="mb-5 rounded-sm border border-border-strong p-4">
                <p className="type-label text-text-muted">Reviewer feedback</p>
                <p className="mt-2 text-sm whitespace-pre-line text-white">{submission.feedback}</p>
                {submission.score !== null && (
                  <p className="mt-2 font-display text-sm text-lime">
                    Score {submission.score} of {challenge.maxScore}
                  </p>
                )}
              </div>
            )}
            {editable ? (
              <AdminForm action={submitChallenge.bind(null, challenge.id)} submitLabel={submission ? 'Update submission' : 'Submit'}>
                <TextField name="repoUrl" label="GitHub repository" defaultValue={submission?.repoUrl} help="Public, with a README that explains what you built." />
                <TextField name="demoUrl" label="Live link" defaultValue={submission?.demoUrl} help="Optional." />
                <TextArea name="notes" label="Notes for the reviewer" defaultValue={submission?.notes} help="Optional. What you tried, what you would do next." />
              </AdminForm>
            ) : submission ? (
              <dl className="flex flex-col gap-3 text-sm">
                <div>
                  <dt className="type-label text-text-muted">Repository</dt>
                  <dd>
                    <a href={submission.repoUrl} className="break-all underline underline-offset-4">
                      {submission.repoUrl}
                    </a>
                  </dd>
                </div>
                {submission.demoUrl && (
                  <div>
                    <dt className="type-label text-text-muted">Live link</dt>
                    <dd>
                      <a href={submission.demoUrl} className="break-all underline underline-offset-4">
                        {submission.demoUrl}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-text-muted">{now < challenge.startsAt ? 'Submissions open on the start date.' : 'This challenge has closed.'}</p>
            )}
          </Panel>

          {submission && submission.history.length > 0 && (
            <Panel title="History">
              <ol className="flex flex-col gap-3">
                {submission.history.map((h) => (
                  <li key={h.id} className="border-l-2 border-border-strong pl-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={h.status} />
                      <span className="type-label text-text-muted">{formatDate(h.createdAt)}</span>
                    </div>
                    {h.note && <p className="mt-1 text-sm text-text-muted">{h.note}</p>}
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          {challenge.leaderboardEnabled && (
            <Panel title="Leaderboard">
              {board.length === 0 ? (
                <p className="text-sm text-text-muted">Approved submissions are ranked here by the reviewer&apos;s score, then by who was approved first.</p>
              ) : (
                <ol className="flex flex-col">
                  {board.map((entry, index) => {
                    const profile = entry.user.profile;
                    const named = profile?.showOnLeaderboards || entry.userId === user.id;
                    return (
                      <li key={entry.id} className={`flex items-center justify-between gap-3 border-b border-border py-2.5 ${entry.userId === user.id ? 'text-lime' : ''}`}>
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="w-6 font-display text-sm text-text-muted">{index + 1}</span>
                          <span className="truncate text-sm font-medium">{named ? profile?.displayName : 'A member'}</span>
                          {entry.userId === user.id && <Badge tone="lime">You</Badge>}
                        </span>
                        <span className="font-display text-sm">{entry.score ?? 'n/a'}</span>
                      </li>
                    );
                  })}
                </ol>
              )}
              <p className="mt-3 text-xs text-text-muted">Names show only for members who chose to appear on leaderboards.</p>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
