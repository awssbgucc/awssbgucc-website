import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Cta } from '@/components/site/Cta';
import { EditionAgenda } from '@/components/site/edition/EditionAgenda';
import { EditionHero } from '@/components/site/edition/EditionHero';
import { PartnerTile } from '@/components/site/PartnerTile';
import { SectionHead } from '@/components/site/SectionHead';
import { Container } from '@/components/ui/Container';
import { getScd, getSiteSettings } from '@/lib/content/queries';
import { initials } from '@/lib/content/selectors';
import { EDITIONS, type Edition } from '@/lib/editions';
import { formatDate, formatTime } from '@/lib/format';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'Student Community Day' };

const TONES = ['purple', 'blue', 'magenta', 'mint'] as const;

// Everything here comes from the dashboard. The page is off until the event is confirmed (scdPageEnabled).
// The layout and theme come from the Community Day edition in src/lib/editions.ts; empty sections render nothing.
export default async function ScdPage() {
  const s = await getSiteSettings();
  if (!s.scdPageEnabled) notFound();
  const { sessions, speakers, faqs, sponsors } = await getScd();
  const edition: Edition = EDITIONS.scd;

  return (
    <div className={`edition edition-${edition.id}`} style={{ '--ed-accent': `var(--color-sbg-${edition.theme.accent})`, '--ed-second': `var(--color-sbg-${edition.theme.second})` } as CSSProperties}>
      <EditionHero
        edition={edition}
        facts={[
          ['When', s.scdDate ? `${formatDate(s.scdDate)}, ${formatTime(s.scdDate)}` : null],
          ['Where', s.scdVenue],
          ['Who', 'Students from every department and level'],
        ]}
        action={s.scdRegisterUrl ? (
          <>
            <Cta href={s.scdRegisterUrl} variant="mint">Register</Cta>
            <p className="edition-terms">
              By registering, you agree to the <a href={AWS_EVENT_TERMS_URL}>AWS Event Terms and Conditions</a>.
            </p>
          </>
        ) : undefined}
      />

      {sessions.length > 0 && (
        <section className="band" aria-labelledby="agenda-title">
          <Container>
            <SectionHead label="On the day" title="Agenda" id="agenda-title" />
            <EditionAgenda sessions={sessions} />
          </Container>
        </section>
      )}

      {speakers.length > 0 && (
        <section className="band band-alt" aria-labelledby="speakers-title">
          <Container>
            <SectionHead label="Speaking" title="Speakers" id="speakers-title" />
            <ul className="edition-speakers" data-reveal="steps">
              {speakers.map((speaker, index) => (
                <li key={speaker.id} style={{ '--i': index } as CSSProperties}>
                  <span className={`edition-speaker-block block-${TONES[index % TONES.length]}`} aria-hidden="true">{initials(speaker.name)}</span>
                  <p className="edition-speaker-name">{speaker.name}</p>
                  <p className="edition-speaker-role">{[speaker.role, speaker.org].filter(Boolean).join(', ')}</p>
                  {speaker.linkedin && <a href={speaker.linkedin} className="team-link">LinkedIn</a>}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {sponsors.length > 0 && (
        <section className="band" aria-labelledby="sponsors-title">
          <Container>
            <SectionHead label="With thanks" title="Sponsors" id="sponsors-title" />
            <div className="partner-row">{sponsors.map((partner) => <PartnerTile key={partner.id} partner={partner} />)}</div>
          </Container>
        </section>
      )}

      {(s.scdVenue || faqs.length > 0) && (
        <section className="band band-alt" aria-label="Venue and questions">
          <Container>
            <div className="edition-split">
              {s.scdVenue && (
                <div>
                  <SectionHead label="Getting there" title="Venue" id="venue-title" />
                  <p className="edition-venue">{s.scdVenue}</p>
                  {s.scdMapUrl && <Cta href={s.scdMapUrl} variant="arrow">Open the map</Cta>}
                </div>
              )}
              {faqs.length > 0 && (
                <div>
                  <SectionHead label="Before you come" title="Questions" id="faq-title" />
                  <div className="edition-faqs">
                    {faqs.map((faq) => (
                      <details key={faq.id}>
                        <summary>{faq.question}</summary>
                        <p>{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {edition.past.length > 0 && (
        <section className="band" aria-labelledby="past-title">
          <Container>
            <SectionHead label="Earlier editions" title="Past Community Days" id="past-title" />
            <ul className="edition-past">
              {edition.past.map((p) => <li key={p.year}><Cta href={p.href} variant="arrow">{`${p.year}: ${p.note}`}</Cta></li>)}
            </ul>
          </Container>
        </section>
      )}
    </div>
  );
}
