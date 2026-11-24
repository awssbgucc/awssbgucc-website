import Image from 'next/image';
import type { CSSProperties } from 'react';
import { Container } from '@/components/ui/Container';
import { DISCIPLINES } from '@/lib/content/disciplines';
import { eventPhoto, focusFor } from '@/lib/content/media';
import type { Event } from '@/lib/content/types';
import { countdown, dateParts } from '@/lib/format';
import { Cta } from '../Cta';
import { BuildField } from '../motion/BuildField';
import { PixelReveal } from '../motion/PixelReveal';
import { Link } from '../motion/TransitionLink';

const i = (index: number) => ({ '--i': index }) as CSSProperties;
// Each photo cell builds in at 260 ms plus 85 ms per cell, and its pixel layers resolve on the same clock.
const at = (index: number) => 260 + index * 85;

/**
 * The opening grid: the official SBG cell system holding real photographs, the chip and the next date. On arrival each
 * photo resolves from brand-coloured pixels into the picture (PixelReveal), the hairline grid behind answers the
 * pointer (BuildField), and the mint cursor after the headline blinks three times: the mint cell means "here and now"
 * across the site. See docs/MOTION_SYSTEM.md.
 */
export function HeroMosaic({ meetupUrl, whatsappUrl, next, latest, now }: { meetupUrl: string; whatsappUrl?: string | null; next?: Event; latest?: Event; now: Date }) {
  const main = eventPhoto('fcc-everyone');
  const portrait = eventPhoto('fcc-over-a-phone');
  const detail = eventPhoto('fcc-lab-bench');
  const featured = next ?? latest;
  const when = featured ? dateParts(featured.startsAt) : null;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-field" aria-hidden="true" />
      <BuildField />
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
              <span className="hero-line"><span style={i(1)}>of builders.<span className="hero-cursor" aria-hidden="true" /></span></span>
            </h1>
            <p className="hero-lead">
              A student-led technical community at the University of Cape Coast, open to every department. We run online talks with people in
              the industry, training bootcamps and hands-on sessions on campus for students learning cloud computing, software development, AI
              and other technologies on AWS. No prior experience needed.
            </p>
            <div className="hero-actions">
              <Cta href={meetupUrl}>Join on Meetup</Cta>
              {whatsappUrl && <Cta href={whatsappUrl} variant="line">Join WhatsApp</Cta>}
              <Cta href="/events" variant="arrow">See our events</Cta>
            </div>
          </div>

          <div className="hero-mosaic">
            <figure className="cell cell-photo m-main" style={i(0)}>
              <Image src={main.src} alt={main.alt} fill priority sizes="(min-width: 1024px) 34vw, 100vw" style={{ objectPosition: focusFor(main.src) }} />
              <PixelReveal id={main.id} position={focusFor(main.src)} delay={at(0)} />
              <figcaption>Computer Lab, New Science Annex</figcaption>
            </figure>
            <div className="cell cell-chip m-chip" style={i(1)}>
              <Image src="/brand/sbg-chip-purple.svg" alt="" width={44} height={44} unoptimized />
            </div>
            <figure className="cell cell-photo m-portrait" style={i(2)}>
              <Image src={portrait.src} alt={portrait.alt} fill sizes="(min-width: 1024px) 17vw, 1px" />
              <PixelReveal id={portrait.id} delay={at(2)} />
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
                <span className="m-next-title">New sessions are posted on Meetup first.</span>
              </a>
            )}
            <div className="cell block-blue m-blue" style={i(4)} aria-hidden="true" />
            <figure className="cell cell-photo m-detail" style={i(5)}>
              <Image src={detail.src} alt={detail.alt} fill sizes="(min-width: 1024px) 12vw, 1px" />
              <PixelReveal id={detail.id} delay={at(5)} />
            </figure>
            <div className="cell block-magenta m-magenta" style={i(6)} aria-hidden="true" />
            <p className="cell m-note" style={i(7)}>
              <span className="type-label">Bootcamp</span> Saturdays, 4:30 PM, LT5
            </p>
          </div>
        </div>

        <div className="hero-fields">
          <span className="type-label">Areas to explore</span>
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
