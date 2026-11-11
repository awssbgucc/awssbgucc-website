import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/site/Markdown';
import { Panel } from '@/components/builder/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { db } from '@/lib/db';
import { formatDate, formatTimeRange } from '@/lib/format';
import { requireMember } from '@/lib/member';
import { checkInState } from '@/lib/platform/rules';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'Session' };

type Props = { params: Promise<{ slug: string }> };

export default async function SessionPage({ params }: Props) {
  const { user } = await requireMember();
  const { slug } = await params;
  const event = await db.event.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: { resources: { orderBy: { order: 'asc' } }, challenges: { where: { status: 'PUBLISHED' } } },
  });
  if (!event) notFound();
  const checkIn = await db.checkIn.findUnique({ where: { eventId_userId: { eventId: event.id, userId: user.id } } });
  const state = checkInState(event, new Date());

  return (
    <>
      <Link href="/builder/sessions" className="type-label inline-flex min-h-11 items-center text-text-muted hover:text-white">
        All sessions
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Tag tag={event.tag} />
        {checkIn && <Badge tone="lime">Attended</Badge>}
      </div>
      <h1 className="type-section mt-3 max-w-[24ch]">{event.title}</h1>
      <p className="mt-3 font-display text-sm text-text-muted">
        {formatDate(event.startsAt)}, {formatTimeRange(event.startsAt, event.endsAt)}, {event.venue ?? 'Online'}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <Markdown>{event.body}</Markdown>
        </div>
        <div className="flex flex-col gap-6">
          <Panel title="Attendance">
            {checkIn ? (
              <p className="text-sm text-text-muted">
                Checked in on {formatDate(checkIn.createdAt)}
                {checkIn.method === 'EDITOR' ? ', added by an organiser.' : '.'}
              </p>
            ) : state === 'open' ? (
              <Button href={`/builder/check-in?event=${event.slug}`}>Check in now</Button>
            ) : (
              <p className="text-sm text-text-muted">
                {state === 'not-open' ? 'Check-in opens 30 minutes before the start.' : state === 'closed' ? 'Check-in has closed. If you attended, ask an organiser to add you.' : 'This session does not use check-in.'}
              </p>
            )}
            {event.meetupUrl && event.endsAt > new Date() && (
              <div className="mt-4">
                <Button href={event.meetupUrl} variant="secondary">
                  RSVP on Meetup
                </Button>
                <p className="mt-3 text-xs text-text-muted">
                  By registering, you agree to the{' '}
                  <a href={AWS_EVENT_TERMS_URL} className="underline underline-offset-4">
                    AWS Event Terms and Conditions
                  </a>
                  .
                </p>
              </div>
            )}
          </Panel>
          <Panel title="Materials">
            {event.resources.length === 0 ? (
              <p className="text-sm text-text-muted">No materials yet. The team adds slides and labs after the session.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {event.resources.map((r) => (
                  <li key={r.id}>
                    <a href={r.url} className="flex min-h-11 items-center gap-3 text-sm font-medium underline-offset-4 hover:underline">
                      <Badge>{r.kind.toLowerCase()}</Badge>
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          {event.challenges.length > 0 && (
            <Panel title="Challenges from this session">
              <ul className="flex flex-col gap-1">
                {event.challenges.map((c) => (
                  <li key={c.id}>
                    <Link href={`/builder/challenges/${c.slug}`} className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
