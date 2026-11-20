import { z } from 'zod';
import { hasNoDashOrEmoji } from '@/lib/copy-rules';
import { checkbox, COPY_MESSAGE, optionalHttpsUrl, optionalImageUrl, optionalText, requiredText } from './shared';

/** "Amazon S3, AWS Lambda" becomes two entries. At most eight, each short. */
export const stackList = z
  .string()
  .optional()
  .transform((value) =>
    [...new Set((value ?? '').split(',').map((item) => item.trim()).filter(Boolean))].slice(0, 8),
  )
  .refine((items) => items.every((item) => item.length <= 30), 'Keep each item to 30 characters.')
  .refine((items) => items.every(hasNoDashOrEmoji), COPY_MESSAGE);

export const MEMBER_WRITE_UP_MAX = 5000;

const projectFields = {
  title: requiredText('Title').refine((value) => value.length <= 80, 'Keep the title to 80 characters.'),
  summary: requiredText('Summary').refine((value) => value.length <= 200, 'Keep the summary to 200 characters.'),
  body: optionalText,
  repoUrl: optionalHttpsUrl,
  demoUrl: optionalHttpsUrl,
  stack: stackList,
  imageUrl: optionalImageUrl,
};

// A member's write-up goes public after review, so it is limited. Editors' curated write-ups are not.
export const memberProjectSchema = z.object({
  ...projectFields,
  body: projectFields.body.refine((value) => !value || value.length <= MEMBER_WRITE_UP_MAX, 'Keep the write-up to 5,000 characters.'),
});

export const adminProjectSchema = z.object(projectFields).extend({
  slug: z.string().trim(),
  credits: optionalText,
  featured: checkbox,
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']),
});
