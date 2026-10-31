import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import type { Event } from '@/lib/content/types';
import { formatDate, formatTimeRange } from '@/lib/format';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';
import { Markdown } from './Markdown';

export function EventDetail({ event }: { event: Event }) {
  return (
    <article>
      <Tag tag={event.tag} />
      <h1 className="type-section mt-4 max-w-[24ch]">{event.title}</h1>
      <p className="mt-4 text-sm font-medium text-text-muted">
        {formatDate(event.startsAt)}, {formatTimeRange(event.startsAt, event.endsAt)}
      </p>
      <p className="text-sm font-medium text-text-muted">{event.venue ?? 'Online'}</p>
      {event.coverImage && (
        <div className="relative mt-8 aspect-video max-w-3xl overflow-hidden rounded-md">
          <Image src={event.coverImage} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="mt-8">
        <Markdown>{event.body}</Markdown>
      </div>
      {event.meetupUrl && (
        <Button href={event.meetupUrl} className="mt-8">
          RSVP on Meetup
        </Button>
      )}
      <p className="mt-4 text-sm text-text-muted">
        By registering, you agree to the{' '}
        <a href={AWS_EVENT_TERMS_URL} className="underline underline-offset-4">
          AWS Event Terms and Conditions
        </a>
        .
      </p>
    </article>
  );
}
