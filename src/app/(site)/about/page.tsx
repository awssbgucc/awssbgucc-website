import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { Staircase } from '@/components/site/home/Staircase';
import { PageIntro } from '@/components/site/PageIntro';
import { PixelMap } from '@/components/site/PixelMap';
import { SectionHead } from '@/components/site/SectionHead';
import { getEvents, getPosts, getSiteSettings } from '@/lib/content/queries';
import { photo, type PhotoId } from '@/lib/content/media';
import { pastEvents } from '@/lib/content/selectors';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'About',
  description: 'A student-led community at the University of Cape Coast, part of the AWS Student Builder Groups programme. Open to every department.',
};

const STEPS = [
  { title: 'Join on Meetup', text: 'Membership runs through Meetup. Every session is listed there first, with its RSVP.' },
  { title: 'Come to a session', text: 'Talks run online. The bootcamp and build sessions happen on campus, with laptops open.' },
  { title: 'Keep a record', text: 'Members sign in to the Builder Portal with Google to check in, pick up materials and submit projects.' },
  { title: 'Build in the open', text: 'Approved projects appear on this site, and builders are named only if they agree.' },
];

// Bootcamp photographs not used on the home page. Dates come from the photo filenames.
const GALLERY: { id: PhotoId; caption: string; shape: string }[] = [
  { id: 'helping', caption: 'Working through a lab together. Sat 24 Oct 2026', shape: 'tall' },
  { id: 'room-working', caption: 'Rows of students, laptops open. Sat 31 Oct 2026', shape: 'wide' },
  { id: 'smile-portrait', caption: 'Week 2 of the bootcamp. Sat 24 Oct 2026', shape: 'square' },
  { id: 'prize', caption: 'Swag for the quiz podium. Sat 31 Oct 2026', shape: 'square' },
  { id: 'concentrating', caption: 'Heads down in the lab. Sat 31 Oct 2026', shape: 'wide' },
  { id: 'front-of-room', caption: 'Following along from the front bench. Sat 24 Oct 2026', shape: 'square' },
];

export default async function AboutPage() {
  const [events, posts, s] = await Promise.all([getEvents(), getPosts(), getSiteSettings()]);
  const now = new Date();
  const past = pastEvents(events, now);
  const first = past[past.length - 1];
  const recaps = new Map(posts.filter((p) => !p.externalUrl).map((p) => [p.id, p.slug]));
  const lead = photo('facilitators');

  return (
    <>
      <section className="band band-top">
        <Container>
          <PageIntro label="Who we are" title="About" intro="A student-led community at the University of Cape Coast, and part of the AWS Student Builder Groups programme." />
          <div className="about-split">
            <div className="about-text" data-reveal="rise">
              <h2 className="section-title">Students who learn by building.</h2>
              <p>
                AWS Student Builder Groups are student-led communities on university campuses, where members learn cloud and AI, run technical events
                and build projects together. Ours meets at the University of Cape Coast and is open to students from every department.
              </p>
              {first && (
                <p>
                  Since our launch on {formatDate(first.startsAt)}, we have run {past.length} {past.length === 1 ? 'session' : 'sessions'} and started
                  the 12-week Zero to Cloud Practitioner bootcamp with CITSA. AWS ties the work together, but the point is building: software, websites, cloud
                  infrastructure and whatever members want to take on next.
                </p>
              )}
              <blockquote className="about-quote">
                <p>You don&apos;t have to know everything before you start. What matters is your willingness to learn, practise, collaborate, and keep building.</p>
                <cite className="type-label">From our freshers onboarding recap</cite>
              </blockquote>
            </div>
            <figure className="about-photo" data-reveal="mask">
              <Image src={lead.src} alt={lead.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" />
              <figcaption>Facilitators at the bootcamp. Sat 31 Oct 2026</figcaption>
            </figure>
          </div>
        </Container>
      </section>

      {events.length > 0 && (
        <section className="band band-grid" aria-labelledby="story-title">
          <Container>
            <SectionHead label="The record" title="Every session, a step up." id="story-title" action={<Cta href="/events" variant="arrow">The full archive</Cta>} />
            <Staircase events={events} now={now} recaps={recaps} />
          </Container>
        </section>
      )}

      <section className="band" aria-labelledby="how-title">
        <Container>
          <SectionHead label="Membership" title="How it works." id="how-title" />
          <ol className="how-steps" data-reveal="steps">
            {STEPS.map((step, index) => (
              <li key={step.title} style={{ '--i': index } as CSSProperties}>
                <span className="how-num">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="band band-alt" aria-labelledby="gallery-title">
        <Container>
          <SectionHead label="Zero to Cloud Practitioner" title="Saturdays, in pictures." id="gallery-title">
            Photographs from the bootcamp, shared with the permission of the group.
          </SectionHead>
          <div className="photo-wall" data-reveal="steps">
            {GALLERY.map((item, index) => {
              const image = photo(item.id);
              return (
                <figure key={item.id} className={`wall-${item.shape}`} style={{ '--i': index } as CSSProperties}>
                  <div className="wall-photo"><Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, 50vw" /></div>
                  <figcaption>{item.caption}</figcaption>
                </figure>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="band" aria-labelledby="programme-title">
        <Container>
          <div className="programme-note">
            <div data-reveal="rise">
              <Image src="/brand/sbg-chip-purple.svg" alt="" width={56} height={56} unoptimized />
              <h2 id="programme-title" className="section-title">Part of a global programme, run by students here.</h2>
              <p>
                AWS Student Builder Groups give members hands-on learning, technical events and resources. Our group is run by students at the
                University of Cape Coast, not by Amazon Web Services.
              </p>
              <div className="flex flex-wrap gap-6">
                <Cta href={s.meetupUrl} variant="mint">Join on Meetup</Cta>
                <Cta href="https://builder.aws.com/community/student-builder-groups" variant="arrow">About the programme</Cta>
              </div>
            </div>
            <div className="programme-map"><PixelMap /></div>
          </div>
        </Container>
      </section>
    </>
  );
}
