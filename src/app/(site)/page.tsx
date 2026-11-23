import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { FeatureEvent } from '@/components/site/FeatureEvent';
import { BootcampStory } from '@/components/site/home/BootcampStory';
import { Closing } from '@/components/site/home/Closing';
import { DisciplineExplorer } from '@/components/site/home/DisciplineExplorer';
import { HeroMosaic } from '@/components/site/home/HeroMosaic';
import { PhotoReel } from '@/components/site/home/PhotoReel';
import { Staircase } from '@/components/site/home/Staircase';
import { PartnerTile } from '@/components/site/PartnerTile';
import { ProjectCard, ProjectSlots } from '@/components/site/ProjectCard';
import { SectionHead } from '@/components/site/SectionHead';
import { TeamCard } from '@/components/site/TeamCard';
import { boardRecords, DISCIPLINES } from '@/lib/content/disciplines';
import { allPhotos, eventPhoto, photo, photoDate, type EventPhotoId } from '@/lib/content/media';
import { getEvents, getPartners, getPosts, getProjects, getSiteSettings, getTeam } from '@/lib/content/queries';
import { pastEvents, projectCredit, upcomingEvents } from '@/lib/content/selectors';
import { formatDate } from '@/lib/format';

// From Code to Cloud in the order it happened, without the two hero photos. About as long as the bootcamp strip, so
// both drift at the same pace; every photo from the day is on the event page.
const BUILD_DAY: EventPhotoId[] = [
  'fcc-opening-slide',
  'fcc-builder-center-talk',
  'fcc-builder-center-on-phone',
  'fcc-console-on-screen',
  'fcc-starter-portfolio',
  'fcc-over-the-shoulder',
  'fcc-code-editor',
  'fcc-working-together',
  'fcc-pointing-it-out',
  'fcc-project-list',
  'fcc-three-at-screen',
  'fcc-everyone',
];

export default async function HomePage() {
  const [s, events, partners, team, projects, posts] = await Promise.all([getSiteSettings(), getEvents(), getPartners(), getTeam(), getProjects(), getPosts()]);
  const now = new Date();
  const next = upcomingEvents(events, now)[0];
  const past = pastEvents(events, now);
  const sitePosts = posts.filter((p) => !p.externalUrl);
  const recaps = new Map(sitePosts.map((p) => [p.id, p.slug]));
  const records = boardRecords(DISCIPLINES, events, sitePosts);
  const weekThree = sitePosts.find((p) => p.slug === 'first-website-on-amazon-s3');
  const first = [...events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
  const campus = partners.filter((p) => p.type === 'CAMPUS');
  const buildDay = past.find((e) => e.slug === 'from-code-to-cloud');
  const buildDayPhotos = BUILD_DAY.map((id) => {
    const image = eventPhoto(id);
    return { src: image.src, alt: image.alt, wide: image.width > image.height, date: null };
  });
  const reel = allPhotos().map((id) => {
    const image = photo(id);
    const date = photoDate(id);
    return { src: image.src, alt: image.alt, wide: image.width > image.height, date, caption: date ? `${image.alt}. ${date}.` : image.alt };
  });

  return (
    <>
      <HeroMosaic meetupUrl={s.meetupUrl} next={next} latest={past[0]} now={now} />

      {next && (
        <section className="band" aria-label="Next session">
          <Container>
            <FeatureEvent event={next} now={now} />
          </Container>
        </section>
      )}

      {events.length > 0 && (
        <section className="band band-grid" aria-labelledby="story-title">
          <Container>
            <SectionHead label={first ? `Since ${formatDate(first.startsAt)}` : 'Our sessions'} title={<>Our events<br />so far</>} id="story-title" action={<Cta href="/events" variant="arrow">All events</Cta>} />
            <Staircase events={events} now={now} recaps={recaps} />
          </Container>
        </section>
      )}

      {buildDay && (
        <section className="band band-alt" aria-labelledby="build-day-title">
          <Container>
            <SectionHead
              label={formatDate(buildDay.startsAt)}
              title={buildDay.title.split(':')[0]}
              id="build-day-title"
              action={<Cta href={`/events/${buildDay.slug}`} variant="arrow">See the event</Cta>}
            >
              {buildDay.summary}
            </SectionHead>
          </Container>
          <PhotoReel photos={buildDayPhotos} label={`${buildDay.title.split(':')[0]} photographs`} />
        </section>
      )}

      <section className="band" aria-label="Inside the bootcamp">
        <Container>
          <BootcampStory recapSlug={weekThree?.slug} />
          <p className="type-label reel-label">Inside the Zero to Cloud Practitioner bootcamp</p>
        </Container>
        <PhotoReel photos={reel} label="Bootcamp photographs" />
      </section>

      <section className="band band-alt" aria-labelledby="explore-title">
        <Container>
          <SectionHead label="Beyond certifications" title={<>What we&apos;re<br />exploring</>} id="explore-title">
            We&apos;ve started with cloud fundamentals and getting websites and apps online. There&apos;s plenty more to explore, from DevOps and
            security to machine learning and data analytics. Choose an area to see what we&apos;ve covered.
          </SectionHead>
          <DisciplineExplorer disciplines={DISCIPLINES} records={records} />
        </Container>
      </section>

      <section className="band" aria-labelledby="projects-title">
        <Container>
          {projects.length > 0 ? (
            <>
              <SectionHead label="Built by members" title="Member projects" id="projects-title" action={<Cta href="/projects" variant="arrow">All projects</Cta>} />
              <div className="home-projects">
                {projects.slice(0, 3).map((project, index) => (
                  <ProjectCard key={project.id} project={project} credit={projectCredit(project)?.name} size={index === 0 ? 'large' : 'normal'} />
                ))}
              </div>
            </>
          ) : (
            <div className="projects-invite">
              <SectionHead label="Member projects" title="Share your AWS project" id="projects-title">
                Built something using AWS? Submit it through the Builder Portal, whether you worked on it during a session or independently. Show us
                what it does, how you built it and the AWS services behind it.
              </SectionHead>
              <ProjectSlots />
              <Cta href="/builder/projects/new" variant="line">Submit a project</Cta>
            </div>
          )}
        </Container>
      </section>

      {(team.length > 0 || campus.length > 0) && (
        <section className="band band-alt" aria-labelledby="people-title">
          <Container>
            <SectionHead label={team.length > 0 ? 'Student-led' : 'On campus'} title={team.length > 0 ? 'Who runs the group' : 'Our campus partners'} id="people-title" action={team.length > 0 ? <Cta href="/team" variant="arrow">Meet the team</Cta> : undefined} />
            {team.length > 0 && <div className="team-grid">{team.slice(0, 4).map((person) => <TeamCard key={person.id} person={person} />)}</div>}
            {campus.length > 0 && (
              <div className="collaborators">
                {team.length > 0 && <p className="type-label text-text-muted">Campus partners</p>}
                <div className="partner-row">{campus.map((partner) => <PartnerTile key={partner.id} partner={partner} />)}</div>
              </div>
            )}
          </Container>
        </section>
      )}

      <Closing meetupUrl={s.meetupUrl} />
    </>
  );
}
