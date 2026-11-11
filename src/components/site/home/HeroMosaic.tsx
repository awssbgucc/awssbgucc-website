import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Container } from '@/components/ui/Container';
import { DISCIPLINES } from '@/lib/content/disciplines';
import { photo } from '@/lib/content/media';
import type { Event } from '@/lib/content/types';
import { countdown, dateParts } from '@/lib/format';
import { Cta } from '../Cta';

const i = (index: number) => ({ '--i': index }) as CSSProperties;

/** The opening grid: the official SBG cell system holding real photographs, the chip and the next date. */
export function HeroMosaic({ meetupUrl, next, latest, now }: { meetupUrl: string; next?: Event; latest?: Event; now: Date }) {
  const main = photo('classroom');
  const portrait = photo('student-smiling');
  const detail = photo('code-on-screen');
  const featured = next ?? latest;
  const when = featured ? dateParts(featured.startsAt) : null;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-field" aria-hidden="true" />
      <Container>
        <p className="hero-meta">
          <span>AWS Student Builder Group</span>
          <span>University of Cape Coast, Ghana</span>
          <span className="hidden md:inline">5.10 N  1.25 W</span>
        </p>
        <div className="hero-layout">
          <div className="hero-copy">
            <h1 id="hero-title" className="hero-title">
              <span className="hero-line"><span style={i(0)}>A campus</span></span>{' '}
              <span className="hero-line"><span style={i(1)}>of builders.</span></span>
            </h1>
            <p className="hero-lead">
              We are the AWS Student Builder Group at University of Cape Coast: a student-led community, open to every department, where we learn
              software, cloud and AI by building real projects together on AWS. You do not need any experience to start.
            </p>
            <div className="hero-actions">
              <Cta href={meetupUrl}>Join on Meetup</Cta>
              <Cta href="/events" variant="arrow">See what we have run</Cta>
            </div>
          </div>

          <div className="hero-mosaic">
            <figure className="cell cell-photo m-main" style={i(0)}>
              <Image src={main.src} alt={main.alt} fill priority sizes="(min-width: 1024px) 34vw, 100vw" style={{ objectPosition: '55% 40%' }} />
              <figcaption>Zero to Cloud Practitioner, Sat 31 Oct 2026</figcaption>
            </figure>
            <div className="cell cell-chip m-chip" style={i(1)}>
              <Image src="/brand/sbg-chip-purple.svg" alt="" width={44} height={44} unoptimized />
            </div>
            <figure className="cell cell-photo m-portrait" style={i(2)}>
              <Image src={portrait.src} alt={portrait.alt} fill sizes="(min-width: 1024px) 17vw, 1px" />
            </figure>
            {featured && when ? (
              <Link href={`/events/${featured.slug}`} className={`cell m-next ${next ? 'block-mint' : 'block-blue'}`} style={i(3)}>
                <span className="type-label">{next ? 'Next session' : 'Most recent session'}</span>
                <span className="m-next-date">{when.weekday} {when.day} {when.month}</span>
                <span className="m-next-title">{featured.title.split(':')[0]}</span>
                {next && <span className="type-label">{countdown(next.startsAt, now)}</span>}
              </Link>
            ) : (
              <a href={meetupUrl} className="cell m-next block-mint" style={i(3)}>
                <span className="type-label">Sessions</span>
                <span className="m-next-title">The next date goes up on Meetup first.</span>
              </a>
            )}
            <div className="cell block-blue m-blue" style={i(4)} aria-hidden="true" />
            <figure className="cell cell-photo m-detail" style={i(5)}>
              <Image src={detail.src} alt={detail.alt} fill sizes="(min-width: 1024px) 12vw, 1px" />
            </figure>
            <div className="cell block-magenta m-magenta" style={i(6)} aria-hidden="true" />
            <p className="cell m-note" style={i(7)}>
              <span className="type-label">Bootcamp</span> Saturdays, 4:30 PM, LT5
            </p>
          </div>
        </div>

        <div className="hero-fields">
          <span className="type-label">Members explore</span>
          <ul>
            {DISCIPLINES.map((d) => (
              <li key={d.id}>
                <a href={`#explore-${d.id}`}>
                  <span className={`swatch swatch-${d.tone}`} aria-hidden="true" />
                  {d.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
