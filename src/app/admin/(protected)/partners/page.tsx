import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, MoveButtons, PageHeader, StatusPill, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { movePartner, togglePartner } from './actions';

export const metadata: Metadata = { title: 'Partners' };

export default async function AdminPartnersPage() {
  await requireRole();
  const partners = await db.partner.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <PageHeader title="Partners" action={{ href: '/admin/partners/new', label: 'New partner' }} />
      {partners.length === 0 ? (
        <Empty>No partners yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Order</th>
                <th className={TH}>Name</th>
                <th className={TH}>Status</th>
                <th className={TH}>Change</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => {
                const published = partner.status === 'PUBLISHED';
                return (
                  <tr key={partner.id}>
                    <td className={TD}>
                      <MoveButtons name={partner.name} onUp={movePartner.bind(null, partner.id, 'up')} onDown={movePartner.bind(null, partner.id, 'down')} />
                    </td>
                    <td className={TD}>
                      <Link href={`/admin/partners/${partner.id}`} className={LINK}>
                        {partner.name}
                      </Link>
                    </td>
                    <td className={TD}>
                      <StatusPill published={published} />
                    </td>
                    <td className={TD}>
                      <ToggleButton action={togglePartner.bind(null, partner.id, published ? 'DRAFT' : 'PUBLISHED')} label={published ? 'Unpublish' : 'Publish'} />
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
