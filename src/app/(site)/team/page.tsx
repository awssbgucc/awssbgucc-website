import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { PageIntro } from '@/components/site/PageIntro';
import { TeamCard } from '@/components/site/TeamCard';
import { getSiteSettings, getTeam } from '@/lib/content/queries';
import type { TeamMember } from '@/lib/content/types';

export const metadata: Metadata = { title: 'The team', description: 'The students who run the AWS Student Builder Group at University of Cape Coast.' };

function Group({ title, people }: { title: string; people: TeamMember[] }) {
  if (people.length === 0) return null;
  return (
    <div className="mt-14 first:mt-0">
      <h2 className="type-label text-text-muted">{title}</h2>
      <div className="team-grid mt-6">
        {people.map((person) => <TeamCard key={person.id} person={person} />)}
      </div>
    </div>
  );
}

export default async function TeamPage() {
  const [team, { meetupUrl }] = await Promise.all([getTeam(), getSiteSettings()]);
  return (
    <section className="band band-top">
      <Container>
        <PageIntro label="Student-led" title="The team" intro="The students who plan sessions, coordinate venues, lead labs and run the group." />
        {team.length === 0 ? (
          <div className="quiet-empty" data-reveal="rise">
            <h2 className="section-title">Meet us at our next session</h2>
            <p>Upcoming events are listed on Meetup, and you can reach the core team through the contact page.</p>
            <Cta href={meetupUrl} variant="line">See our events on Meetup</Cta>
          </div>
        ) : (
          <>
            <Group title="Group Leader" people={team.filter((person) => person.roleGroup === 'LEADER')} />
            <Group title="Core team" people={team.filter((person) => person.roleGroup !== 'LEADER')} />
          </>
        )}
      </Container>
    </section>
  );
}
