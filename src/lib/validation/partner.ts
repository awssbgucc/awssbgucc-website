import { z } from 'zod';
import { optionalHttpsUrl, optionalText, requiredText, status } from './shared';

export const partnerSchema = z.object({
  name: requiredText('Name'),
  type: z.enum(['CAMPUS', 'SPONSOR', 'COMMUNITY']),
  url: optionalHttpsUrl,
  description: optionalText,
  status,
});
