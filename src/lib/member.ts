import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/lib/auth';
import { normaliseEmail } from '@/lib/auth-rules';
import { db } from '@/lib/db';

// Guards for the builder portal. Call one first in every portal page, server action and member API route.
// They never grant admin rights: those come only from requireRole() in src/lib/auth.ts.

/** The signed-in user with a verified email, or null. Cached for one request. */
export const sessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.emailVerified ? session.user : null;
});

export const isAdminEmail = cache(async (email: string) => !!(await db.adminUser.findUnique({ where: { email: normaliseEmail(email) } })));

/** Signed in and not suspended. The profile may not exist yet: use this only for onboarding. */
export async function requireUser() {
  const user = await sessionUser();
  if (!user) redirect('/sign-in');
  const profile = await db.memberProfile.findUnique({ where: { userId: user.id } });
  if (profile?.status === 'SUSPENDED') redirect('/sign-in?error=SUSPENDED');
  return { user, profile };
}

/** Signed in, not suspended, and onboarded. */
export async function requireMember() {
  const { user, profile } = await requireUser();
  if (!profile?.onboardedAt) redirect('/builder/welcome');
  return { user, profile };
}

/** For member API routes, which answer 401 instead of redirecting. */
export async function currentMember() {
  const user = await sessionUser();
  if (!user) return null;
  const profile = await db.memberProfile.findUnique({ where: { userId: user.id } });
  return profile?.onboardedAt && profile.status === 'ACTIVE' ? { user, profile } : null;
}
