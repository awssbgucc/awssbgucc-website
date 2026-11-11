'use server';

import { redirect } from 'next/navigation';
import { parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { reviewSubmission, RuleError } from '@/lib/platform/engine';
import { reviewSchema } from '@/lib/validation/platform';

export async function review(submissionId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole();
  const parsed = parseForm(reviewSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (parsed.data.status !== 'APPROVED' && !parsed.data.feedback) {
    return { errors: { feedback: 'Say what to change, so the member can act on it.' }, values: { status: parsed.data.status } };
  }
  try {
    await reviewSubmission(submissionId, parsed.data, admin.email);
  } catch (error) {
    if (error instanceof RuleError) return { message: error.message };
    throw error;
  }
  redirect('/admin/submissions');
}
