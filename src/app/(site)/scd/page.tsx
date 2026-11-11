import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PartnerTile } from '@/components/site/PartnerTile';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { getScd, getSiteSettings } from '@/lib/content/queries';
import { formatDate, formatTime } from '@/lib/format';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';

const NAME = 'AWS Student Builder Groups Student Community Day Cape Coast';

export const metadata: Metadata = { title: 'Student Community Day' };

// Everything here comes from the dashboard. The page is off until the event is confirmed (scdPageEnabled).
export default async function ScdPage() {
  const s = await getSiteSettings();
  if (!s.scdPageEnabled) notFound();
  const { sessions, speakers, faqs, sponsors } = await getScd();

  return (
    <>
      <section className="hero-grid border-b border-border py-16 lg:py-24">
        <Container>
          <p className="type-label text-lime">Student Community Day</p>
          <h1 className="type-section mt-4 max-w-[22ch] lg:text-5xl">{NAME}</h1>
          <dl className="mt-10 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
            {[
              ['When', s.scdDate ? `${formatDate(s.scdDate)}, ${formatTime(s.scdDate)}` : null],
              ['Where', s.scdVenue],
              ['Who', 'Students from every department and level'],
            ].map(([label, value]) =>
              value ? (
                <div key={label}>
                  <dt className="type-label text-text-muted">{label}</dt>
                  <dd className="mt-1 text-lg text-white">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
          {s.scdRegisterUrl && (
            <div className="mt-10">
              <Button href={s.scdRegisterUrl}>Register</Button>
              <p className="mt-4 text-sm text-text-muted">
                By registering, you agree to the{' '}
                <a href={AWS_EVENT_TERMS_URL} className="underline underline-offset-4">
                  AWS Event Terms and Conditions
                </a>
                .
              </p>
            </div>
          )}
        </Container>
      </section>

      {sessions.length > 0 && (
        <Section>
          <h2 className="type-section">Agenda</h2>
          <ol className="mt-8 border-t border-border">
            {sessions.map((item) => (
              <li key={item.id} className="grid grid-cols-[96px_1fr] gap-4 border-b border-border py-4 sm:grid-cols-[140px_1fr]">
                <p className="font-display text-sm text-text-muted">
                  {formatTime(item.startsAt)}
                  {item.endsAt && <span className="block">{formatTime(item.endsAt)}</span>}
                </p>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  {(item.speaker || item.room) && <p className="mt-1 text-sm text-text-muted">{[item.speaker, item.room].filter(Boolean).join(', ')}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {speakers.length > 0 && (
        <Section alt>
          <h2 className="type-section">Speakers</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((speaker) => (
              <li key={speaker.id} className="rounded-md border border-border bg-card p-5">
                <p className="font-semibold text-white">{speaker.name}</p>
                <p className="mt-1 text-sm text-text-muted">{[speaker.role, speaker.org].filter(Boolean).join(', ')}</p>
                {speaker.linkedin && (
                  <a href={speaker.linkedin} className="mt-2 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
                    LinkedIn
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {sponsors.length > 0 && (
        <Section>
          <h2 className="type-section">Sponsors</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {sponsors.map((partner) => (
              <PartnerTile key={partner.id} partner={partner} />
            ))}
          </div>
        </Section>
      )}

      {(s.scdVenue || faqs.length > 0) && (
        <Section alt>
          <div className="grid gap-12 lg:grid-cols-12">
            {s.scdVenue && (
              <div className="lg:col-span-4">
                <h2 className="type-section">Venue</h2>
                <p className="mt-4 text-lg text-white">{s.scdVenue}</p>
                {s.scdMapUrl && (
                  <a href={s.scdMapUrl} className="mt-3 inline-flex min-h-11 items-center underline underline-offset-4">
                    Open the map
                  </a>
                )}
              </div>
            )}
            {faqs.length > 0 && (
              <div className="lg:col-span-7 lg:col-start-6">
                <h2 className="type-section">Questions</h2>
                <div className="mt-6 border-t border-border">
                  {faqs.map((faq) => (
                    <details key={faq.id} className="border-b border-border py-4">
                      <summary className="min-h-11 cursor-pointer font-semibold text-white">{faq.question}</summary>
                      <p className="mt-2 text-text-muted">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}
    </>
  );
}
