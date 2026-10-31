import crest from '@assets/pixel-art/ucc-crest.json';
import Link from 'next/link';
import { EventCard } from '@/components/site/EventCard';
import { NoEvents } from '@/components/site/NoEvents';
import { PartnerTile } from '@/components/site/PartnerTile';
import { PixelMap } from '@/components/site/PixelMap';
import { TeamCard } from '@/components/site/TeamCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { FadeOnView } from '@/components/ui/FadeOnView';
import { PixelGrid } from '@/components/ui/PixelGrid';
import { Section } from '@/components/ui/Section';
import { Tag, type EventTag } from '@/components/ui/Tag';
import { activeTeam, homeStats, publishedPartners, upcomingEvents } from '@/lib/content/selectors';
import { events, partners, siteSettings, teamMembers } from '@/lib/content/static';

const POINTS = [
  'Free and open to every department and level',
  'Free AWS Skill Builder courses for every member',
  'Certification support for members who put in the work',
];

const PROGRAMMES: { tag: EventTag; title: string; copy: string; scdOnly?: boolean }[] = [
  {
    tag: 'BOOTCAMP',
    title: 'Zero to Cloud Practitioner',
    // TODO(joel): add the schedule, and confirm the exam voucher sentence from docs/CONTENT.md against the
    // program terms before restoring it. COMPLIANCE rule 21 limits this copy to the schedule and the goal.
    copy: 'A weekly bootcamp with CITSA that takes you from no cloud knowledge to ready for the AWS Certified Cloud Practitioner exam.',
  },
  {
    tag: 'BUILD',
    title: 'From Code to Cloud',
    copy: 'In-person sessions in the computer lab where you deploy a real project on AWS. Bring a laptop. We bring the steps.',
  },
  {
    tag: 'TALK',
    title: 'Cloud and career talks',
    copy: 'Sessions with people who work in cloud, on what the job looks like and which certifications matter.',
  },
  {
    tag: 'COMMUNITY_DAY',
    title: 'AWS Student Builder Groups Student Community Day Cape Coast',
    copy: 'Our biggest day of the year: talks, workshops and the wider Ghana cloud community in one room.',
    scdOnly: true,
  },
];

// TODO(joel): confirm every benefit against the current program terms before launch.
const BENEFITS = [
  { title: 'AWS Skill Builder', copy: 'Free access to hundreds of AWS courses and learning paths, with badges you can show on your CV.' },
  { title: 'AWS Builder Center profile', copy: 'A public profile that records the badges you earn and the articles you publish.' },
  { title: 'Hands-on sessions', copy: 'Build sessions where you deploy something real, not just watch slides.' },
  { title: 'Certification support', copy: 'Study support for AWS certifications, and a route to exam vouchers for committed members.' },
];

export default function HomePage() {
  const now = new Date();
  const s = siteSettings;
  const stats = homeStats(s, events, partners, now);
  const nextEvent = upcomingEvents(events, now)[0];
  const campusPartners = publishedPartners(partners, 'CAMPUS');
  const programmes = PROGRAMMES.filter((p) => !p.scdOnly || s.scdPageEnabled);

  return (
    <>
      <section className="hero-grid py-16 lg:py-24">
        <Container className="grid gap-12 xl:grid-cols-[auto_1fr] xl:items-center">
          <div className="xl:max-w-[560px]">
            <h1 className="type-hero">
              Build from
              <br />
              <span className="text-brand-gradient">Cape Coast.</span>
            </h1>
            <p className="mt-6 max-w-[62ch]">
              We are the AWS Student Builder Group at University of Cape Coast. Students from any department learn cloud
              computing by building real projects on AWS, together, every week.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={s.meetupUrl}>Join on Meetup</Button>
              {s.whatsappUrl && (
                <Button href={s.whatsappUrl} variant="secondary">
                  Join the WhatsApp community
                </Button>
              )}
            </div>
            <Button href={s.builderCenterUrl} variant="text" className="mt-3">
              New to AWS? Create your free Builder Center profile
            </Button>
          </div>
          <PixelMap />
        </Container>
      </section>

      {stats.length > 0 && (
        <div className="border-t border-border pb-16 lg:pb-24">
          <Container className="flex flex-wrap gap-x-16 gap-y-8 pt-12">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <p className="font-display text-4xl font-medium lg:text-5xl">{value}</p>
                <p className="mt-1 text-sm font-medium text-text-muted">{label}</p>
              </div>
            ))}
          </Container>
        </div>
      )}

      <Section alt id="about">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Eyebrow>About the group</Eyebrow>
            <h2 className="type-section mt-3">A place to learn cloud by doing it.</h2>
            <p className="mt-6 max-w-[62ch]">
              The AWS Student Builder Group at University of Cape Coast is a student-led group in the AWS Student Builder
              Groups program. We are the first one on campus.
            </p>
            <p className="mt-4 max-w-[62ch]">
              We run bootcamps, hands-on build sessions and career talks, all built around AWS. Sessions are free and open
              to students from every department and level. You do not need to be a computer science student, and you do not
              need any experience.
            </p>
            <ul className="mt-6 space-y-2">
              {POINTS.map((point) => (
                <li key={point} className="flex items-baseline gap-3">
                  <span aria-hidden className="size-2 shrink-0 translate-y-[-1px] bg-text-muted" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          {s.uccCrestApproved && (
            <figure className="w-40 shrink-0 lg:w-60">
              <FadeOnView>
                <PixelGrid data={crest} label="University of Cape Coast crest in pixel art" fade />
              </FadeOnView>
              <figcaption className="mt-3 text-sm font-medium text-text-muted">University of Cape Coast</figcaption>
            </figure>
          )}
        </div>
      </Section>

      <Section>
        <Eyebrow>What we run</Eyebrow>
        <h2 className="type-section mt-3">Programmes and events</h2>
        <div className={`mt-10 grid gap-4 md:grid-cols-2 ${programmes.length === 3 ? 'lg:grid-cols-3' : ''}`}>
          {programmes.map(({ tag, title, copy }) => (
            <Card key={title}>
              <Tag tag={tag} />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-text-muted">{copy}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/events">See all events</Button>
          {s.instagramUrl && (
            <Button href={s.instagramUrl} variant="secondary">
              Follow us on Instagram
            </Button>
          )}
        </div>
      </Section>

      <Section alt>
        {nextEvent ? (
          <div className="max-w-2xl">
            <EventCard event={nextEvent} />
          </div>
        ) : (
          <NoEvents />
        )}
      </Section>

      <Section>
        <Eyebrow>The team</Eyebrow>
        <h2 className="type-section mt-3">Run by students, for students.</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
          {activeTeam(teamMembers).map((person) => (
            <TeamCard key={person.id} person={person} />
          ))}
        </div>
        <Link href="/team" className="mt-8 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
          Meet the team
        </Link>
      </Section>

      {campusPartners.length > 0 && (
        <Section alt>
          <Eyebrow>Campus partners</Eyebrow>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {campusPartners.map((partner) => (
              <PartnerTile key={partner.id} partner={partner} />
            ))}
          </div>
        </Section>
      )}

      <Section>
        <Eyebrow>For every member</Eyebrow>
        <h2 className="type-section mt-3">What you get</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {BENEFITS.map(({ title, copy }) => (
            <Card key={title}>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-text-muted">{copy}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section alt>
        <h2 className="type-section">Your first build starts here.</h2>
        <p className="mt-4 max-w-[62ch]">
          {s.whatsappUrl
            ? 'Join on Meetup to get every event in your inbox, and join the WhatsApp community for updates on campus.'
            : 'Join on Meetup to get every event in your inbox.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={s.meetupUrl}>Join on Meetup</Button>
          {s.whatsappUrl && (
            <Button href={s.whatsappUrl} variant="secondary">
              Join the WhatsApp community
            </Button>
          )}
        </div>
      </Section>
    </>
  );
}
