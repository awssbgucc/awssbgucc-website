import { describe, expect, it } from 'vitest';
import { parseForm } from './forms';
import { adminChangeError, hasRole, normaliseEmail } from '@/lib/auth-rules';
import { isCleanCopy, hasNoDashOrEmoji } from '@/lib/copy-rules';
import { slugify } from '@/lib/slug';
import { eventSchema } from '@/lib/validation/event';
import { postSchema } from '@/lib/validation/post';
import { settingsSchema } from '@/lib/validation/settings';
import { accraInputToDate, COPY_MESSAGE, dateToAccraInput } from '@/lib/validation/shared';
import { teamSchema } from '@/lib/validation/team';

const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const EMOJI = String.fromCodePoint(0x1f680);

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

const event = {
  title: 'Intro to Amazon S3',
  slug: '',
  tag: 'TALK',
  format: 'IN_PERSON',
  startsAt: '2026-11-14T09:30',
  endsAt: '2026-11-14T13:00',
  venue: 'LT5',
  summary: 'A short summary.',
  body: 'The body.',
  meetupUrl: 'https://www.meetup.com/x',
  attendance: '',
  status: 'PUBLISHED',
};

const errorsFor = (values: Record<string, string>) => {
  const result = parseForm(eventSchema, form(values));
  return result.ok ? {} : result.state.errors;
};

describe('role checks', () => {
  it('lets any admin user in when no role is listed', () => {
    expect(hasRole('EDITOR', [])).toBe(true);
  });

  it('keeps editors out of admin-only areas', () => {
    expect(hasRole('EDITOR', ['ADMIN'])).toBe(false);
    expect(hasRole('ADMIN', ['ADMIN'])).toBe(true);
  });

  it('matches emails regardless of case', () => {
    expect(normaliseEmail(' Joel@Gmail.com ')).toBe('joel@gmail.com');
  });
});

describe('admin changes', () => {
  const base = { actorEmail: 'a@x.com', targetEmail: 'b@x.com', targetRole: 'ADMIN' as const, nextRole: null, adminCount: 2 };

  it('allows removing another admin when one remains', () => {
    expect(adminChangeError(base)).toBeNull();
  });

  it('stops you removing yourself', () => {
    expect(adminChangeError({ ...base, targetEmail: 'A@x.com' })).toContain('your own');
  });

  it('stops the last admin being removed or demoted', () => {
    expect(adminChangeError({ ...base, adminCount: 1 })).toContain('at least one');
    expect(adminChangeError({ ...base, adminCount: 1, nextRole: 'EDITOR' })).toContain('at least one');
  });

  it('allows the last admin to stay an admin', () => {
    expect(adminChangeError({ ...base, adminCount: 1, nextRole: 'ADMIN' })).toBeNull();
  });
});

describe('copy rules on save', () => {
  it.each([EM_DASH, EN_DASH, EMOJI])('rejects %s with the agreed message', (bad) => {
    expect(errorsFor({ ...event, title: `Intro ${bad} S3` }).title).toBe(COPY_MESSAGE);
  });

  it('allows a banned phrase in admin text, which only our own copy check rejects', () => {
    // check-copy:off
    expect(hasNoDashOrEmoji('How to unlock an S3 object')).toBe(true);
    expect(isCleanCopy('How to unlock an S3 object')).toBe(false);
    // check-copy:on
  });

  it('allows legal marks and plain hyphens', () => {
    expect(hasNoDashOrEmoji('© 2026 hands-on')).toBe(true);
  });

  it('applies to other forms too', () => {
    const result = parseForm(teamSchema, form({ name: `Joel ${EMOJI}`, role: 'Lead', roleGroup: 'LEADER', programme: '', level: '', linkedin: '' }));
    expect(result.ok).toBe(false);
  });
});

describe('event publish rules', () => {
  it('accepts a complete event', () => {
    expect(errorsFor(event)).toEqual({});
  });

  it('needs a Meetup link to publish', () => {
    expect(errorsFor({ ...event, meetupUrl: '' }).meetupUrl).toBeDefined();
  });

  it('needs a venue to publish in person, but not online', () => {
    expect(errorsFor({ ...event, venue: '' }).venue).toBeDefined();
    expect(errorsFor({ ...event, venue: '', format: 'ONLINE' }).venue).toBeUndefined();
  });

  it('lets a draft save without them', () => {
    expect(errorsFor({ ...event, status: 'DRAFT', meetupUrl: '', venue: '', summary: '', body: '' })).toEqual({});
  });

  it('needs the end after the start, even for drafts', () => {
    expect(errorsFor({ ...event, status: 'DRAFT', endsAt: event.startsAt }).endsAt).toBeDefined();
  });

  it('rejects http links and long summaries', () => {
    expect(errorsFor({ ...event, meetupUrl: 'http://www.meetup.com/x' }).meetupUrl).toBeDefined();
    expect(errorsFor({ ...event, summary: 'x'.repeat(201) }).summary).toBeDefined();
  });
});

describe('dates', () => {
  it('stores Accra input as the same UTC time, and reads it back', () => {
    const date = accraInputToDate('2026-11-14T09:30');
    expect(date.toISOString()).toBe('2026-11-14T09:30:00.000Z');
    expect(dateToAccraInput(date)).toBe('2026-11-14T09:30');
  });
});

describe('slugs', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Intro to Amazon S3!')).toBe('intro-to-amazon-s3');
    expect(slugify('  From Code -- to Cloud  ')).toBe('from-code-to-cloud');
    expect(slugify('Café Día')).toBe('cafe-dia');
  });

  it('generates from the title, and keeps an edited slug', () => {
    const generated = parseForm(eventSchema, form(event));
    expect(generated.ok && generated.data.slug).toBe('intro-to-amazon-s3');
    const edited = parseForm(eventSchema, form({ ...event, slug: 'S3 Basics' }));
    expect(edited.ok && edited.data.slug).toBe('s3-basics');
  });
});

describe('posts', () => {
  const post = { title: 'T', slug: '', excerpt: 'E', author: 'A', body: 'B', externalUrl: '', status: 'PUBLISHED' };

  it('needs a body or a link to publish', () => {
    expect(parseForm(postSchema, form({ ...post, body: '' })).ok).toBe(false);
    expect(parseForm(postSchema, form({ ...post, body: '', externalUrl: 'https://www.linkedin.com/x' })).ok).toBe(true);
  });

  it('drops the body when the post links out', () => {
    const result = parseForm(postSchema, form({ ...post, externalUrl: 'https://www.linkedin.com/x' }));
    expect(result.ok && result.data.body).toBeNull();
  });
});

describe('settings', () => {
  const settings = {
    email: 'a@x.com', meetupUrl: 'https://m.com', whatsappUrl: '', builderCenterUrl: 'https://b.com', linkedinUrl: '', instagramUrl: '',
    xUrl: '', membersCount: '', departmentsCount: '', announcementText: '', announcementUrl: '',
  };

  it('treats an unticked checkbox as off', () => {
    const result = parseForm(settingsSchema, form(settings));
    expect(result.ok && result.data.uccCrestApproved).toBe(false);
  });

  it('needs text before the announcement bar goes on', () => {
    expect(parseForm(settingsSchema, form({ ...settings, announcementActive: 'on' })).ok).toBe(false);
  });
});
