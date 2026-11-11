import type { Prisma } from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { nextWindow } from './rules';

type Tx = Prisma.TransactionClient;

/** One row per sensitive action. Content edits keep using updatedBy instead. */
export function audit(actorEmail: string, action: string, entityType: string, entityId: string, detail?: string, tx: Tx = db) {
  return tx.auditLog.create({ data: { actorEmail, action, entityType, entityId, detail } });
}

export function notify(userId: string, title: string, options: { body?: string; href?: string } = {}, tx: Tx = db) {
  return tx.notification.create({ data: { userId, title, body: options.body, href: options.href } });
}

/**
 * A fixed-window limit kept in the database, so it holds across server instances.
 * Returns false when the caller is over the limit.
 */
export async function withinLimit(key: string, max: number, windowMs: number) {
  const now = new Date();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await db.$transaction(async (tx) => {
        const existing = await tx.rateLimit.findUnique({ where: { key } });
        const next = nextWindow(existing, now, max, windowMs);
        if (!next.allowed) return false;
        await tx.rateLimit.upsert({
          where: { key },
          create: { key, count: next.count, resetAt: next.resetAt },
          update: { count: next.count, resetAt: next.resetAt },
        });
        return true;
      });
    } catch (error) {
      // Two first hits at once can both try to create the row. The retry reads it.
      if (attempt === 1) throw error;
    }
  }
  return false;
}
