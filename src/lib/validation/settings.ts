import { z } from 'zod';
import { checkbox, optionalCount, optionalHttpsUrl, optionalText, requiredHttpsUrl } from './shared';

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
  })
  .superRefine((settings, ctx) => {
    if (settings.announcementActive && !settings.announcementText) {
      ctx.addIssue({ code: 'custom', path: ['announcementText'], message: 'Add the text before switching the bar on.' });
    }
  });
