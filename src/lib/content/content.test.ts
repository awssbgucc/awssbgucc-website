import { describe, expect, it } from 'vitest';
import { formatDate, formatTime, formatTimeRange } from '@/lib/format';
import { findCopyIssues } from '@/lib/copy-rules';
import { activeTeam, homeStats, initials, pastEvents, publishedPartners, upcomingEvents } from './selectors';
import { partners, siteSettings, teamMembers } from './static';
import type { Event } from './types';

function event(id: string, startsAt: string, endsAt: string, status: Event['status'] = 'PUBLISHED'): Event {
  return {
    id, slug: id, title: id, tag: 'TALK', format: 'ONLINE', startsAt: new Date(startsAt), endsAt: new Date(endsAt), venue: null,
    summary: '', body: '', meetupUrl: null, coverImage: null, photos: [], attendance: null, recapPostId: null, status,
  };
}

const NOW = new Date('2026-11-01T12:00:00Z');
const past = event('past', '2026-10-17T16:30:00Z', '2026-10-17T18:00:00Z');
const soon = event('soon', '2026-11-14T09:30:00Z', '2026-11-14T13:00:00Z');
const later = event('later', '2026-12-01T09:30:00Z', '2026-12-01T13:00:00Z');
const draft = event('draft', '2026-11-02T09:30:00Z', '2026-11-02T13:00:00Z', 'DRAFT');

describe('format', () => {
  const start = new Date('2026-11-14T09:30:00Z');

  it('follows the Ghana conventions', () => {
    expect(formatDate(start)).toBe('Sat 14 Nov 2026');
    expect(formatTime(start)).toBe('9:30 AM');
    expect(formatTimeRange(start, new Date('2026-11-14T13:00:00Z'))).toBe('9:30 AM to 1:00 PM');
  });

  it('renders in Africa/Accra, not the server zone', () => {
    expect(formatDate(new Date('2026-11-14T23:59:00Z'))).toBe('Sat 14 Nov 2026');
  });
});

describe('event selectors', () => {
  const all = [later, past, draft, soon];

  it('sorts upcoming soonest first and leaves out drafts', () => {
    expect(upcomingEvents(all, NOW).map((e) => e.id)).toEqual(['soon', 'later']);
  });

  it('keeps an event upcoming until it ends', () => {
    expect(upcomingEvents([soon], new Date('2026-11-14T10:00:00Z'))).toHaveLength(1);
    expect(pastEvents([soon], new Date('2026-11-14T13:00:00Z'))).toHaveLength(1);
  });

  it('lists past events and leaves out drafts', () => {
    expect(pastEvents(all, new Date('2027-01-01T00:00:00Z')).map((e) => e.id)).toEqual(['later', 'soon', 'past']);
  });
});

describe('homeStats', () => {
  it('drops missing values and zero counts', () => {
    expect(homeStats(siteSettings, [], partners, NOW)).toEqual([{ label: 'Partner associations', value: 2 }]);
  });

  it('counts only finished published events', () => {
    const stats = homeStats(siteSettings, [past, soon, draft], [], NOW);
    expect(stats).toEqual([{ label: 'Events run', value: 1 }]);
  });
});

describe('static content', () => {
  it('keeps draft partners off the public list', () => {
    expect(publishedPartners(partners, 'CAMPUS').map((p) => p.name)).toEqual(['CITSA', 'AmaliTech Coding Club']);
  });

  it('orders the team with the Group Leader first', () => {
    expect(activeTeam(teamMembers)[0].role).toBe('Group Leader');
    expect(activeTeam(teamMembers)).toHaveLength(6);
  });

  it('passes the copy rules', () => {
    expect(findCopyIssues(JSON.stringify({ teamMembers, partners, siteSettings }))).toEqual([]);
  });
});

describe('initials', () => {
  it('uses the first and last names', () => {
    expect(initials('Joel Anarba Amuni')).toBe('JA');
    expect(initials('Cher')).toBe('C');
  });
});
