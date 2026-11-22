import { db } from '@/lib/db';
import { errorMessage, logError } from '@/lib/log';

export const dynamic = 'force-dynamic';

/**
 * For an uptime monitor: 200 when the app can reach the database, 503 when it cannot. It says nothing else.
 * Each call wakes Neon, which then stays up for five minutes, so check it at most every 30 minutes
 * (docs/DEPLOY.md, Monitoring). Check the home page as often as you like: it does not touch the database.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok' }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    logError('health_check_failed', { message: errorMessage(error) });
    return Response.json({ status: 'unavailable' }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
