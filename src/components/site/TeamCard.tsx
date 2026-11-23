import Image from 'next/image';
import { initials } from '@/lib/content/selectors';
import type { RoleGroup, TeamMember } from '@/lib/content/types';
import { SocialIcon, type SocialKind } from './SocialIcons';

const TONE: Record<RoleGroup, string> = { LEADER: 'purple', TECHNICAL: 'blue', EVENTS: 'mint', COMMUNITY: 'magenta' };

/** Portrait when one was supplied; otherwise initials on the role colour, which never pretends to be a photo. */
export function TeamCard({ person }: { person: TeamMember }) {
  const tone = TONE[person.roleGroup];
  const links: { kind: SocialKind; href: string; label: string }[] = [
    ...(person.linkedin ? [{ kind: 'linkedin' as const, href: person.linkedin, label: 'LinkedIn' }] : []),
    ...(person.github ? [{ kind: 'github' as const, href: person.github, label: 'GitHub' }] : []),
    ...(person.xUrl ? [{ kind: 'x' as const, href: person.xUrl, label: 'X' }] : []),
    ...(person.instagram ? [{ kind: 'instagram' as const, href: person.instagram, label: 'Instagram' }] : []),
  ];

  return (
    <article className="team-person">
      <div className={`team-portrait ${person.photoUrl ? '' : `block-${tone}`}`}>
        {person.photoUrl ? (
          <Image src={person.photoUrl} alt={`${person.name}, ${person.role}`} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <span className="team-initials" aria-hidden="true">{initials(person.name)}</span>
        )}
      </div>
      <p className="type-label team-role"><span className={`swatch swatch-${tone}`} aria-hidden="true" />{person.role}</p>
      <h3>{person.name}</h3>
      {(person.programme || person.level) && <p className="text-sm text-text-muted">{[person.programme, person.level].filter(Boolean).join(', ')}</p>}
      {links.length > 0 && (
        <ul className="team-socials" aria-label={`${person.name} social links`}>
          {links.map(({ kind, href, label }) => (
            <li key={kind}>
              <a href={href} aria-label={label} title={label} target="_blank" rel="noopener noreferrer" className="team-social-link">
                <SocialIcon kind={kind} size={16} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
