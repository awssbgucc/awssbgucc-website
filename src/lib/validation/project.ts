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

export const memberProjectSchema = z.object({
  title: requiredText('Title').refine((value) => value.length <= 80, 'Keep the title to 80 characters.'),
  summary: requiredText('Summary').refine((value) => value.length <= 200, 'Keep the summary to 200 characters.'),
  body: optionalText,
  repoUrl: optionalHttpsUrl,
  demoUrl: optionalHttpsUrl,
  stack: stackList,
  imageUrl: optionalImageUrl,
});

export const adminProjectSchema = memberProjectSchema.extend({
  slug: z.string().trim(),
  credits: optionalText,
  featured: checkbox,
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']),
});
