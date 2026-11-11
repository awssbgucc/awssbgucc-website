'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, isUniqueError, parseForm, type FormState } from '@/lib/admin/forms';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { evaluateAchievements } from '@/lib/platform/engine';
import { audit } from '@/lib/platform/records';
import { achievementSchema, ruleSchema } from '@/lib/validation/platform';

export async function saveAchievement(id: string | null, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole('ADMIN');
  const parsed = parseForm(achievementSchema, formData);
  if (!parsed.ok) return parsed.state;
  const data = { ...parsed.data, updatedBy: admin.email };
  try {
    if (id) await db.achievement.update({ where: { id }, data });
    else await db.achievement.create({ data: { ...data, order: ((await db.achievement.aggregate({ _max: { order: true } }))._max.order ?? 0) + 1 } });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    return { errors: { code: 'Another achievement uses this code.' }, values: formValues(formData) };
  }
  await audit(admin.email, id ? 'achievement.update' : 'achievement.create', 'Achievement', id ?? data.code, `${data.title}: ${data.criterion} ${data.threshold}`);
  redirect('/admin/achievements');
}

/** Gives a new or changed achievement to members who already qualify. Safe to run more than once. */
export async function awardQualifyingMembers() {
  const admin = await requireRole('ADMIN');
  const members = await db.memberProfile.findMany({ where: { status: 'ACTIVE', onboardedAt: { not: null } }, select: { userId: true } });
  let given = 0;
  for (const { userId } of members) {
    given += (await db.$transaction((tx) => evaluateAchievements(tx, userId))).length;
  }
  await audit(admin.email, 'achievement.backfill', 'Achievement', 'all', `${given} given to ${members.length} members checked`);
  revalidatePath('/admin/achievements');
}

export async function saveRule(reason: string, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole('ADMIN');
  const parsed = parseForm(ruleSchema, formData);
  if (!parsed.ok) return parsed.state;
  const known = ['CHECK_IN', 'SUBMISSION_APPROVED', 'PROJECT_APPROVED', 'REFERRAL'] as const;
  const key = known.find((k) => k === reason);
  const rule = key ? await db.awardRule.findUnique({ where: { reason: key } }) : null;
  if (!rule) return { message: 'Rule not found.' };
  await db.awardRule.update({ where: { reason: rule.reason }, data: { ...parsed.data, updatedBy: admin.email } });
  await audit(admin.email, 'rule.update', 'AwardRule', rule.reason, `${rule.xp}/${rule.credits} to ${parsed.data.xp}/${parsed.data.credits}, ${parsed.data.active ? 'on' : 'off'}`);
  revalidatePath('/admin/rules');
  return { saved: true };
}
