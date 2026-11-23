import { z } from 'zod';
import { optionalText, requiredText } from './shared';

export const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address.'))
    .refine((value) => value.length <= 160, 'Email address is too long.'),
  name: z
    .string()
    .trim()
    .max(100, 'Keep your name to 100 characters.')
    .optional()
    .default('')
    .transform((value) => value || null),
  source: z
    .string()
    .trim()
    .max(40)
    .optional()
    .default('site')
    .transform((value) => value || 'site'),
  // Honeypot field: real visitors never see or fill this.
  website: z.string().optional().default(''),
});

export const adminSubscriberSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address.'))
    .refine((value) => value.length <= 160, 'Email address is too long.'),
  name: z.string().optional().default('').pipe(optionalText),
  status: z.enum(['SUBSCRIBED', 'UNSUBSCRIBED']),
});

export const newsletterCampaignSchema = z.object({
  subject: requiredText('Subject').refine((value) => value.length <= 140, 'Keep the subject to 140 characters.'),
  previewText: z
    .string()
    .optional()
    .default('')
    .pipe(optionalText)
    .refine((value) => !value || value.length <= 160, 'Keep the preview line to 160 characters.'),
  body: requiredText('Body').refine((value) => value.length <= 20_000, 'Keep the update to 20,000 characters.'),
});

/** Escapes RFC-4180 CSV values and neutralises leading formula triggers in spreadsheets. */
export function escapeCsvCell(value: string | null | undefined) {
  const raw = value ?? '';
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}
