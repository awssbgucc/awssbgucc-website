import { z } from 'zod';
import { normaliseEmail } from '@/lib/auth-rules';
import { optionalText } from './shared';

export const roleSchema = z.enum(['ADMIN', 'EDITOR']);

export const userSchema = z.object({
  email: z.email('Use a valid email address.').transform(normaliseEmail),
  name: optionalText,
  role: roleSchema,
});
