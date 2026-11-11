import { z } from 'zod';
import { dateTimeInput, optionalCount, optionalHttpsUrl, optionalImageUrl, optionalText, requiredText, resolveSlug, status } from './shared';

export const eventSchema = z
  .object({
    title: requiredText('Title'),
    slug: z.string().trim(),
    tag: z.enum(['BOOTCAMP', 'BUILD', 'TALK', 'NETWORKING', 'COMMUNITY_DAY']),
    format: z.enum(['IN_PERSON', 'ONLINE']),
    startsAt: dateTimeInput('Start'),
    endsAt: dateTimeInput('End'),
    venue: optionalText,
    summary: optionalText.refine((value) => !value || value.length <= 200, 'Keep the summary to 200 characters.'),
    body: optionalText,
    meetupUrl: optionalHttpsUrl,
    coverImage: optionalImageUrl,
    attendance: optionalCount,
    status,
  })
  .superRefine((event, ctx) => {
    const fail = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (event.endsAt < event.startsAt) fail('endsAt', 'The end cannot be before the start.');
    if (event.status !== 'PUBLISHED') return;
    if (!event.meetupUrl) fail('meetupUrl', 'Add the Meetup link before publishing.');
    if (event.format === 'IN_PERSON' && !event.venue) fail('venue', 'Add the venue before publishing an in-person event.');
    if (!event.summary) fail('summary', 'Add a summary before publishing.');
    if (!event.body) fail('body', 'Add the body before publishing.');
  })
  .transform((event) => ({
    ...event,
    slug: resolveSlug(event.slug, event.title),
    summary: event.summary ?? '',
    body: event.body ?? '',
  }));
