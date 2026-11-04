import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, PageHeader, StatusPill, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { Tag } from '@/components/ui/Tag';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Events' };

type Props = { searchParams: Promise<{ status?: string; when?: string }> };

const FILTERS = [
  { label: 'All', query: {} },
  { label: 'Draft', query: { status: 'DRAFT' } },
  { label: 'Published', query: { status: 'PUBLISHED' } },
  { label: 'Upcoming', query: { when: 'upcoming' } },
  { label: 'Past', query: { when: 'past' } },
];

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

  return (
    <>
      <PageHeader title="Events" action={{ href: '/admin/events/new', label: 'New event' }} />
      <nav aria-label="Filter" className="mb-6 flex flex-wrap gap-4">
        {FILTERS.map(({ label, query }) => (
          <Link key={label} href={{ pathname: '/admin/events', query }} className="flex min-h-11 items-center text-sm font-medium text-text-muted underline underline-offset-4 hover:text-white">
            {label}
          </Link>
        ))}
      </nav>
      {events.length === 0 ? (
        <Empty>No events here yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Title</th>
                <th className={TH}>Tag</th>
                <th className={TH}>Date</th>
                <th className={TH}>Status</th>
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
                  <td className={TD}>{formatDate(event.startsAt)}</td>
                  <td className={TD}>
                    <StatusPill published={event.status === 'PUBLISHED'} />
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
