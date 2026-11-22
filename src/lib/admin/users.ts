import { adminChangeError, type Role } from '@/lib/auth-rules';
import { db } from '@/lib/db';
import { audit } from '@/lib/platform/records';

/**
 * Changes someone's dashboard role, or removes their access when nextRole is null.
 * The admin rows are locked first, so two admins demoting each other at the same moment
 * cannot both pass the "at least one admin" check. Call after requireRole('ADMIN').
 */
export async function changeAccess(actorEmail: string, id: string, nextRole: Role | null) {
  await db.$transaction(async (tx) => {
    const admins = await tx.$queryRaw<{ email: string }[]>`SELECT "email" FROM "AdminUser" WHERE "role" = 'ADMIN' FOR UPDATE`;
    // The actor may have lost the role while this request waited for the lock.
    if (!admins.some((admin) => admin.email === actorEmail)) throw new Error('Only an admin can change access.');
    const target = await tx.adminUser.findUniqueOrThrow({ where: { id } });
    const error = adminChangeError({ actorEmail, targetEmail: target.email, targetRole: target.role, nextRole, adminCount: admins.length });
    if (error) throw new Error(error);
    if (nextRole) {
      await tx.adminUser.update({ where: { id }, data: { role: nextRole } });
      await audit(actorEmail, 'admin.role', 'AdminUser', id, `${target.email}: ${target.role} to ${nextRole}`, tx);
    } else {
      await tx.adminUser.delete({ where: { id } });
      await audit(actorEmail, 'admin.remove', 'AdminUser', id, target.email, tx);
    }
  });
}
