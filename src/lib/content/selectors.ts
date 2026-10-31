import type { Event, Partner, PartnerType, Post, SiteSettings, TeamMember } from './types';

export function publishedEvents(events: Event[]) {
  return events.filter((event) => event.status === 'PUBLISHED');
}

/** Soonest first. An event stays upcoming until it ends. */
export function upcomingEvents(events: Event[], now: Date) {
  return publishedEvents(events)
    .filter((event) => event.endsAt > now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** Most recent first. */
export function pastEvents(events: Event[], now: Date) {
  return publishedEvents(events)
    .filter((event) => event.endsAt <= now)
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
}

export function activeTeam(team: TeamMember[]) {
  return team.filter((person) => person.active).sort((a, b) => a.order - b.order);
}

export function publishedPartners(partners: Partner[], type: PartnerType) {
  return partners.filter((p) => p.status === 'PUBLISHED' && p.type === type).sort((a, b) => a.order - b.order);
}

/** Newest first. A published post with no date sorts last. */
export function publishedPosts(posts: Post[]) {
  return posts
    .filter((post) => post.status === 'PUBLISHED')
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
}

/** Only real numbers render: a missing value, or a count of zero, drops the block. */
export function homeStats(settings: SiteSettings, events: Event[], partners: Partner[], now: Date) {
  const stats = [
    { label: 'Members on Meetup', value: settings.membersCount },
    { label: 'Events run', value: pastEvents(events, now).length },
    { label: 'Departments represented', value: settings.departmentsCount },
    { label: 'Partner associations', value: publishedPartners(partners, 'CAMPUS').length },
  ];
  return stats.filter((stat): stat is { label: string; value: number } => !!stat.value);
}

/** Where an external post was published, for its small label. */
export function externalLabel(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  if (host.endsWith('linkedin.com')) return 'LinkedIn';
  if (host.endsWith('builder.aws.com')) return 'AWS Builder Center';
  return host;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
