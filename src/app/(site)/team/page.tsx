import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/PageIntro';
import { TeamCard } from '@/components/site/TeamCard';
import { Section } from '@/components/ui/Section';
import { activeTeam } from '@/lib/content/selectors';
import { teamMembers } from '@/lib/content/static';

export const metadata: Metadata = { title: 'The team' };

const GRID = 'mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4';

export default function TeamPage() {
  const team = activeTeam(teamMembers);
  const leaders = team.filter((person) => person.roleGroup === 'LEADER');
  const core = team.filter((person) => person.roleGroup !== 'LEADER');

  return (
    <Section>
      <PageIntro title="The team" intro="The people who plan the sessions, book the rooms and keep the group running." />
      <h2 className="text-lg font-semibold">Group Leader</h2>
      <div className={GRID}>
        {leaders.map((person) => (
          <TeamCard key={person.id} person={person} />
        ))}
      </div>
      <h2 className="mt-12 text-lg font-semibold">Core team</h2>
      <div className={GRID}>
        {core.map((person) => (
          <TeamCard key={person.id} person={person} />
        ))}
      </div>
    </Section>
  );
}
