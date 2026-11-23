import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, FilterPills, LINK, PageHeader, StatusPill, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { Tag } from '@/components/ui/Tag';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Events' };

type Props = { searchParams: Promise<{ status?: string; when?: string }> };

export default async function AdminEventsPage({ searchParams }: Props) {
  await requireRole();
  const { status, when } = await searchParams;
  const now = new Date();
  const events = await db.event.findMany({
    where: {
      ...(status === 'DRAFT' || status === 'PUBLISHED' ? { status } : {}),
      ...(when === 'upcoming' ? { endsAt: { gt: now } } : when === 'past' ? { endsAt: { lte: now } } : {}),
    },
    orderBy: { startsAt: 'desc' },
  });

  const filters = [
    { label: 'All', href: '/admin/events', active: !status && !when },
    { label: 'Draft', href: '/admin/events?status=DRAFT', active: status === 'DRAFT' },
    { label: 'Published', href: '/admin/events?status=PUBLISHED', active: status === 'PUBLISHED' },
    { label: 'Upcoming', href: '/admin/events?when=upcoming', active: when === 'upcoming' },
    { label: 'Past', href: '/admin/events?when=past', active: when === 'past' },
  ];

  return (
    <>
      <PageHeader
        title="Events"
        description="Manage talks, hands-on sessions, bootcamps and venue check-in codes."
        action={{ href: '/admin/events/new', label: 'New event' }}
      />
      <FilterPills items={filters} />
      {events.length === 0 ? (
        <Empty action={{ href: '/admin/events/new', label: 'New event' }}>No events here yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Title</th>
                <th className={TH}>Tag</th>
                <th className={TH}>Date</th>
                <th className={TH}>Status</th>
                <th className={TH}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className={TD}>
                    <Link href={`/admin/events/${event.id}`} className={LINK}>
                      {event.title}
                    </Link>
                  </td>
                  <td className={TD}>
                    <Tag tag={event.tag} />
                  </td>
                  <td className={`${TD} font-display text-xs whitespace-nowrap`}>{formatDate(event.startsAt)}</td>
                  <td className={TD}>
                    <StatusPill published={event.status === 'PUBLISHED'} />
                  </td>
                  <td className={TD}>
                    <Link
                      href={`/admin/events/${event.id}/attendance`}
                      className="inline-flex min-h-8 items-center rounded-md border border-border-strong bg-bg px-2.5 text-xs font-medium text-text-strong hover:border-text-muted hover:bg-card-raised"
                    >
                      Check-in
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
