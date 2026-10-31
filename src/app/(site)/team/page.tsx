import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/PageIntro';
import { TeamCard } from '@/components/site/TeamCard';
import { Section } from '@/components/ui/Section';
import { getTeam } from '@/lib/content/queries';
import type { TeamMember } from '@/lib/content/types';

export const metadata: Metadata = { title: 'The team' };

function Group({ title, people }: { title: string; people: TeamMember[] }) {
  if (people.length === 0) return null;
  return (
    <div className="mt-12 first:mt-0">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {people.map((person) => (
          <TeamCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <Section>
      <PageIntro title="The team" intro="The people who plan the sessions, book the rooms and keep the group running." />
      <Group title="Group Leader" people={team.filter((person) => person.roleGroup === 'LEADER')} />
      <Group title="Core team" people={team.filter((person) => person.roleGroup !== 'LEADER')} />
    </Section>
  );
}
