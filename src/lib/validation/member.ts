import { z } from 'zod';
import { INTERESTS } from '@/lib/platform/customise';
import { handleError } from '@/lib/platform/rules';
import { checkbox, optionalText, requiredText } from './shared';

const hostUrl = (hosts: string[], message: string) =>
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true;
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && hosts.includes(url.hostname.replace(/^www\./, ''));
      } catch {
        return false;
      }
    }, message)
    .transform((value) => value || null);

export const githubUrl = hostUrl(['github.com'], 'Use your GitHub link, starting with https://github.com/');
export const linkedinUrl = hostUrl(['linkedin.com'], 'Use your LinkedIn link, starting with https://www.linkedin.com/');

const short = (max: number, label: string) => optionalText.refine((value) => !value || value.length <= max, `Keep ${label} to ${max} characters.`);

export const profileFields = {
  displayName: requiredText('Your name').refine((value) => value.length <= 60, 'Keep your name to 60 characters.'),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .superRefine((value, ctx) => {
      const error = handleError(value);
      if (error) ctx.addIssue({ code: 'custom', message: error });
    }),
  programme: short(80, 'the programme'),
  level: short(30, 'the level'),
  department: short(80, 'the department'),
  bio: short(280, 'the bio'),
  githubUrl,
  linkedinUrl,
};

export const visibility = z.enum(['PRIVATE', 'MEMBERS', 'PUBLIC']);

/** Interests come from the form as one value per ticked box. Unknown values are dropped. */
export function readInterests(formData: FormData) {
  const allowed = new Set<string>(INTERESTS);
  return [...new Set(formData.getAll('interests').filter((value): value is string => typeof value === 'string' && allowed.has(value)))].slice(0, 6);
}

export const onboardingSchema = z.object({
  ...profileFields,
  visibility,
  showOnLeaderboards: checkbox,
  referralCode: z.string().trim().max(20).optional().transform((value) => value || null),
});

export const PRIVACY_REQUIRED = 'Read and accept the privacy notice to continue.';

export const profileSchema = z.object({
  ...profileFields,
  visibility,
  showOnLeaderboards: checkbox,
  allowIndexing: checkbox,
});
