import type { Metadata } from 'next';
import { AdminForm } from '@/components/admin/AdminForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { SelectField, TextField } from '@/components/admin/fields';
import { PageHeader, Panel, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
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
      <PageHeader title="Admin users" description="Manage who has access to this dashboard and what role they hold." />
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
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
                    <td className={TD}>
                      <span className="font-medium text-text-strong">{user.email}</span>
                      {user.name && <span className="block text-xs text-text-muted">{user.name}</span>}
                    </td>
                    <td className={TD}>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'ADMIN' ? 'border-lime/40 bg-lime/10 text-lime' : 'border-border-strong bg-bg-alt text-text-muted'
                        }`}
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Editor'}
                      </span>
                    </td>
                    <td className={TD}>
                      {!blocked(user, nextRole) && (
                        <ToggleButton action={setUserRole.bind(null, user.id, nextRole)} label={nextRole === 'ADMIN' ? 'Make admin' : 'Make editor'} />
                      )}
                    </td>
                    <td className={TD}>
                      {!blocked(user, null) && (
                        <ConfirmAction
                          action={removeUser.bind(null, user.id)}
                          label="Remove"
                          question={`Remove dashboard access for ${user.email}? Their member account stays.`}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
        </div>

        <Panel title="Add someone" description="Grant dashboard access using their Google account email.">
          <AdminForm action={addUser} submitLabel="Add" framed={false}>
            <TextField name="email" label="Google account email" type="email" />
            <TextField name="name" label="Name" />
            <SelectField name="role" label="Role" options={ROLES} />
          </AdminForm>
        </Panel>
      </div>
    </>
  );
}
