import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import type { Event } from '@/lib/content/types';
import { formatDate, formatTime } from '@/lib/format';

type EventCardProps = { event: Event; recapSlug?: string };

export function EventCard({ event, recapSlug }: EventCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tag tag={event.tag} />
        <span className="text-sm font-medium text-text-muted">{formatDate(event.startsAt)}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        <Link href={`/events/${event.slug}`} className="underline-offset-4 hover:underline">
          {event.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-text-muted">{event.summary}</p>
      <p className="mt-3 text-sm font-medium text-text-muted">
        {event.venue ?? 'Online'}, {formatTime(event.startsAt)}
      </p>
      {event.attendance !== null && <p className="mt-1 text-sm font-medium text-text-muted">{event.attendance} attended</p>}
      {recapSlug && (
        <Link href={`/blog/${recapSlug}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
          Read the recap
        </Link>
      )}
    </Card>
  );
}
