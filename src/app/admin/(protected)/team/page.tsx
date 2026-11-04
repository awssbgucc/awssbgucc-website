import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, MoveButtons, PageHeader, StatusPill, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { moveMember, toggleMember } from './actions';

export const metadata: Metadata = { title: 'Team' };

export default async function AdminTeamPage() {
  await requireRole();
  const members = await db.teamMember.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <PageHeader title="Team" action={{ href: '/admin/team/new', label: 'New member' }} />
      {members.length === 0 ? (
        <Empty>No team members yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Order</th>
                <th className={TH}>Name</th>
                <th className={TH}>Role</th>
                <th className={TH}>Status</th>
                <th className={TH}>Change</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className={TD}>
                    <MoveButtons name={member.name} onUp={moveMember.bind(null, member.id, 'up')} onDown={moveMember.bind(null, member.id, 'down')} />
                  </td>
                  <td className={TD}>
                    <Link href={`/admin/team/${member.id}`} className={LINK}>
                      {member.name}
                    </Link>
                  </td>
                  <td className={TD}>{member.role}</td>
                  <td className={TD}>
                    <StatusPill published={member.active} labels={['Hidden', 'Active']} />
                  </td>
                  <td className={TD}>
                    <ToggleButton action={toggleMember.bind(null, member.id, !member.active)} label={member.active ? 'Deactivate' : 'Activate'} />
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
