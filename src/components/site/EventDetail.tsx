import Image from 'next/image';
import { Link } from '@/components/site/motion/TransitionLink';
import { eventPhotoBySrc, focusFor } from '@/lib/content/media';
import type { Event } from '@/lib/content/types';
import { countdown, dateParts, formatDate, formatTimeRange } from '@/lib/format';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';
import { Cta } from './Cta';
import { Gallery, type GalleryPhoto } from './Gallery';
import { Markdown } from './Markdown';
import { TAG_LABEL, TAG_TONE } from './tone';

type Neighbour = { slug: string; title: string; startsAt: Date } | null;
type Props = {
  event: Event;
  attendance?: number | null;
  resources?: { id: string; label: string; url: string; kind: string }[];
  recap?: { slug: string; title: string } | null;
  challenges?: { slug: string; title: string }[];
  previous?: Neighbour;
  next?: Neighbour;
  now?: Date;
};

export function EventDetail({ event, attendance = null, resources = [], recap = null, challenges = [], previous = null, next = null, now = new Date() }: Props) {
  const past = event.endsAt <= now;
  const live = !past && event.startsAt <= now;
  const when = dateParts(event.startsAt);
  const tone = TAG_TONE[event.tag];
  const soon = past ? null : countdown(event.startsAt, now);
  // After the event, the first gallery photo leads the page and the flyer moves to the side column.
  const photos: GalleryPhoto[] = event.photos.map((src, index) => {
    const known = eventPhotoBySrc(src);
    return known
      ? { src, alt: known.alt, wide: known.width >= known.height }
      : { src, alt: `${event.title}, photo ${index + 1} of ${event.photos.length}`, wide: false };
  });
  const [cover, ...rest] = past ? photos : [];
  const gallery = cover ? rest : photos;
  const flyer = event.coverImage && (
    <figure className={cover ? 'aside-flyer' : 'event-flyer'}>
      <div className="flyer-frame" data-reveal={cover ? undefined : 'mask'} data-vt-dest={cover ? undefined : 'art'}>
        <Image src={event.coverImage} alt={`Flyer for ${event.title}`} fill priority={!cover} sizes={cover ? '340px' : '(min-width: 1280px) 1100px, 100vw'} />
      </div>
      <figcaption>
        <span className="type-label">Event flyer</span>
      </figcaption>
    </figure>
  );

  return (
    <article className="event-page">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link href="/events">Events</Link>
        <span aria-hidden="true">/</span>
        <span>{past ? 'Archive' : 'Upcoming'}</span>
      </nav>

      <header className="event-hero">
        <div>
          <p className="type-label event-kind">
            <span className={`swatch swatch-${tone}`} aria-hidden="true" />
            {TAG_LABEL[event.tag]} / {past ? 'Past session' : live ? 'Happening now' : 'Upcoming session'}
          </p>
          <h1 className="event-title" data-vt-dest="title">{event.title}</h1>
          <p className="event-summary">{event.summary}</p>
        </div>
        <div className={`event-date block-${past ? tone : 'mint'}`} data-vt-dest="date">
          <span className="type-label">{when.weekday}</span>
          <span className="event-date-day">{when.day}</span>
          <span className="type-label">{when.month} {when.year}</span>
          {soon && <span className="event-date-soon">{soon}</span>}
        </div>
      </header>

      <div className="fact-strip">
        <dl className="contents">
          <div><dt>Date</dt><dd>{formatDate(event.startsAt)}</dd></div>
          <div><dt>Time, GMT</dt><dd>{formatTimeRange(event.startsAt, event.endsAt)}</dd></div>
          <div><dt>Where</dt><dd>{event.venue ?? 'Online'}</dd></div>
        </dl>
        <div className="fact-strip-action">
          {event.meetupUrl && <Cta href={event.meetupUrl} variant={past ? 'line' : 'mint'}>{past ? 'View Meetup listing' : 'RSVP on Meetup'}</Cta>}
        </div>
      </div>

      {cover ? (
        <figure className="event-cover" data-reveal="mask">
          <Image src={cover.src} alt={cover.alt} fill priority sizes="(min-width: 1280px) 1216px, 100vw" style={{ objectPosition: focusFor(cover.src) }} />
        </figure>
      ) : flyer}

      <div className="event-columns">
        <div className="min-w-0">
          <Markdown>{event.body}</Markdown>
        </div>
        <aside className="event-aside">
          <section className="aside-next">
            <h2 className="type-label text-lime">{past ? 'Missed this one' : 'Going?'}</h2>
            <p>{past ? 'New events go up on Meetup first.' : 'Register on Meetup. Any change to the time or room is posted there too.'}</p>
            {past ? <Cta href="/events" variant="arrow">See all events</Cta> : event.meetupUrl && <Cta href={event.meetupUrl} variant="arrow">Open the Meetup listing</Cta>}
          </section>
          {past && attendance !== null && (
            <section>
              <h2 className="type-label text-text-muted">Attendance</h2>
              <p className="aside-figure">{attendance}</p>
            </section>
          )}
          {resources.length > 0 && (
            <section aria-labelledby="materials">
              <h2 id="materials" className="type-label text-text-muted">Materials</h2>
              <ul className="aside-links">
                {resources.map((r) => (
                  <li key={r.id}><a href={r.url}><span>{r.label}</span><span className="type-label">{r.kind.toLowerCase()}</span></a></li>
                ))}
              </ul>
            </section>
          )}
          {recap && (
            <section>
              <h2 className="type-label text-text-muted">Recap</h2>
              <ul className="aside-links"><li><Link href={`/blog/${recap.slug}`}><span>{recap.title}</span><span className="type-label">recap</span></Link></li></ul>
            </section>
          )}
          {challenges.length > 0 && (
            <section>
              <h2 className="type-label text-text-muted">Keep building</h2>
              <ul className="aside-links">
                {challenges.map((c) => <li key={c.slug}><Link href={`/builder/challenges/${c.slug}`}><span>Challenge: {c.title}</span><span className="type-label">portal</span></Link></li>)}
              </ul>
              <p className="mt-2 text-xs text-text-muted">Sign in to the Builder Portal to take part.</p>
            </section>
          )}
          {cover && flyer}
          <section className="aside-terms">
            <p>
              {past ? 'Event registration is subject to the ' : 'By registering, you agree to the '}
              <a href={AWS_EVENT_TERMS_URL}>AWS Event Terms and Conditions</a>.
            </p>
          </section>
        </aside>
      </div>

      {gallery.length > 0 && (
        <section className="event-photos" aria-labelledby="photos">
          <h2 id="photos" className="section-title">Photos from the day</h2>
          <Gallery photos={gallery} title={event.title} />
        </section>
      )}

      {(previous || next) && (
        <nav className="event-pager" aria-label="More sessions">
          {previous ? (
            <Link href={`/events/${previous.slug}`} className="pager-link">
              <span className="type-label">Earlier, {formatDate(previous.startsAt)}</span>
              <span>{previous.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/events/${next.slug}`} className="pager-link pager-next">
              <span className="type-label">Later, {formatDate(next.startsAt)}</span>
              <span>{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
