import { z } from 'zod';
import { checkbox, optionalHttpsUrl, optionalImageUrl, optionalText, requiredText } from './shared';

export const teamSchema = z.object({
  name: requiredText('Name'),
  role: requiredText('Role'),
  roleGroup: z.enum(['LEADER', 'TECHNICAL', 'EVENTS', 'COMMUNITY']),
  programme: optionalText,
  level: optionalText,
  linkedin: optionalHttpsUrl,
  photoUrl: optionalImageUrl,
  active: checkbox,
});
