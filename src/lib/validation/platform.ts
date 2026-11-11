import { z } from 'zod';
import { OPTIONS } from '@/lib/platform/customise';
import { checkbox, dateTimeInput, optionalHttpsUrl, optionalText, requiredHttpsUrl, requiredText, resolveSlug, status } from './shared';

const wholeNumber = (label: string, { min = 0, max = 100_000 } = {}) =>
  z
    .string()
    .trim()
    .refine((value) => /^-?\d+$/.test(value), `${label} must be a whole number.`)
    .transform(Number)
    .refine((value) => value >= min && value <= max, `${label} must be between ${min} and ${max}.`);

const optionalWholeNumber = (label: string, { min = 0, max = 100_000 } = {}) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^-?\d+$/.test(value), `${label} must be a whole number.`)
    .transform((value) => (value === '' ? null : Number(value)))
    .refine((value) => value === null || (value >= min && value <= max), `${label} must be between ${min} and ${max}.`);

const optionalDateTime = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value), 'Use the date picker.')
  .transform((value) => (value === '' ? null : new Date(`${value}Z`)));

export const challengeSchema = z
  .object({
    title: requiredText('Title'),
    slug: z.string().trim(),
    summary: requiredText('Summary').refine((value) => value.length <= 200, 'Keep the summary to 200 characters.'),
    brief: requiredText('Brief'),
    requirements: requiredText('Requirements'),
    rules: optionalText,
    startsAt: dateTimeInput('Start'),
    endsAt: dateTimeInput('Deadline'),
    status,
    xp: optionalWholeNumber('XP', { max: 2000 }),
    credits: optionalWholeNumber('Credits', { max: 1000 }),
    maxScore: wholeNumber('Maximum score', { min: 1, max: 1000 }),
    leaderboardEnabled: checkbox,
    eventId: z.string().trim().transform((value) => value || null),
  })
  .superRefine((c, ctx) => {
    if (c.endsAt <= c.startsAt) ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'The deadline must be after the start.' });
  })
  .transform((c) => ({ ...c, slug: resolveSlug(c.slug, c.title) }));

export const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']),
  score: optionalWholeNumber('Score', { max: 1000 }),
  feedback: optionalText,
});

export const announcementSchema = z.object({
  title: requiredText('Title'),
  body: requiredText('Text').refine((value) => value.length <= 600, 'Keep it to 600 characters.'),
  href: optionalHttpsUrl,
  status,
  expiresAt: optionalDateTime,
});

export const achievementSchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => /^[a-z0-9-]{3,40}$/.test(value), 'Use 3 to 40 lowercase letters, numbers or hyphens.'),
  title: requiredText('Title'),
  description: requiredText('Description'),
  criterion: z.enum(['SESSIONS_ATTENDED', 'SESSION_STREAK', 'SUBMISSIONS_APPROVED', 'PROJECTS_APPROVED', 'REFERRALS']),
  threshold: wholeNumber('Threshold', { min: 1, max: 1000 }),
  xp: wholeNumber('XP', { max: 2000 }),
  credits: wholeNumber('Credits', { max: 1000 }),
  active: checkbox,
});

export const ruleSchema = z.object({
  xp: wholeNumber('XP', { max: 2000 }),
  credits: wholeNumber('Credits', { max: 1000 }),
  active: checkbox,
  description: requiredText('Description'),
});

const DIGITAL = ['BANNER', 'ACCENT', 'FRAME', 'TITLE'] as const;

export const rewardSchema = z
  .object({
    name: requiredText('Name'),
    slug: z.string().trim(),
    description: requiredText('Description'),
    kind: z.enum(['BANNER', 'ACCENT', 'FRAME', 'TITLE', 'PHYSICAL', 'OTHER']),
    value: z.string().trim().transform((value) => value || null),
    cost: wholeNumber('Cost', { min: 1, max: 100_000 }),
    stock: optionalWholeNumber('Stock', { max: 100_000 }),
    perMemberLimit: wholeNumber('Limit per member', { min: 1, max: 100 }),
    available: checkbox,
  })
  .superRefine((r, ctx) => {
    const digital = (DIGITAL as readonly string[]).includes(r.kind);
    if (digital && !OPTIONS[r.kind as (typeof DIGITAL)[number]].some((o) => o.key === r.value)) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Choose which item this gives.' });
    }
    if (!digital && r.value) ctx.addIssue({ code: 'custom', path: ['value'], message: 'Only digital rewards give an item. Leave this empty.' });
  })
  .transform((r) => ({ ...r, slug: resolveSlug(r.slug, r.name) }));

export const resourceSchema = z.object({
  label: requiredText('Label'),
  url: requiredHttpsUrl,
  kind: z.enum(['SLIDES', 'REPO', 'LAB', 'RECORDING', 'DOCS', 'OTHER']),
  access: z.enum(['PUBLIC', 'MEMBERS']),
});

export const adjustSchema = z
  .object({
    xp: wholeNumber('XP', { min: -10_000, max: 10_000 }),
    credits: wholeNumber('Credits', { min: -10_000, max: 10_000 }),
    note: requiredText('Reason'),
  })
  .refine((a) => a.xp !== 0 || a.credits !== 0, { path: ['xp'], message: 'Change XP, credits or both.' });

export const checkInWindowSchema = z
  .object({ opensAt: dateTimeInput('Opens'), closesAt: dateTimeInput('Closes') })
  .refine((w) => w.closesAt > w.opensAt, { path: ['closesAt'], message: 'Check-in must close after it opens.' });

export const scdSessionSchema = z.object({
  title: requiredText('Title'),
  startsAt: dateTimeInput('Start'),
  endsAt: optionalDateTime,
  speaker: optionalText,
  room: optionalText,
});

export const scdSpeakerSchema = z.object({
  name: requiredText('Name'),
  role: requiredText('Role'),
  org: optionalText,
  linkedin: optionalHttpsUrl,
  status,
});

export const scdFaqSchema = z.object({ question: requiredText('Question'), answer: requiredText('Answer') });
