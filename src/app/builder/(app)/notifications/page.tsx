import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTitle } from '@/components/builder/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/format';
import { requireMember } from '@/lib/member';
import { markAllRead } from '../../actions/notifications';

export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const { user } = await requireMember();
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <>
      <PageTitle
        label="Notifications"
        title={unread ? `${unread} unread` : 'Notifications'}
        intro="Check-ins, reviews, achievements and redemptions. Nothing here is sent by email."
        action={
          unread > 0 ? (
            <form action={markAllRead}>
              <button type="submit" className="min-h-11 rounded-sm border border-border-strong px-4 text-sm font-medium text-white hover:border-text-muted">
                Mark all as read
              </button>
            </form>
          ) : undefined
        }
      />
      {notifications.length === 0 ? (
        <EmptyState label="All quiet">You will see your check-ins, reviews and achievements here.</EmptyState>
      ) : (
        <ul className="border-t border-border">
          {notifications.map((n) => {
            const content = (
              <div className="flex gap-4 py-4">
                <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-full ${n.readAt ? 'bg-transparent' : 'bg-lime'}`} />
                <div className="min-w-0">
                  <p className={`font-medium ${n.readAt ? 'text-text-muted' : 'text-white'}`}>
                    {!n.readAt && <span className="sr-only">Unread: </span>}
                    {n.title}
                  </p>
                  {n.body && <p className="mt-1 text-sm text-text-muted">{n.body}</p>}
                  <p className="type-label mt-1 text-text-muted">
                    {formatDate(n.createdAt)}, {formatTime(n.createdAt)}
                  </p>
                </div>
              </div>
            );
            return (
              <li key={n.id} className="border-b border-border">
                {n.href ? (
                  <Link href={n.href} className="block transition-colors duration-150 ease-brand hover:bg-card/60">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
