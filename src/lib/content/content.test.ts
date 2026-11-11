import { describe, expect, it } from 'vitest';
import { adminUsers, partners as seedPartners, siteSettings as seedSettings, teamMembers } from '../../../prisma/seed-data';
import { findCopyIssues } from '@/lib/copy-rules';
import { countdown, dateParts, formatDate, formatTime, formatTimeRange } from '@/lib/format';
import { externalLabel, homeStats, initials, pastEvents, upcomingEvents } from './selectors';
import type { Event, Partner, SiteSettings } from './types';

function event(id: string, startsAt: string, endsAt: string): Event {
  return {
    id, slug: id, title: id, tag: 'TALK', format: 'ONLINE', startsAt: new Date(startsAt), endsAt: new Date(endsAt), venue: null,
    summary: '', body: '', meetupUrl: null, coverImage: null, photos: [], attendance: null, recapPostId: null, checkInCode: null, checkInOpensAt: null, checkInClosesAt: null, status: 'PUBLISHED',
    updatedBy: null, createdAt: new Date(0), updatedAt: new Date(0),
  };
}

const settings = { ...seedSettings, announcementText: null, announcementUrl: null, announcementActive: false, updatedBy: null, updatedAt: new Date(0) } as SiteSettings;
const campus = { type: 'CAMPUS' } as Partner;

const NOW = new Date('2026-11-01T12:00:00Z');
const past = event('past', '2026-10-17T16:30:00Z', '2026-10-17T18:00:00Z');
const soon = event('soon', '2026-11-14T09:30:00Z', '2026-11-14T13:00:00Z');
const later = event('later', '2026-12-01T09:30:00Z', '2026-12-01T13:00:00Z');

describe('format', () => {
  const start = new Date('2026-11-14T09:30:00Z');

  it('follows the Ghana conventions', () => {
    expect(formatDate(start)).toBe('Sat 14 Nov 2026');
    expect(formatTime(start)).toBe('9:30 AM');
    expect(formatTimeRange(start, new Date('2026-11-14T13:00:00Z'))).toBe('9:30 AM to 1:00 PM');
  });

  it('shows only the start when no end time was published', () => {
    expect(formatTimeRange(start, new Date(start))).toBe('9:30 AM');
  });

  it('splits a date for large layouts', () => {
    expect(dateParts(start)).toEqual({ weekday: 'Sat', day: '14', month: 'Nov', year: '2026' });
  });

  it('counts calendar days in Ghana time', () => {
    expect(countdown(start, new Date('2026-11-11T08:00:00Z'))).toBe('In 3 days');
    expect(countdown(start, new Date('2026-11-13T23:30:00Z'))).toBe('Tomorrow');
    expect(countdown(start, new Date('2026-11-14T00:10:00Z'))).toBe('Today');
    expect(countdown(start, new Date('2026-11-15T00:10:00Z'))).toBeNull();
  });

  it('renders in Africa/Accra, not the server zone', () => {
    expect(formatDate(new Date('2026-11-14T23:59:00Z'))).toBe('Sat 14 Nov 2026');
  });
});

describe('event selectors', () => {
  it('sorts upcoming soonest first', () => {
    expect(upcomingEvents([later, past, soon], NOW).map((e) => e.id)).toEqual(['soon', 'later']);
  });

  it('keeps an event upcoming until it ends', () => {
    expect(upcomingEvents([soon], new Date('2026-11-14T10:00:00Z'))).toHaveLength(1);
    expect(pastEvents([soon], new Date('2026-11-14T13:00:00Z'))).toHaveLength(1);
  });

  it('sorts past events most recent first', () => {
    expect(pastEvents([past, later, soon], new Date('2027-01-01T00:00:00Z')).map((e) => e.id)).toEqual(['later', 'soon', 'past']);
  });
});

describe('homeStats', () => {
  it('drops missing values and zero counts', () => {
    expect(homeStats(settings, [], [campus, campus], NOW)).toEqual([{ label: 'Partner associations', value: 2 }]);
  });

  it('counts only finished events', () => {
    expect(homeStats(settings, [past, soon], [], NOW)).toEqual([{ label: 'Events run', value: 1 }]);
  });

  it('counts campus partners only', () => {
    expect(homeStats(settings, [], [campus, { type: 'SPONSOR' } as Partner], NOW)).toEqual([{ label: 'Partner associations', value: 1 }]);
  });
});

describe('seed data', () => {
  it('seeds Joel as the one admin', () => {
    expect(adminUsers).toEqual([expect.objectContaining({ email: 'anarbajoel@gmail.com', role: 'ADMIN' })]);
  });

  it('keeps the gates and the team off until reviewed', () => {
    expect(seedSettings.scdPageEnabled).toBe(false);
    expect(seedSettings.uccCrestApproved).toBe(false);
    expect(teamMembers.every((person) => !person.active)).toBe(true);
    expect(seedPartners.find((p) => p.name === 'CANSSAG')?.status).toBe('DRAFT');
  });

  it('passes the copy rules', () => {
    expect(findCopyIssues(JSON.stringify({ teamMembers, seedPartners, seedSettings }))).toEqual([]);
  });
});

describe('externalLabel', () => {
  it('names known destinations', () => {
    expect(externalLabel('https://www.linkedin.com/pulse/x')).toBe('LinkedIn');
    expect(externalLabel('https://builder.aws.com/content/x')).toBe('AWS Builder Center');
    expect(externalLabel('https://example.org/x')).toBe('example.org');
  });
});

describe('initials', () => {
  it('uses the first and last names', () => {
    expect(initials('Joel Anarba Amuni')).toBe('JA');
    expect(initials('Cher')).toBe('C');
  });
});
