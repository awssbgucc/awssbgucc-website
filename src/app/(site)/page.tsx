import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { FeatureEvent } from '@/components/site/FeatureEvent';
import { Gallery } from '@/components/site/Gallery';
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

// Three photos from From Code to Cloud that the hero and the event page cover do not already use.
const BUILD_DAY: EventPhotoId[] = ['fcc-opening-slide', 'fcc-over-the-shoulder', 'fcc-three-at-screen'];

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
    return { src: image.src, alt: image.alt, wide: image.width >= image.height };
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
            <SectionHead label={first ? `Since ${formatDate(first.startsAt)}` : 'Our sessions'} title={<>What we&apos;ve<br />run so far.</>} id="story-title" action={<Cta href="/events" variant="arrow">All events</Cta>} />
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
            <Gallery photos={buildDayPhotos} title={buildDay.title} />
          </Container>
        </section>
      )}

      <section className="band" aria-label="Inside the bootcamp">
        <Container>
          <BootcampStory recapSlug={weekThree?.slug} />
          <p className="type-label reel-label">Bootcamp weeks 2 and 3, Sat 24 and Sat 31 Oct 2026</p>
        </Container>
        <PhotoReel photos={reel} />
      </section>

      <section className="band band-alt" aria-labelledby="explore-title">
        <Container>
          <SectionHead label="More than certifications" title={<>What you can<br />build here.</>} id="explore-title">
            Most of our sessions so far have been about cloud foundations and getting websites online. The other areas are open to any member who
            wants to take them further. Pick one to see the sessions that covered it.
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
              <SectionHead label="Built by members" title="Your project belongs here." id="projects-title">
                If you have built something on AWS, at one of our sessions or on your own, share it through the Builder Portal and it can go up here.
              </SectionHead>
              <ProjectSlots />
              <Cta href="/builder/projects/new" variant="line">Share a project</Cta>
            </div>
          )}
        </Container>
      </section>

      {(team.length > 0 || campus.length > 0) && (
        <section className="band band-alt" aria-labelledby="people-title">
          <Container>
            <SectionHead label="Student-led" title={team.length > 0 ? 'The people who make it run.' : 'Working with us on campus.'} id="people-title" action={team.length > 0 ? <Cta href="/team" variant="arrow">Meet the team</Cta> : undefined} />
            {team.length > 0 && <div className="team-grid">{team.slice(0, 4).map((person) => <TeamCard key={person.id} person={person} />)}</div>}
            {campus.length > 0 && (
              <div className="collaborators">
                <p className="type-label text-text-muted">Campus partners</p>
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
