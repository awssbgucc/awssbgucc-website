// Pure access rules, kept apart from Better Auth and the database so they can be tested directly.

export type Role = 'ADMIN' | 'EDITOR';

export const NO_ACCESS_MESSAGE = 'This account does not have access';

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Codes passed back to /sign-in as ?error=, each with the message shown there. */
export const SIGN_IN_ERRORS = {
  NOT_VERIFIED: 'Google has not verified this email address, so it cannot sign in.',
  DOMAIN: 'Member accounts are open to university email addresses only. Sign in with your student email.',
  SUSPENDED: 'This account is suspended. Email the team if you think this is a mistake.',
  NO_ACCESS: NO_ACCESS_MESSAGE,
} as const;

export type SignInError = keyof typeof SIGN_IN_ERRORS;

/** Empty or missing means any domain. Otherwise a comma-separated list, matched exactly. */
export function emailDomainAllowed(email: string, domains: string | null | undefined) {
  const list = (domains ?? '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
  if (list.length === 0) return true;
  const domain = normaliseEmail(email).split('@')[1] ?? '';
  return list.includes(domain);
}

/** With no roles listed, any admin user is allowed. */
export function hasRole(role: Role, allowed: Role[]) {
  return allowed.length === 0 || allowed.includes(role);
}

/** Stops the dashboard being locked out: nobody removes themselves, or demotes or removes the last admin. */
export function adminChangeError(change: {
  actorEmail: string;
  targetEmail: string;
  targetRole: Role;
  nextRole: Role | null;
  adminCount: number;
}) {
  const { actorEmail, targetEmail, targetRole, nextRole, adminCount } = change;
  if (nextRole === null && normaliseEmail(actorEmail) === normaliseEmail(targetEmail)) return 'You cannot remove your own account.';
  if (targetRole === 'ADMIN' && nextRole !== 'ADMIN' && adminCount <= 1) return 'There must be at least one admin.';
  return null;
}
