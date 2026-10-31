import type { Event, Partner, SiteSettings } from './types';

// These take records already filtered to published ones by queries.ts.

/** Soonest first. An event stays upcoming until it ends. */
export function upcomingEvents(events: Event[], now: Date) {
  return events.filter((event) => event.endsAt > now).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** Most recent first. */
export function pastEvents(events: Event[], now: Date) {
  return events.filter((event) => event.endsAt <= now).sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
}

/** Only real numbers render: a missing value, or a count of zero, drops the block. */
export function homeStats(settings: SiteSettings, events: Event[], partners: Partner[], now: Date) {
  const stats = [
    { label: 'Members on Meetup', value: settings.membersCount },
    { label: 'Events run', value: pastEvents(events, now).length },
    { label: 'Departments represented', value: settings.departmentsCount },
    { label: 'Partner associations', value: partners.filter((partner) => partner.type === 'CAMPUS').length },
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
