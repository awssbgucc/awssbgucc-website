import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasRole, NO_ACCESS_MESSAGE, normaliseEmail, type Role } from '@/lib/auth-rules';
import { db } from '@/lib/db';

function findAdmin(email: string) {
  return db.adminUser.findUnique({ where: { email: normaliseEmail(email) } });
}

async function assertAllowed(email: string | undefined) {
  if (email && (await findAdmin(email))) return;
  throw new APIError('FORBIDDEN', { code: 'NO_ACCESS', message: NO_ACCESS_MESSAGE });
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
  onAPIError: { errorURL: '/admin/sign-in' },
  // The allowlist runs on first sign-up and on every sign-in, so removing an admin also stops them signing in again.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          await assertAllowed(user.email);
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await db.user.findUnique({ where: { id: session.userId } });
          await assertAllowed(user?.email);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

/**
 * Call first in every admin page and server action. The role is read from the
 * database each time, so a removed admin loses access at once.
 */
export async function requireRole(...allowed: Role[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/sign-in');
  const admin = await findAdmin(session.user.email);
  if (!admin) redirect('/admin/sign-in?error=NO_ACCESS');
  if (!hasRole(admin.role, allowed)) redirect('/admin');
  return admin;
}
