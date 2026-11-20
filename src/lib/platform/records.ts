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
  return db.$transaction(async (tx) => {
    // Make sure the row exists, then lock it, so hits for one key run one after another.
    // Without the lock, two requests read the same count and both write count + 1.
    // A new row starts with an expired window, which nextWindow() treats as a fresh one.
    await tx.$executeRaw`INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 0, ${now}) ON CONFLICT ("key") DO NOTHING`;
    const [existing] = await tx.$queryRaw<{ count: number; resetAt: Date }[]>`SELECT "count", "resetAt" FROM "RateLimit" WHERE "key" = ${key} FOR UPDATE`;
    const next = nextWindow(existing ?? null, now, max, windowMs);
    if (!next.allowed) return false;
    await tx.rateLimit.update({ where: { key }, data: { count: next.count, resetAt: next.resetAt } });
    return true;
  });
}
