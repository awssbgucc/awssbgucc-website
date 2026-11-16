import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { Staircase } from '@/components/site/home/Staircase';
import { PageIntro } from '@/components/site/PageIntro';
import { PhotoWall } from '@/components/site/PhotoWall';
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
  { title: 'Join on Meetup', text: 'Membership is free, and every event is posted on Meetup first.' },
  { title: 'Come to a session', text: 'Talks are online in the evening. The bootcamp and build sessions are on campus, so bring a laptop.' },
  { title: 'Use the Builder Portal', text: 'Sign in with Google to check in at sessions, pick up materials and keep track of what you have done.' },
  { title: 'Share what you build', text: 'Projects you build at our sessions or on your own can go up on this site.' },
];

// Bootcamp photographs not used on the home page. Dates come from the photo filenames.
const GALLERY: { id: PhotoId; caption: string; shape: string }[] = [
  { id: 'helping', caption: 'Helping a classmate along the bench. Sat 24 Oct 2026', shape: 'tall' },
  { id: 'room-working', caption: 'Week 3 at LT5. Sat 31 Oct 2026', shape: 'wide' },
  { id: 'smile-portrait', caption: 'Week 2 of the bootcamp. Sat 24 Oct 2026', shape: 'square' },
  { id: 'prize', caption: 'AWS swag for the quiz podium. Sat 31 Oct 2026', shape: 'square' },
  { id: 'concentrating', caption: 'Heads down in week 3. Sat 31 Oct 2026', shape: 'wide' },
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
                  Since our launch on {formatDate(first.startsAt)}, we have run {past.length} {past.length === 1 ? 'event' : 'events'} and started the
                  12-week Zero to Cloud Practitioner bootcamp with CITSA. Most of that work has been in cloud foundations, careers and getting
                  websites online. The group is for anyone who wants to build software, so backends, data, security and AI are open to members
                  who want to take them on.
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
            <SectionHead label="Our events" title="What we've run so far." id="story-title" action={<Cta href="/events" variant="arrow">All events</Cta>} />
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
          <SectionHead label="Zero to Cloud Practitioner" title="Weeks 2 and 3 of the bootcamp." id="gallery-title" />
          <PhotoWall
            label="Bootcamp photographs"
            photos={GALLERY.map((item) => ({ ...photo(item.id), caption: item.caption, shape: item.shape }))}
          />
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
