import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTitle } from '@/components/builder/ui';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { requireMember } from '@/lib/member';

export const metadata: Metadata = { title: 'Challenges' };

export default async function ChallengesPage() {
  const { user } = await requireMember();
  const now = new Date();
  const [challenges, mine] = await Promise.all([
    db.challenge.findMany({ where: { status: 'PUBLISHED' }, orderBy: { endsAt: 'desc' }, include: { _count: { select: { submissions: { where: { status: 'APPROVED' } } } } } }),
    db.submission.findMany({ where: { userId: user.id }, select: { challengeId: true, status: true } }),
  ]);
  const status = new Map(mine.map((s) => [s.challengeId, s.status]));
  const open = challenges.filter((c) => c.startsAt <= now && c.endsAt >= now);
  const soon = challenges.filter((c) => c.startsAt > now);
  const closed = challenges.filter((c) => c.endsAt < now);

  const list = (items: typeof challenges, empty: string) =>
    items.length === 0 ? (
      <p className="text-sm text-text-muted">{empty}</p>
    ) : (
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((c) => (
          <li key={c.id}>
            <Link href={`/builder/challenges/${c.slug}`} className="block h-full rounded-md border border-border bg-card p-5 transition-colors duration-150 ease-brand hover:border-border-strong">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="type-label text-text-muted">
                  {c.endsAt < now ? 'Closed' : c.startsAt > now ? `Opens ${formatDate(c.startsAt)}` : `Closes ${formatDate(c.endsAt)}`}
                </p>
                {status.has(c.id) ? <StatusBadge status={status.get(c.id)!} /> : c.startsAt <= now && c.endsAt >= now ? <Badge tone="cyan">Open</Badge> : null}
              </div>
              <p className="mt-3 text-lg font-semibold text-white">{c.title}</p>
              <p className="mt-2 line-clamp-2 text-sm text-text-muted">{c.summary}</p>
              <p className="type-label mt-4 text-text-muted">{c._count.submissions} approved</p>
            </Link>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <PageTitle label="Challenges" title="Build, submit, get feedback" intro="Each challenge has a brief, requirements and a deadline. A reviewer from the technical team approves the work before anything is awarded." />
      {challenges.length === 0 ? (
        <EmptyState label="No challenges yet">The first challenge will be posted after a build session. You will get a notification.</EmptyState>
      ) : (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="type-label mb-4 text-text-muted">Open now</h2>
            {list(open, 'No challenge is open right now.')}
          </section>
          {soon.length > 0 && (
            <section>
              <h2 className="type-label mb-4 text-text-muted">Coming up</h2>
              {list(soon, '')}
            </section>
          )}
          <section>
            <h2 className="type-label mb-4 text-text-muted">Closed</h2>
            {list(closed, 'No closed challenges yet.')}
          </section>
        </div>
      )}
    </>
  );
}
