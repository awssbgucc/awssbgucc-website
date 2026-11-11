import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { focusFor } from '@/lib/content/media';
import type { Event } from '@/lib/content/types';
import { dateParts, formatTimeRange } from '@/lib/format';
import { SbgIcon } from './SbgIcon';
import { TAG_LABEL, TAG_TONE } from './tone';

const ICON = { BOOTCAMP: 'ladder', BUILD: 'wrench', TALK: 'speaker', NETWORKING: 'teams', COMMUNITY_DAY: 'teams' } as const;

/** One archive row. The flyer shows as a cropped detail; the facts are always text beside it. */
export function EventRow({ event, attendance, recapSlug }: { event: Event; attendance?: number | null; recapSlug?: string }) {
  const when = dateParts(event.startsAt);
  const tone = TAG_TONE[event.tag];
  return (
    <article className={`event-row tone-${tone}`}>
      <div className="row-date">
        <span className="type-label">{when.weekday}</span>
        <span className="row-day">{when.day}</span>
        <span className="type-label">{when.month} {when.year}</span>
      </div>
      <div className="row-thumb" aria-hidden="true">
        {event.coverImage ? (
          <Image src={event.coverImage} alt="" fill sizes="200px" style={{ objectPosition: focusFor(event.coverImage) }} />
        ) : (
          <SbgIcon name={ICON[event.tag]} tone={tone} size={40} />
        )}
      </div>
      <div className="row-body">
        <p className="type-label row-kind"><span className={`swatch swatch-${tone}`} aria-hidden="true" />{TAG_LABEL[event.tag]}, {event.format === 'IN_PERSON' ? 'on campus' : 'online'}</p>
        <h3><Link href={`/events/${event.slug}`} className="stretched">{event.title}</Link></h3>
        <p className="row-summary">{event.summary}</p>
        <p className="row-meta">
          <span>{formatTimeRange(event.startsAt, event.endsAt)} GMT</span>
          <span>{event.venue ?? 'Online'}</span>
          {attendance != null && <span>{attendance} attended</span>}
          {event.photos.length > 0 && <span>{event.photos.length} photos</span>}
          {recapSlug && <Link href={`/blog/${recapSlug}`} className="row-recap">Read the recap</Link>}
        </p>
      </div>
      <ArrowRight className="row-arrow" size={22} aria-hidden />
    </article>
  );
}
