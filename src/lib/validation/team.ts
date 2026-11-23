import { z } from 'zod';
import { checkbox, optionalHttpsUrl, optionalImageUrl, optionalText, requiredText } from './shared';

const optionalSocialUrl = z.string().optional().default('').pipe(optionalHttpsUrl);

export const teamSchema = z.object({
  name: requiredText('Name'),
  role: requiredText('Role'),
  roleGroup: z.enum(['LEADER', 'TECHNICAL', 'EVENTS', 'COMMUNITY']),
  programme: optionalText,
  level: optionalText,
  linkedin: optionalHttpsUrl,
  github: optionalSocialUrl,
  xUrl: optionalSocialUrl,
  instagram: optionalSocialUrl,
  photoUrl: optionalImageUrl,
  active: checkbox,
});
