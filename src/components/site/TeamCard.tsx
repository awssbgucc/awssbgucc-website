import Image from 'next/image';
import { initials } from '@/lib/content/selectors';
import type { RoleGroup, TeamMember } from '@/lib/content/types';

const ROLE_COLOURS: Record<RoleGroup, string> = {
  LEADER: 'text-purple',
  TECHNICAL: 'text-cyan',
  EVENTS: 'text-lime',
  COMMUNITY: 'text-lavender',
};

export function TeamCard({ person }: { person: TeamMember }) {
  const details = [person.programme, person.level].filter(Boolean).join(', ');
  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-card-raised">
        {person.photoUrl ? (
          <Image
            src={person.photoUrl}
            alt={`${person.name}, ${person.role}`}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover grayscale-[15%] transition-[filter] duration-150 ease-brand hover:grayscale-0"
          />
        ) : (
          <span aria-hidden className="font-display text-3xl text-text-muted">
            {initials(person.name)}
          </span>
        )}
      </div>
      <p className={`mt-3 text-sm font-medium ${ROLE_COLOURS[person.roleGroup]}`}>{person.role}</p>
      <p className="font-semibold text-white">{person.name}</p>
      {details && <p className="text-sm font-medium text-text-muted">{details}</p>}
      {person.linkedin && (
        <a href={person.linkedin} className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted underline underline-offset-4">
          LinkedIn
        </a>
      )}
    </div>
  );
}
