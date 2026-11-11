import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { EventBrowser } from '@/components/site/EventBrowser';
import { FeatureEvent } from '@/components/site/FeatureEvent';
import { NoEvents } from '@/components/site/NoEvents';
import { PageIntro } from '@/components/site/PageIntro';
import { SectionHead } from '@/components/site/SectionHead';
import { getCheckInCounts, getEvents, getPosts } from '@/lib/content/queries';
import { attendanceFor, pastEvents, upcomingEvents } from '@/lib/content/selectors';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Build sessions, talks and the Zero to Cloud Practitioner bootcamp, run by students at the University of Cape Coast.',
};

export default async function EventsPage() {
  const now = new Date();
  const [events, posts, checkIns] = await Promise.all([getEvents(), getPosts(), getCheckInCounts()]);
  const upcoming = upcomingEvents(events, now);
  const past = pastEvents(events, now);
  const first = past[past.length - 1];
  const weekThree = posts.find((p) => p.slug === 'first-website-on-amazon-s3' && !p.externalUrl);
  const item = (event: (typeof events)[number]) => ({ event, attendance: attendanceFor(event, checkIns), recapSlug: posts.find((p) => p.id === event.recapPostId && !p.externalUrl)?.slug });

  return (
    <>
      <section className="band band-top">
        <Container>
          <PageIntro label="Sessions" title="Events" intro="Hands-on build sessions on campus, talks with people working in the field, and a weekly bootcamp. Registration is always on Meetup.">
            {events.length > 0 && (
              <dl className="intro-stats">
                <div><dt>Sessions run</dt><dd>{past.length}</dd></div>
                <div><dt>Coming up</dt><dd>{upcoming.length}</dd></div>
                {first && <div><dt>First session</dt><dd>{formatDate(first.startsAt)}</dd></div>}
              </dl>
            )}
          </PageIntro>
          {upcoming[0] && <FeatureEvent event={upcoming[0]} now={now} />}
        </Container>
      </section>

      <section className="band band-alt" id="past-events" aria-labelledby="archive-title">
        <Container>
          <SectionHead label="Archive" title="Every session so far." id="archive-title">
            Dates, rooms and speakers come from our Meetup listings. RSVP totals are not attendance records, so we only show attendance taken on the day.
          </SectionHead>
          <EventBrowser upcoming={upcoming.map(item)} past={past.map(item)} empty={<NoEvents />} />
        </Container>
      </section>

      <section className="band" aria-labelledby="bootcamp-title">
        <Container>
          <div className="programme-band" data-reveal="rise">
            <div>
              <p className="type-label text-lavender">Running now, with CITSA</p>
              <h2 id="bootcamp-title" className="section-title">Zero to Cloud Practitioner</h2>
              <p className="text-text-muted">
                A 12-week bootcamp with CITSA, working towards the AWS Certified Cloud Practitioner exam, with practical labs every week. UCC students
                can join without any AWS experience. Participants who attend consistently and score 70% or higher on the official AWS Skill Builder
                practice exam are eligible for a certification exam voucher.
              </p>
              <dl className="fact-grid mt-6">
                <div><dt>When</dt><dd>Saturdays, 4:30 to 6:00 PM</dd></div>
                <div><dt>Where</dt><dd>LT5, University of Cape Coast</dd></div>
                <div className="col-span-full"><dt>Length</dt><dd>12 weeks, from Sat 17 Oct 2026</dd></div>
              </dl>
              {weekThree && <Cta href={`/blog/${weekThree.slug}`} variant="arrow" className="mt-4">Inside week 3</Cta>}
            </div>
            <figure className="programme-flyer">
              <div className="flyer-frame" data-reveal="mask">
                <Image src="/media/events/zero-to-cloud.webp" alt="Flyer for Zero to Cloud Practitioner, a 12-week bootcamp starting Sat 17 Oct 2026" fill sizes="(min-width: 1024px) 560px, 100vw" />
              </div>
              <figcaption>Original bootcamp flyer</figcaption>
            </figure>
          </div>
        </Container>
      </section>
    </>
  );
}
