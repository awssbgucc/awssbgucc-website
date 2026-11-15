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
import { allPhotos, photo, photoDate } from '@/lib/content/media';
import { getEvents, getPartners, getPosts, getProjects, getSiteSettings, getTeam } from '@/lib/content/queries';
import { pastEvents, projectCredit, upcomingEvents } from '@/lib/content/selectors';
import { formatDate } from '@/lib/format';

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
            <SectionHead label={first ? `Since ${formatDate(first.startsAt)}` : 'Our sessions'} title={<>Every session,<br />a step up.</>} id="story-title" action={<Cta href="/events" variant="arrow">The full archive</Cta>}>
              The record so far, from our Meetup listings and the group&apos;s own recaps.
            </SectionHead>
            <Staircase events={events} now={now} recaps={recaps} />
          </Container>
        </section>
      )}

      <section className="band" aria-label="Inside the bootcamp">
        <Container>
          <BootcampStory recapSlug={weekThree?.slug} />
          <p className="type-label reel-label">Weeks 2 and 3, every approved photo in the order it was taken</p>
        </Container>
        <PhotoReel photos={reel} />
      </section>

      <section className="band band-alt" aria-labelledby="explore-title">
        <Container>
          <SectionHead label="More than certifications" title={<>What you can<br />build here.</>} id="explore-title">
            AWS connects all of them. Each area shows whether we have covered it in a session yet, or whether it is still open for members to take on.
          </SectionHead>
          <DisciplineExplorer disciplines={DISCIPLINES} records={records} />
        </Container>
      </section>

      <section className="band" aria-labelledby="projects-title">
        <Container>
          {projects.length > 0 ? (
            <>
              <SectionHead label="Built by members" title="Made here. Out in the world." id="projects-title" action={<Cta href="/projects" variant="arrow">All projects</Cta>} />
              <div className="home-projects">
                {projects.slice(0, 3).map((project, index) => (
                  <ProjectCard key={project.id} project={project} credit={projectCredit(project)?.name} size={index === 0 ? 'large' : 'normal'} />
                ))}
              </div>
            </>
          ) : (
            <div className="projects-invite">
              <SectionHead label="Built by members" title="Your project belongs here." id="projects-title">
                Member projects appear after the technical team has reviewed them and the builders have agreed to be named.
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
                <p className="type-label text-text-muted">On campus, with</p>
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
