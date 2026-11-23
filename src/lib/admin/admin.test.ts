import { describe, expect, it } from 'vitest';
import { parseForm } from './forms';
import {
  adminChangeError,
  authBaseUrlConfig,
  authUseSecureCookies,
  hasRole,
  isRole,
  normaliseEmail,
  SIGN_IN_ERRORS,
  signInMessage,
  withoutProviderTokens,
} from '@/lib/auth-rules';
import { isCleanCopy, hasNoDashOrEmoji } from '@/lib/copy-rules';
import { slugify } from '@/lib/slug';
import { eventSchema } from '@/lib/validation/event';
import { postSchema } from '@/lib/validation/post';
import { adminProjectSchema, MEMBER_WRITE_UP_MAX, memberProjectSchema } from '@/lib/validation/project';
import { settingsSchema } from '@/lib/validation/settings';
import { accraInputToDate, COPY_MESSAGE, dateToAccraInput } from '@/lib/validation/shared';
import { certificationSchema } from '@/lib/validation/certification';
import { adminSubscriberSchema, escapeCsvCell, newsletterCampaignSchema, subscribeSchema } from '@/lib/validation/newsletter';
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

  it('accepts only the two roles, whatever the browser sends', () => {
    expect(isRole('ADMIN')).toBe(true);
    expect(isRole('EDITOR')).toBe(true);
    expect(isRole('OWNER')).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});

describe('sign-in errors', () => {
  it('shows the message for a known code', () => {
    expect(signInMessage('DOMAIN')).toBe(SIGN_IN_ERRORS.DOMAIN);
  });

  it('falls back for codes it does not know, including inherited object names', () => {
    for (const code of ['state_mismatch', 'constructor', '__proto__', 'toString', 'hasOwnProperty']) {
      expect(signInMessage(code)).toBe('Sign in did not work. Try again.');
    }
  });

  it('shows nothing without a code', () => {
    expect(signInMessage(undefined)).toBeNull();
    expect(signInMessage('')).toBeNull();
  });
});

describe('google tokens', () => {
  it('clears every token and keeps the account binding', () => {
    const account = { providerId: 'google', accountId: 'sub', scope: 'openid', accessToken: 'a', refreshToken: 'r', idToken: 'i', accessTokenExpiresAt: new Date() };
    expect(withoutProviderTokens(account)).toEqual({ providerId: 'google', accountId: 'sub', scope: 'openid', accessToken: null, refreshToken: null, idToken: null, accessTokenExpiresAt: null, refreshTokenExpiresAt: null });
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

  it('accepts optional team social links and rejects invalid urls', () => {
    const valid = parseForm(teamSchema, form({
      name: 'Joel Anarba',
      role: 'Group Leader',
      roleGroup: 'LEADER',
      programme: 'BSc Computer Science',
      level: 'Level 300',
      linkedin: 'https://www.linkedin.com/in/joel',
      github: 'https://github.com/joel',
      xUrl: 'https://x.com/joel',
      instagram: 'https://instagram.com/joel',
    }));
    expect(valid.ok).toBe(true);
    const invalid = parseForm(teamSchema, form({
      name: 'Joel Anarba',
      role: 'Group Leader',
      roleGroup: 'LEADER',
      programme: '',
      level: '',
      linkedin: '',
      github: 'http://github.com/joel',
    }));
    expect(invalid.ok).toBe(false);
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

  it('rejects an end before the start, even for drafts', () => {
    expect(errorsFor({ ...event, status: 'DRAFT', endsAt: '2026-11-14T08:00' }).endsAt).toBeDefined();
  });

  it('accepts an end equal to the start, meaning no end time was published', () => {
    expect(errorsFor({ ...event, endsAt: event.startsAt }).endsAt).toBeUndefined();
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

describe('project write-ups', () => {
  const project = { title: 'Hostel Finder', summary: 'A static site on Amazon S3.', repoUrl: '', demoUrl: '', stack: 'Amazon S3', imageUrl: '' };
  const long = 'a'.repeat(MEMBER_WRITE_UP_MAX + 1);

  it('limits what a member can publish', () => {
    expect(memberProjectSchema.safeParse({ ...project, body: 'a'.repeat(MEMBER_WRITE_UP_MAX) }).success).toBe(true);
    expect(memberProjectSchema.safeParse({ ...project, body: long }).success).toBe(false);
  });

  it('leaves editors free to write a longer curated write-up', () => {
    expect(adminProjectSchema.safeParse({ ...project, body: long, slug: '', credits: '', status: 'DRAFT' }).success).toBe(true);
  });
});

describe('certifications', () => {
  const base = {
    memberName: 'Ama Mensah',
    programme: '',
    levelOfStudy: '',
    certName: 'AWS Certified Cloud Practitioner',
    certCode: '',
    certLevel: 'FOUNDATIONAL',
    pathway: '',
    credlyUrl: 'https://www.credly.com/badges/example-badge-id',
    earnedAt: '',
    status: 'PUBLISHED',
  };

  it('accepts minimal valid input with optional fields left blank', () => {
    const result = parseForm(certificationSchema, form(base));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.programme).toBeNull();
      expect(result.data.pathway).toBeNull();
      expect(result.data.earnedAt).toBeNull();
    }
  });

  it('accepts full details including AmaliTech pathway and earned date', () => {
    const result = parseForm(certificationSchema, form({
      ...base,
      programme: 'BSc Computer Science',
      levelOfStudy: 'Level 300',
      certCode: 'CLF-C02',
      pathway: 'AMALITECH',
      earnedAt: '2026-10-15',
    }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.pathway).toBe('AMALITECH');
      expect(result.data.earnedAt?.toISOString()).toBe('2026-10-15T00:00:00.000Z');
    }
  });

  it('rejects non-https Credly URLs and invalid dates', () => {
    const badUrl = parseForm(certificationSchema, form({ ...base, credlyUrl: 'http://www.credly.com/badges/123' }));
    expect(badUrl.ok).toBe(false);
    const badDate = parseForm(certificationSchema, form({ ...base, earnedAt: '2026-02-31' }));
    expect(badDate.ok).toBe(false);
  });

  it('rejects dashes and emojis in text fields', () => {
    const withDash = parseForm(certificationSchema, form({ ...base, certName: `Cloud ${EM_DASH} Practitioner` }));
    expect(withDash.ok).toBe(false);
    const withEmoji = parseForm(certificationSchema, form({ ...base, memberName: `Ama ${EMOJI}` }));
    expect(withEmoji.ok).toBe(false);
  });
});

describe('auth base URL and cookie config', () => {
  it('allows Amplify domains and localhost even when siteUrl is unset', () => {
    const config = authBaseUrlConfig(undefined);
    expect(config.allowedHosts).toContain('*.amplifyapp.com');
    expect(config.allowedHosts).toContain('localhost:*');
    expect(config.fallback).toBe('http://localhost:3000');
  });

  it('adds a configured custom domain and extra hosts without duplicating defaults', () => {
    const config = authBaseUrlConfig('https://awssbgucc.org/about', 'https://www.awssbgucc.org, preview.awssbgucc.org');
    expect(config.allowedHosts).toContain('awssbgucc.org');
    expect(config.allowedHosts).toContain('www.awssbgucc.org');
    expect(config.allowedHosts).toContain('preview.awssbgucc.org');
    expect(config.fallback).toBe('https://awssbgucc.org');
  });

  it('keeps HTTP cookies usable for local production e2e and enforces HTTPS cookies otherwise', () => {
    expect(authUseSecureCookies('http://localhost:3211', true)).toBe(false);
    expect(authUseSecureCookies('https://awssbgucc.org', false)).toBe(true);
    expect(authUseSecureCookies(undefined, true)).toBe(true);
    expect(authUseSecureCookies(undefined, false)).toBe(false);
  });
});

describe('newsletter validation and CSV export', () => {
  it('normalises emails and optional names on public subscribe', () => {
    const valid = subscribeSchema.safeParse({ email: '  AMA@ucc.edu.gh ', name: '  Ama ', source: 'home', website: '' });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe('ama@ucc.edu.gh');
      expect(valid.data.name).toBe('Ama');
    }
    expect(subscribeSchema.safeParse({ email: 'bad-email', name: '' }).success).toBe(false);
  });

  it('validates admin subscriber and campaign forms', () => {
    expect(parseForm(adminSubscriberSchema, form({ email: 'builder@ucc.edu.gh', name: 'Kwame', status: 'SUBSCRIBED' })).ok).toBe(true);
    expect(parseForm(adminSubscriberSchema, form({ email: 'builder@ucc.edu.gh', name: `Bad ${EMOJI}`, status: 'SUBSCRIBED' })).ok).toBe(false);

    expect(parseForm(newsletterCampaignSchema, form({ subject: 'Cloud session recap', previewText: 'Slides inside', body: 'Thanks for coming.' })).ok).toBe(true);
    expect(parseForm(newsletterCampaignSchema, form({ subject: `Recap ${EM_DASH} week 1`, previewText: '', body: 'Hello' })).ok).toBe(false);
  });

  it('neutralises spreadsheet formula triggers and quotes CSV cells properly', () => {
    expect(escapeCsvCell('ama@ucc.edu.gh')).toBe('ama@ucc.edu.gh');
    expect(escapeCsvCell('Mensah, Ama')).toBe('"Mensah, Ama"');
    expect(escapeCsvCell('=CMD("calc")')).toBe('"\'=CMD(""calc"")"');
    expect(escapeCsvCell('+233123')).toBe("'+233123");
    expect(escapeCsvCell('-1')).toBe("'-1");
    expect(escapeCsvCell('@evil')).toBe("'@evil");
  });
});
