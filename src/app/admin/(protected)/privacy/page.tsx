import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Empty, LINK, PageHeader, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { audit } from '@/lib/platform/records';

export const metadata: Metadata = { title: 'Privacy requests' };

async function markDone(id: string) {
  'use server';
  const admin = await requireRole('ADMIN');
  await db.privacyRequest.update({ where: { id }, data: { status: 'DONE', handledBy: admin.email, handledAt: new Date() } });
  await audit(admin.email, 'privacy.done', 'PrivacyRequest', id);
  revalidatePath('/admin/privacy');
}

export default async function PrivacyPage() {
  await requireRole('ADMIN');
  const requests = await db.privacyRequest.findMany({ orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 200 });
  return (
    <>
      <PageHeader title="Privacy requests" />
      <p className="mb-6 max-w-[62ch] text-sm text-text-muted">
        Members can download their data and delete their account themselves. Corrections and other questions arrive here. Reply by email, make the change, then mark it done.
      </p>
      {requests.length === 0 ? (
        <Empty>No requests.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Received</th>
                <th className={TH}>From</th>
                <th className={TH}>Kind</th>
                <th className={TH}>Details</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className={`${TD} font-display text-xs`}>{formatDate(r.createdAt)}</td>
                  <td className={TD}>
                    {r.userId && r.kind !== 'DELETE' ? (
                      <Link href={`/admin/members/${r.userId}`} className={LINK}>
                        {r.email}
                      </Link>
                    ) : (
                      r.email
                    )}
                  </td>
                  <td className={TD}>{r.kind.toLowerCase()}</td>
                  <td className={`${TD} text-sm`}>{r.details}</td>
                  <td className={TD}>
                    {r.status === 'OPEN' ? <ToggleButton action={markDone.bind(null, r.id)} label="Mark done" /> : <StatusBadge status="DONE" />}
                    {r.handledBy && <span className="block text-xs text-text-muted">{r.handledBy}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
