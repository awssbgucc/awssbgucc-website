'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { cancelRedemption, fulfilRedemption, RuleError } from '@/lib/platform/engine';
import { audit } from '@/lib/platform/records';
import { rewardSchema } from '@/lib/validation/platform';

export async function saveReward(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole('ADMIN');
  const parsed = parseForm(rewardSchema, formData);
  if (!parsed.ok) return parsed.state;
  const data = { ...parsed.data, updatedBy: admin.email };
  try {
    if (id) await db.reward.update({ where: { id }, data });
    else await db.reward.create({ data });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return { errors: { slug: 'Another reward already uses this slug.' }, values: formValues(formData) };
  }
  await audit(admin.email, id ? 'reward.update' : 'reward.create', 'Reward', id ?? data.slug, `${data.name}, ${data.cost} credits, ${data.available ? 'available' : 'off'}`);
  redirect('/admin/rewards');
}

export async function handOver(redemptionId: string) {
  const admin = await requireRole('ADMIN');
  try {
    await fulfilRedemption(redemptionId, admin.email);
  } catch (error) {
    if (!(error instanceof RuleError)) throw error;
  }
  revalidatePath('/admin/rewards');
}

export async function refund(redemptionId: string) {
  const admin = await requireRole('ADMIN');
  try {
    await cancelRedemption(redemptionId, admin.email, 'Cancelled by an admin');
  } catch (error) {
    if (!(error instanceof RuleError)) throw error;
  }
  revalidatePath('/admin/rewards');
}
