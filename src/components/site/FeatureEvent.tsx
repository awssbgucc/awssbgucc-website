import Image from 'next/image';
import { Cta } from './Cta';
import { TAG_LABEL, TAG_TONE } from './tone';
import type { Event } from '@/lib/content/types';
import { countdown, dateParts, formatDate, formatTimeRange } from '@/lib/format';

/** The next session, given the room it deserves: the date set large, the facts in HTML, the flyer whole beside them. */
export function FeatureEvent({ event, now, headingLevel = 2 }: { event: Event; now: Date; headingLevel?: 2 | 3 }) {
  const when = dateParts(event.startsAt);
  const soon = countdown(event.startsAt, now);
  const Heading = `h${headingLevel}` as const;
  return (
    <article className="feature-event" data-reveal="rise">
      <div className="feature-date">
        <span className={`feature-date-block block-${TAG_TONE[event.tag]}`}>
          <span className="type-label">{when.weekday}</span>
          <span className="feature-day">{when.day}</span>
          <span className="feature-month">{when.month} {when.year}</span>
        </span>
        {soon && <span className="feature-countdown"><span className="live-dot" aria-hidden="true" />{soon}</span>}
      </div>
      <div className="feature-body">
        <p className="type-label text-text-muted">{TAG_LABEL[event.tag]} / {event.format === 'IN_PERSON' ? 'On campus' : 'Online'}</p>
        <Heading className="feature-title">{event.title}</Heading>
        <p className="feature-summary">{event.summary}</p>
        <dl className="fact-grid">
          <div><dt>Date</dt><dd>{formatDate(event.startsAt)}</dd></div>
          <div><dt>Time, GMT</dt><dd>{formatTimeRange(event.startsAt, event.endsAt)}</dd></div>
          <div className="col-span-full"><dt>Where</dt><dd>{event.venue ?? 'Online'}</dd></div>
        </dl>
        <div className="feature-actions">
          {event.meetupUrl && <Cta href={event.meetupUrl} variant="mint">RSVP on Meetup</Cta>}
          <Cta href={`/events/${event.slug}`} variant="arrow">Session details</Cta>
        </div>
      </div>
      {event.coverImage && (
        <figure className="feature-art">
          <div className="flyer-frame" data-reveal="mask">
            <Image src={event.coverImage} alt={`Flyer for ${event.title}`} fill sizes="(min-width: 1280px) 520px, (min-width: 768px) 45vw, 100vw" />
          </div>
          <figcaption>Original flyer</figcaption>
        </figure>
      )}
    </article>
  );
}
