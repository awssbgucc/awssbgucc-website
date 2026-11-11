'use server';

import { revalidatePath } from 'next/cache';
import type { FormState } from '@/lib/admin/forms';
import { requireMember } from '@/lib/member';
import { checkInWithCode, RuleError } from '@/lib/platform/engine';
import { withinLimit } from '@/lib/platform/records';

export type CheckInState = FormState & { result?: { title: string; xp: number; credits: number; duplicate: boolean } };

export async function checkIn(_state: CheckInState, formData: FormData): Promise<CheckInState> {
  const { user } = await requireMember();
  const event = String(formData.get('event') ?? '').trim();
  const code = String(formData.get('code') ?? '').trim();
  const values = { event, code };
  if (!event) return { errors: { event: 'Choose the session you are at.' }, values };
  if (!code) return { errors: { code: 'Enter the code shown in the room.' }, values };
  // Ten tries in ten minutes is plenty for typos, and stops anyone guessing codes.
  if (!(await withinLimit(`checkin:${user.id}`, 10, 10 * 60 * 1000))) {
    return { message: 'Too many attempts. Wait ten minutes, or ask an organiser to add you.', values };
  }
  try {
    const result = await checkInWithCode(user.id, event, code);
    revalidatePath('/builder', 'layout');
    if (result.status === 'duplicate') return { result: { title: result.eventTitle, xp: 0, credits: 0, duplicate: true } };
    return { result: { title: result.eventTitle, xp: result.xp, credits: result.credits, duplicate: false } };
  } catch (error) {
    if (error instanceof RuleError) return { message: error.message, values };
    throw error;
  }
}
