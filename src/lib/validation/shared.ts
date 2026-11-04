import { z } from 'zod';
import { hasNoDashOrEmoji } from '@/lib/copy-rules';
import { slugify } from '@/lib/slug';

export const COPY_MESSAGE = 'Remove the dash or emoji in this field. Use a comma, colon or full stop instead.';

const clean = (schema: z.ZodString) => schema.trim().refine(hasNoDashOrEmoji, COPY_MESSAGE);

export const requiredText = (label: string) => clean(z.string().min(1, `${label} is required.`));

/** Empty inputs become null, matching the optional database columns. */
export const optionalText = clean(z.string()).transform((value) => value || null);

const isHttps = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

export const optionalHttpsUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || isHttps(value), 'Use a full link starting with https://')
  .transform((value) => value || null);

export const requiredHttpsUrl = z.string().trim().refine(isHttps, 'Use a full link starting with https://');

export const status = z.enum(['DRAFT', 'PUBLISHED']);

export const checkbox = z.string().optional().transform((value) => value === 'on');

export const optionalCount = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d+$/.test(value), 'Use a whole number.')
  .transform((value) => (value === '' ? null : Number(value)));

/** An empty slug is generated from the title. Call after the title is known. */
export function resolveSlug(slug: string, title: string) {
  return slugify(slug || title);
}

/** Accra is on GMT all year, with no daylight saving, so a local input is the same as UTC. */
export function accraInputToDate(value: string) {
  return new Date(`${value}Z`);
}

export function dateToAccraInput(date: Date) {
  return date.toISOString().slice(0, 16);
}

export const dateTimeInput = (label: string) =>
  z
    .string()
    .refine((value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value), `${label} is required.`)
    .transform(accraInputToDate);
