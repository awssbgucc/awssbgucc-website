import { z } from 'zod';
import { isRecordId, UPLOAD_FOLDERS } from '@/lib/uploads/rules';

export const uploadRequestSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS),
  recordId: z.string().refine(isRecordId),
  type: z.string(),
  size: z.number(),
});
