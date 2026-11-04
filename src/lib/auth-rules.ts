// Pure access rules, kept apart from Better Auth and the database so they can be tested directly.

export type Role = 'ADMIN' | 'EDITOR';

export const NO_ACCESS_MESSAGE = 'This account does not have access';

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
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
