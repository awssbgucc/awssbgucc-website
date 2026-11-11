import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { emailDomainAllowed, hasRole, normaliseEmail, SIGN_IN_ERRORS, type Role, type SignInError } from '@/lib/auth-rules';
import { db } from '@/lib/db';

// Two kinds of people sign in with Google: members and the core team.
// Anyone with a verified Google email may create a member account (optionally limited by email domain).
// Admin rights come only from the AdminUser table, checked by requireRole() on every admin page and action.

function findAdmin(email: string) {
  return db.adminUser.findUnique({ where: { email: normaliseEmail(email) } });
}

function refuse(code: SignInError): never {
  throw new APIError('FORBIDDEN', { code, message: SIGN_IN_ERRORS[code] });
}

/** Fails closed: an unverified email never gets an account or a session. */
async function assertCanSignIn(user: { id?: string; email?: string; emailVerified?: boolean } | null | undefined) {
  if (!user?.email || !user.emailVerified) refuse('NOT_VERIFIED');
  if (await findAdmin(user.email)) return;
  const settings = await db.siteSettings.findUnique({ where: { id: 1 }, select: { memberEmailDomains: true } });
  if (!emailDomainAllowed(user.email, settings?.memberEmailDomains)) refuse('DOMAIN');
  if (user.id) {
    const profile = await db.memberProfile.findUnique({ where: { userId: user.id }, select: { status: true } });
    if (profile?.status === 'SUSPENDED') refuse('SUSPENDED');
  }
}

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  database: prismaAdapter(db, { provider: 'postgresql' }),
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    },
  },
  onAPIError: { errorURL: '/sign-in' },
  // Runs on first sign-up and on every sign-in, so a suspension or a domain change applies at the next sign-in,
  // and requireMember() and requireRole() apply it at once on every request.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          await assertCanSignIn(user);
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await db.user.findUnique({ where: { id: session.userId } });
          await assertCanSignIn(user);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

/**
 * Call first in every admin page and server action. The role is read from the
 * database each time, so a removed admin loses access at once. A member session is
 * not enough: the email must be in AdminUser.
 */
export async function requireRole(...allowed: Role[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/sign-in');
  const admin = session.user.emailVerified ? await findAdmin(session.user.email) : null;
  if (!admin) redirect('/admin/sign-in?error=NO_ACCESS');
  if (!hasRole(admin.role, allowed)) redirect('/admin');
  return admin;
}

/** For API routes, which answer 401 instead of redirecting. Same checks as requireRole(). */
export async function currentAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.emailVerified) return null;
  return findAdmin(session.user.email);
}
