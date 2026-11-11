'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { parseForm, type FormState } from '@/lib/admin/forms';
import { db } from '@/lib/db';
import { requireMember } from '@/lib/member';
import { withinLimit } from '@/lib/platform/records';
import { optionalHttpsUrl, optionalText } from '@/lib/validation/shared';

const githubRepo = z
  .string()
  .trim()
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.split('/').filter(Boolean).length >= 2;
    } catch {
      return false;
    }
  }, 'Use the repository link, like https://github.com/your-name/your-repo');

const submissionSchema = z.object({
  repoUrl: githubRepo,
  demoUrl: optionalHttpsUrl,
  notes: optionalText.refine((value) => !value || value.length <= 1000, 'Keep the notes to 1,000 characters.'),
});

export async function submitChallenge(challengeId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireMember();
  const parsed = parseForm(submissionSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (!(await withinLimit(`submit:${user.id}`, 10, 60 * 60 * 1000))) return { message: 'Too many submissions in an hour. Try again later.' };

  const now = new Date();
  const challenge = await db.challenge.findFirst({ where: { id: challengeId, status: 'PUBLISHED' } });
  if (!challenge) return { message: 'This challenge was not found.' };
  if (now < challenge.startsAt) return { message: 'This challenge has not opened yet.' };
  if (now > challenge.endsAt) return { message: 'This challenge has closed.' };

  const existing = await db.submission.findUnique({ where: { challengeId_userId: { challengeId, userId: user.id } } });
  if (existing && (existing.status === 'APPROVED' || existing.status === 'REJECTED')) {
    return { message: 'This submission has been reviewed and cannot be changed.' };
  }
  await db.$transaction(async (tx) => {
    const submission = await tx.submission.upsert({
      where: { challengeId_userId: { challengeId, userId: user.id } },
      create: { challengeId, userId: user.id, ...parsed.data },
      update: { ...parsed.data, status: 'PENDING' },
    });
    await tx.submissionEvent.create({ data: { submissionId: submission.id, status: 'PENDING', note: existing ? 'Updated by the member' : 'Submitted', actor: 'member' } });
  });
  revalidatePath(`/builder/challenges/${challenge.slug}`);
  return { saved: true };
}
