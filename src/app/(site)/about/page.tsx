import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { FaqList } from '@/components/site/FaqList';
import { PageIntro } from '@/components/site/PageIntro';
import { PhotoWall } from '@/components/site/PhotoWall';
import { Link } from '@/components/site/motion/TransitionLink';
import { PixelMap } from '@/components/site/PixelMap';
import { SectionHead } from '@/components/site/SectionHead';
import { TAG_LABEL, TAG_TONE } from '@/components/site/tone';
import { DISCIPLINES, STATUS_LABEL } from '@/lib/content/disciplines';
import { PUBLIC_FAQS } from '@/lib/content/faqs';
import { getEvents, getPosts, getSiteSettings } from '@/lib/content/queries';
import { photo, type PhotoId } from '@/lib/content/media';
import { pastEvents } from '@/lib/content/selectors';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'About',
  description: 'A student-led community at the University of Cape Coast, part of the AWS Student Builder Groups program. Open to every department.',
};

const FORMATS = [
  { title: 'Online talks', text: 'Evening sessions on Google Meet with people working in the industry, on getting started, DevOps, certifications and careers.' },
  { title: 'Training bootcamps', text: 'Structured programmes that pair a certification syllabus with practical work on AWS. The first, Zero to Cloud Practitioner, runs with CITSA.' },
  { title: 'Hands-on sessions', text: 'In-person sessions on campus where members build, test and troubleshoot on AWS, with facilitators beside them.' },
  { title: 'Projects', text: 'Members share what they build, at a session or on their own, through the Builder Portal, which also holds session materials.' },
];

// The bootcamp is a programme, not an event record (Joel, 11 Nov 2026), so its milestones are listed here by hand.
const BOOTCAMP_MILESTONES = [
  { at: new Date('2026-10-17T16:30:00Z'), title: 'Zero to Cloud Practitioner begins', text: 'Our 12-week bootcamp with CITSA starts at LT5, on Saturday afternoons.', postSlug: null },
  { at: new Date('2026-10-31T16:30:00Z'), title: 'Bootcamp week 3: a first website on Amazon S3', text: 'Every participant deployed a Hostel Finder website, working through bucket policy errors on the way.', postSlug: 'first-website-on-amazon-s3' },
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
  const recapSlugs = new Set(posts.filter((p) => !p.externalUrl).map((p) => p.slug));
  const lead = photo('facilitators');
  const milestones = [
    ...past.map((event) => ({
      key: event.id,
      at: event.startsAt,
      tone: TAG_TONE[event.tag],
      kind: `${TAG_LABEL[event.tag]}, ${event.format === 'IN_PERSON' ? 'on campus' : 'online'}`,
      title: event.title.split(':')[0],
      text: event.summary,
      href: `/events/${event.slug}` as string | null,
    })),
    ...BOOTCAMP_MILESTONES.filter((m) => m.at <= now).map((m) => ({
      key: m.title,
      at: m.at,
      tone: TAG_TONE.BOOTCAMP,
      kind: `${TAG_LABEL.BOOTCAMP}, on campus`,
      title: m.title,
      text: m.text,
      href: !m.postSlug ? '/events#bootcamp' : recapSlugs.has(m.postSlug) ? `/blog/${m.postSlug}` : null,
    })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());
  const covered = DISCIPLINES.filter((d) => d.status === 'covered');
  const open = DISCIPLINES.filter((d) => d.status !== 'covered');

  return (
    <>
      <section className="band band-top">
        <Container>
          <PageIntro
            label="Who we are"
            title="About"
            intro="Students at the University of Cape Coast who learn cloud computing, software development, AI and more by building things together, and who try to make the first step easier for whoever comes next."
          />
          <div className="about-split">
            <div className="about-text" data-reveal="rise">
              <h2 className="section-title">Why the group exists</h2>
              <p>
                Cloud computing, software and AI are often treated as Computer Science subjects, but they sit behind services in finance, health,
                education, agriculture and research. We started the group so that students from any department can learn how these technologies
                work and build with them, whether or not they have written code before.
              </p>
              {first && (
                <p>
                  Since launching on {formatDate(first.startsAt)}, we have run {past.length} {past.length === 1 ? 'event' : 'events'} and started
                  the Zero to Cloud Practitioner bootcamp. Most of that work has been cloud fundamentals, career guidance and getting websites online.
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

      <section className="band band-alt" aria-labelledby="how-title">
        <Container>
          <SectionHead label="What we run" title="How we learn and build" id="how-title" action={<Cta href="/events" variant="arrow">All events</Cta>} />
          <ol className="how-steps" data-reveal="steps">
            {FORMATS.map((format, index) => (
              <li key={format.title} style={{ '--i': index } as CSSProperties}>
                <span className="how-num">{String(index + 1).padStart(2, '0')}</span>
                <h3>{format.title}</h3>
                <p>{format.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="band" aria-labelledby="areas-title">
        <Container>
          <SectionHead label="Beyond certifications" title="What members explore" id="areas-title">
            The talks and the bootcamp focus on AWS. The group is for anyone who wants to build, whether that is software, data, security or AI.
          </SectionHead>
          <div className="area-groups" data-reveal="rise">
            {[
              { label: STATUS_LABEL.covered, items: covered },
              { label: 'Not covered yet', items: open },
            ].map((group) => (
              <div key={group.label}>
                <h3 className="type-label text-text-muted">{group.label}</h3>
                <ul className="area-list">
                  {group.items.map((d) => (
                    <li key={d.id}>
                      <Link href={`/#explore-${d.id}`}>
                        <span className={`swatch swatch-${d.tone}`} aria-hidden="true" />
                        {d.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {milestones.length > 0 && (
        <section className="band band-grid" aria-labelledby="story-title">
          <Container>
            <SectionHead label={first ? `Since ${formatDate(first.startsAt)}` : 'Our history'} title="How the group has grown" id="story-title" />
            <ol className="milestones" data-reveal="rise">
              {milestones.map((m) => (
                <li key={m.key} className="milestone">
                  <p className="type-label milestone-date">
                    <span className={`swatch swatch-${m.tone}`} aria-hidden="true" />
                    {formatDate(m.at)}
                  </p>
                  <div>
                    <h3>{m.href ? <Link href={m.href}>{m.title}</Link> : m.title}</h3>
                    <p className="milestone-kind">{m.kind}</p>
                    <p>{m.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      <section className="band" aria-labelledby="gallery-title">
        <Container>
          <SectionHead label="Zero to Cloud Practitioner" title="Inside the bootcamp" id="gallery-title" />
          <PhotoWall
            label="Bootcamp photographs"
            photos={GALLERY.map((item) => ({ ...photo(item.id), caption: item.caption, shape: item.shape }))}
          />
        </Container>
      </section>

      <section className="band band-alt" id="faq" aria-labelledby="faq-title">
        <Container>
          <SectionHead label="Common questions" title="Frequently asked questions" id="faq-title" action={<Cta href="/contact" variant="arrow">Ask us something else</Cta>} />
          <FaqList items={PUBLIC_FAQS} />
        </Container>
      </section>

      <section className="band" aria-labelledby="programme-title">
        <Container>
          <div className="programme-note">
            <div data-reveal="rise">
              <Image src="/brand/sbg-chip-purple.svg" alt="" width={56} height={56} unoptimized />
              <h2 id="programme-title" className="section-title">Part of a global program, run by UCC students</h2>
              <p>
                AWS Student Builder Groups give members access to hands-on learning, technical events and AWS resources. The group at UCC is run
                independently by students. It is not operated by AWS or by the university.
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
