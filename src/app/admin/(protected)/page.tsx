import Link from 'next/link';
import { Empty, LINK, PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

const DAY = 24 * 60 * 60 * 1000;

function Count({ label, drafts, published }: { label: string; drafts: number; published: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-sm">
        {drafts} draft, {published} published
      </p>
    </div>
  );
}

export default async function OverviewPage() {
  await requireRole();
  const now = new Date();
  const count = (model: { count: (args: { where: { status: 'DRAFT' | 'PUBLISHED' } }) => Promise<number> }) =>
    Promise.all([model.count({ where: { status: 'DRAFT' } }), model.count({ where: { status: 'PUBLISHED' } })]);
  const [events, partners, posts, upcoming, missing] = await Promise.all([
    count(db.event),
    count(db.partner),
    count(db.post),
    db.event.findMany({ where: { startsAt: { gt: now } }, orderBy: { startsAt: 'asc' }, take: 3 }),
    db.event.findMany({
      where: { attendance: null, endsAt: { lte: now, gte: new Date(now.getTime() - 14 * DAY) } },
      orderBy: { endsAt: 'desc' },
    }),
  ]);

  return (
    <>
      <PageHeader title="Overview" />
      <div className="grid gap-4 md:grid-cols-3">
        <Count label="Events" drafts={events[0]} published={events[1]} />
        <Count label="Partners" drafts={partners[0]} published={partners[1]} />
        <Count label="Posts" drafts={posts[0]} published={posts[1]} />
      </div>
      <h2 className="mt-10 mb-3 text-lg font-semibold">Next three events</h2>
      {upcoming.length === 0 ? (
        <Empty>No upcoming events.</Empty>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((event) => (
            <li key={event.id}>
              <Link href={`/admin/events/${event.id}`} className={LINK}>
                {event.title}
              </Link>
              <span className="text-sm text-text-muted">, {formatDate(event.startsAt)}</span>
            </li>
          ))}
        </ul>
      )}
      {missing.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 text-lg font-semibold">Fill in attendance</h2>
          <ul className="space-y-2">
            {missing.map((event) => (
              <li key={event.id}>
                <Link href={`/admin/events/${event.id}`} className={LINK}>
                  {event.title}
                </Link>
                <span className="text-sm text-text-muted">, {formatDate(event.startsAt)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
