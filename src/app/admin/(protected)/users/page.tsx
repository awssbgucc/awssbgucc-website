import type { Metadata } from 'next';
import { AdminForm } from '@/components/admin/AdminForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { SelectField, TextField } from '@/components/admin/fields';
import { PageHeader, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { adminChangeError } from '@/lib/auth-rules';
import { db } from '@/lib/db';
import { addUser, removeUser, setUserRole } from './actions';

export const metadata: Metadata = { title: 'Admin users' };

const ROLES = [
  { value: 'EDITOR', label: 'Editor: events, team, partners, posts' },
  { value: 'ADMIN', label: 'Admin: everything' },
];

export default async function UsersPage() {
  const actor = await requireRole('ADMIN');
  const users = await db.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
  const adminCount = users.filter((user) => user.role === 'ADMIN').length;
  const blocked = (user: (typeof users)[number], nextRole: 'ADMIN' | 'EDITOR' | null) =>
    !!adminChangeError({ actorEmail: actor.email, targetEmail: user.email, targetRole: user.role, nextRole, adminCount });

  return (
    <>
      <PageHeader title="Admin users" />
      <TableWrap>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TH}>Email</th>
              <th className={TH}>Role</th>
              <th className={TH}>Change</th>
              <th className={TH}>Remove</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const nextRole = user.role === 'ADMIN' ? 'EDITOR' : 'ADMIN';
              return (
                <tr key={user.id}>
                  <td className={TD}>{user.email}</td>
                  <td className={TD}>{user.role === 'ADMIN' ? 'Admin' : 'Editor'}</td>
                  <td className={TD}>
                    {!blocked(user, nextRole) && (
                      <ToggleButton action={setUserRole.bind(null, user.id, nextRole)} label={nextRole === 'ADMIN' ? 'Make admin' : 'Make editor'} />
                    )}
                  </td>
                  <td className={TD}>
                    {!blocked(user, null) && <ConfirmAction action={removeUser.bind(null, user.id)} label="Remove" question={`Remove ${user.email}?`} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
      <h2 className="mt-10 mb-4 text-lg font-semibold">Add someone</h2>
      <AdminForm action={addUser} submitLabel="Add">
        <TextField name="email" label="Google account email" type="email" />
        <TextField name="name" label="Name" />
        <SelectField name="role" label="Role" options={ROLES} />
      </AdminForm>
    </>
  );
}
