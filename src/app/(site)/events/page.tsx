import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { EventBrowser } from '@/components/site/EventBrowser';
import { FeatureEvent } from '@/components/site/FeatureEvent';
import { NewsletterBand } from '@/components/site/NewsletterBand';
import { NoEvents } from '@/components/site/NoEvents';
import { PageIntro } from '@/components/site/PageIntro';
import { SectionHead } from '@/components/site/SectionHead';
import { getCheckInCounts, getEvents, getPosts } from '@/lib/content/queries';
import { attendanceFor, pastEvents, upcomingEvents } from '@/lib/content/selectors';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Online talks, hands-on build sessions and the Zero to Cloud Practitioner bootcamp at the University of Cape Coast, with dates, speakers and recaps.',
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
          <PageIntro label="What we run" title="Events" intro="Online talks with people in the industry, hands-on sessions on campus and training bootcamps. Every event is free, with registration on Meetup.">
            {events.length > 0 && (
              <dl className="intro-stats">
                <div><dt>Events run</dt><dd>{past.length}</dd></div>
                {upcoming.length > 0 && <div><dt>Coming up</dt><dd>{upcoming.length}</dd></div>}
                {first && <div><dt>First event</dt><dd>{formatDate(first.startsAt)}</dd></div>}
              </dl>
            )}
          </PageIntro>
          {upcoming[0] && <FeatureEvent event={upcoming[0]} now={now} />}
        </Container>
      </section>

      <section className="band band-alt" id="past-events" aria-labelledby="archive-title">
        <Container>
          <SectionHead label="Archive" title="All events" id="archive-title" />
          <EventBrowser upcoming={upcoming.map(item)} past={past.map(item)} empty={<NoEvents />} />
        </Container>
      </section>

      <section className="band" id="bootcamp" aria-labelledby="bootcamp-title">
        <Container>
          <div className="programme-band" data-reveal="rise">
            <div>
              <p className="type-label text-lavender">Bootcamp, with CITSA</p>
              <h2 id="bootcamp-title" className="section-title">Zero to Cloud Practitioner</h2>
              <p className="text-text-muted">
                Preparation for the AWS Certified Cloud Practitioner exam, with practical work on AWS in every session. No AWS experience is needed
                to join.
              </p>
              <dl className="fact-grid mt-6">
                <div><dt>Duration</dt><dd>12 weeks, from Sat 17 Oct 2026</dd></div>
                <div><dt>Schedule</dt><dd>Saturdays, 4:30 to 6:00 PM</dd></div>
                <div><dt>Location</dt><dd>LT5, University of Cape Coast</dd></div>
                <div><dt>Run with</dt><dd>CITSA UCC</dd></div>
                <div className="col-span-full"><dt>Focus</dt><dd>Cloud Practitioner exam (CLF-C02) topics and hands-on AWS labs</dd></div>
              </dl>
              <div className="voucher-note">
                <p className="type-label">Exam voucher eligibility</p>
                <ul>
                  <li>Attend the bootcamp consistently</li>
                  <li>Score 70% or higher on the official AWS Skill Builder practice exam</li>
                </ul>
              </div>
              {weekThree && <Cta href={`/blog/${weekThree.slug}`} variant="arrow" className="mt-4">Read the week 3 recap</Cta>}
            </div>
            <figure className="programme-flyer">
              <div className="flyer-frame" data-reveal="mask">
                <Image src="/media/events/zero-to-cloud.webp" alt="Flyer for Zero to Cloud Practitioner, a 12-week bootcamp starting Sat 17 Oct 2026" fill sizes="(min-width: 1024px) 560px, 100vw" />
              </div>
              <figcaption>Bootcamp flyer</figcaption>
            </figure>
          </div>
        </Container>
      </section>

      <NewsletterBand source="events" surface="alt" />
    </>
  );
}
