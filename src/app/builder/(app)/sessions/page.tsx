import type { Metadata } from 'next';
import { DatedRow, PageTitle } from '@/components/builder/ui';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag } from '@/components/ui/Tag';
import { db } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/format';
import { requireMember } from '@/lib/member';
import { checkInState } from '@/lib/platform/rules';

export const metadata: Metadata = { title: 'Sessions' };

export default async function SessionsPage() {
  const { user } = await requireMember();
  const now = new Date();
  const [events, checkIns] = await Promise.all([
    db.event.findMany({ where: { status: 'PUBLISHED' }, orderBy: { startsAt: 'desc' }, include: { _count: { select: { resources: true } } } }),
    db.checkIn.findMany({ where: { userId: user.id }, select: { eventId: true } }),
  ]);
  const attended = new Set(checkIns.map((c) => c.eventId));
  const upcoming = events.filter((e) => e.endsAt > now).reverse();
  const past = events.filter((e) => e.endsAt <= now);

  const row = (event: (typeof events)[number]) => {
    const state = checkInState(event, now);
    return (
      <DatedRow key={event.id} date={formatDate(event.startsAt)} href={`/builder/sessions/${event.slug}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Tag tag={event.tag} />
          {attended.has(event.id) && <Badge tone="lime">Attended</Badge>}
          {state === 'open' && !attended.has(event.id) && <Badge tone="cyan">Check-in open</Badge>}
          {event._count.resources > 0 && <Badge>{event._count.resources} materials</Badge>}
        </div>
        <p className="mt-2 font-semibold text-white">{event.title}</p>
        <p className="mt-1 font-display text-xs text-text-muted">
          {formatTime(event.startsAt)}, {event.venue ?? 'Online'}
        </p>
      </DatedRow>
    );
  };

  return (
    <>
      <PageTitle label="Sessions" title="Sessions and materials" intro="RSVP on Meetup. Check in at the session. Materials stay here afterwards." />
      <section aria-labelledby="upcoming">
        <h2 id="upcoming" className="type-label mb-2 text-text-muted">
          Upcoming
        </h2>
        {upcoming.length === 0 ? <EmptyState label="Nothing scheduled">The next session appears here when it is published.</EmptyState> : <div className="border-t border-border">{upcoming.map(row)}</div>}
      </section>
      <section aria-labelledby="past" className="mt-12">
        <h2 id="past" className="type-label mb-2 text-text-muted">
          Past
        </h2>
        {past.length === 0 ? <EmptyState label="No past sessions">Past sessions and their materials will be listed here.</EmptyState> : <div className="border-t border-border">{past.map(row)}</div>}
      </section>
    </>
  );
}
