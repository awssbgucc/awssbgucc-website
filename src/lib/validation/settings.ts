import { z } from 'zod';
import { checkbox, optionalCount, optionalHttpsUrl, optionalText, requiredHttpsUrl } from './shared';

const domainList = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => value === '' || value.split(',').every((d) => /^@?[a-z0-9.-]+\.[a-z]{2,}$/.test(d.trim())), 'Use domains separated by commas, for example ucc.edu.gh')
  .transform((value) => value || null);

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value), 'Use the date picker.')
  .transform((value) => (value === '' ? null : new Date(`${value}Z`)));

export const settingsSchema = z
  .object({
    email: z.email('Use a valid email address.'),
    meetupUrl: requiredHttpsUrl,
    whatsappUrl: optionalHttpsUrl,
    builderCenterUrl: requiredHttpsUrl,
    linkedinUrl: optionalHttpsUrl,
    instagramUrl: optionalHttpsUrl,
    xUrl: optionalHttpsUrl,
    membersCount: optionalCount,
    departmentsCount: optionalCount,
    announcementText: optionalText,
    announcementUrl: optionalHttpsUrl,
    announcementActive: checkbox,
    uccCrestApproved: checkbox,
    memberEmailDomains: domainList,
    scdPageEnabled: checkbox,
    scdDate: optionalDate,
    scdVenue: optionalText,
    scdMapUrl: optionalHttpsUrl,
    scdRegisterUrl: optionalHttpsUrl,
  })
  .superRefine((settings, ctx) => {
    if (settings.announcementActive && !settings.announcementText) {
      ctx.addIssue({ code: 'custom', path: ['announcementText'], message: 'Add the text before switching the bar on.' });
    }
    if (settings.scdPageEnabled && (!settings.scdDate || !settings.scdVenue)) {
      ctx.addIssue({ code: 'custom', path: ['scdPageEnabled'], message: 'Add the confirmed date and venue before switching the page on.' });
    }
  });
