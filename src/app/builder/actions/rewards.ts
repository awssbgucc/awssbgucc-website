'use server';

import { revalidatePath } from 'next/cache';
import { requireMember } from '@/lib/member';
import { redeem, RuleError } from '@/lib/platform/engine';
import { withinLimit } from '@/lib/platform/records';

export type RedeemState = { message?: string; ok?: boolean };

export async function redeemReward(rewardId: string): Promise<RedeemState> {
  const { user } = await requireMember();
  if (!(await withinLimit(`redeem:${user.id}`, 20, 60 * 60 * 1000))) return { message: 'Too many attempts. Try again later.' };
  try {
    await redeem(user.id, rewardId);
  } catch (error) {
    if (error instanceof RuleError) return { message: error.message };
    throw error;
  }
  revalidatePath('/builder', 'layout');
  return { ok: true };
}
