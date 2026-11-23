import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, MoveButtons, PageHeader, StatusPill, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { CERT_LEVEL_LABEL } from '@/lib/validation/certification';
import { moveCertification, toggleCertification } from './actions';

export const metadata: Metadata = { title: 'Certifications' };

export default async function AdminCertificationsPage() {
  await requireRole();
  const items = await db.memberCertification.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <PageHeader title="Certifications" action={{ href: '/admin/certifications/new', label: 'New certification' }} />
      {items.length === 0 ? (
        <Empty>No certifications yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Order</th>
                <th className={TH}>Member</th>
                <th className={TH}>Certification</th>
                <th className={TH}>Status</th>
                <th className={TH}>Change</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const published = item.status === 'PUBLISHED';
                return (
                  <tr key={item.id}>
                    <td className={TD}>
                      <MoveButtons
                        name={`${item.memberName}, ${item.certName}`}
                        onUp={moveCertification.bind(null, item.id, 'up')}
                        onDown={moveCertification.bind(null, item.id, 'down')}
                      />
                    </td>
                    <td className={TD}>
                      <Link href={`/admin/certifications/${item.id}`} className={LINK}>
                        {item.memberName}
                      </Link>
                    </td>
                    <td className={TD}>
                      <span className="font-medium text-text-strong">{item.certName}</span>
                      {item.certCode && <span className="ml-2 text-xs text-text-muted">{item.certCode}</span>}
                      <span className="block text-xs text-text-muted">{CERT_LEVEL_LABEL[item.certLevel]}</span>
                    </td>
                    <td className={TD}>
                      <StatusPill published={published} />
                    </td>
                    <td className={TD}>
                      <ToggleButton action={toggleCertification.bind(null, item.id, published ? 'DRAFT' : 'PUBLISHED')} label={published ? 'Unpublish' : 'Publish'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
