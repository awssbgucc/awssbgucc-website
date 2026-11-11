import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { TextField } from '@/components/admin/fields';
import { LINK, PageHeader, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { balances } from '@/lib/platform/engine';
import { levelFor } from '@/lib/platform/rules';
import { adjustMember, deleteMember, messageMember, setMemberStatus } from '../actions';

export const metadata: Metadata = { title: 'Member' };

type Props = { params: Promise<{ userId: string }>; searchParams: Promise<{ error?: string }> };

export default async function MemberPage({ params, searchParams }: Props) {
  const admin = await requireRole();
  const { userId } = await params;
  const { error } = await searchParams;
  const profile = await db.memberProfile.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          checkIns: { orderBy: { createdAt: 'desc' }, include: { event: { select: { id: true, title: true, startsAt: true } } } },
          submissions: { orderBy: { updatedAt: 'desc' }, include: { challenge: { select: { title: true } } } },
          projects: { orderBy: { updatedAt: 'desc' } },
          ledger: { orderBy: { createdAt: 'desc' }, take: 30 },
          redemptions: { orderBy: { createdAt: 'desc' }, include: { reward: { select: { name: true } } } },
        },
      },
      referredBy: { select: { displayName: true, userId: true } },
      _count: { select: { referrals: true } },
    },
  });
  if (!profile) notFound();
  const totals = await balances(userId);
  const isAdmin = admin.role === 'ADMIN';
  const { user } = profile;

  return (
    <>
      <Link href="/admin/members" className={`${LINK} mb-2 inline-flex min-h-11 items-center text-sm`}>
        All members
      </Link>
      <PageHeader title={profile.displayName} />
      {error === 'admin' && (
        <p role="alert" className="mb-6 text-sm font-medium text-danger">
          This person is an admin user. Remove them from Admin users before deleting the account.
        </p>
      )}
      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <StatusBadge status={profile.status} />
        <Badge>{profile.visibility.toLowerCase()} profile</Badge>
        <span>@{profile.handle}</span>
        <span>{user.email}</span>
        <span>Joined {formatDate(profile.createdAt)}</span>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          ['Level', levelFor(totals.xp).level],
          ['XP', totals.xp],
          ['Credits', totals.credits],
          ['Sessions', user.checkIns.length],
          ['Referrals', profile._count.referrals],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-card p-4">
            <p className="text-sm text-text-muted">{label}</p>
            <p className="font-display text-2xl text-white">{value}</p>
          </div>
        ))}
      </div>

      <dl className="mb-10 grid max-w-3xl gap-4 text-sm sm:grid-cols-2">
        {[
          ['Programme', [profile.programme, profile.level].filter(Boolean).join(', ') || 'Not given'],
          ['Department', profile.department ?? 'Not given'],
          ['Interests', profile.interests.join(', ') || 'None chosen'],
          ['Referred by', profile.referredBy?.displayName ?? 'Nobody'],
          ['Leaderboards', profile.showOnLeaderboards ? 'Shows name' : 'Hidden'],
          ['Privacy notice accepted', profile.privacyAcceptedAt ? formatDate(profile.privacyAcceptedAt) : 'Not yet'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-text-muted">{label}</dt>
            <dd className="text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mb-3 text-lg font-semibold">Check-ins</h2>
      {user.checkIns.length === 0 ? (
        <p className="mb-10 text-text-muted">None yet.</p>
      ) : (
        <ul className="mb-10 space-y-1 text-sm">
          {user.checkIns.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/events/${c.event.id}/attendance`} className={LINK}>
                {c.event.title}
              </Link>
              <span className="text-text-muted">
                , {formatDate(c.event.startsAt)}
                {c.method === 'EDITOR' && `, added by ${c.recordedBy}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 text-lg font-semibold">Submissions and projects</h2>
      <ul className="mb-10 space-y-2 text-sm">
        {user.submissions.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/submissions/${s.id}`} className={LINK}>
              {s.challenge.title}
            </Link>
            <StatusBadge status={s.status} />
          </li>
        ))}
        {user.projects.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/projects/${p.id}`} className={LINK}>
              Project: {p.title}
            </Link>
            <StatusBadge status={p.status} />
          </li>
        ))}
        {user.submissions.length + user.projects.length === 0 && <li className="text-text-muted">None yet.</li>}
      </ul>

      <h2 className="mb-3 text-lg font-semibold">XP and credit history</h2>
      {user.ledger.length === 0 ? (
        <p className="mb-10 text-text-muted">Nothing yet.</p>
      ) : (
        <div className="mb-10">
          <TableWrap>
            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>Date</th>
                  <th className={TH}>Reason</th>
                  <th className={TH}>Note</th>
                  <th className={TH}>XP</th>
                  <th className={TH}>Credits</th>
                </tr>
              </thead>
              <tbody>
                {user.ledger.map((e) => (
                  <tr key={e.id}>
                    <td className={`${TD} font-display text-xs`}>{formatDate(e.createdAt)}</td>
                    <td className={TD}>{e.reason.toLowerCase().replace('_', ' ')}</td>
                    <td className={TD}>
                      {e.note}
                      {e.createdBy && <span className="block text-xs text-text-muted">by {e.createdBy}</span>}
                    </td>
                    <td className={`${TD} font-display`}>{e.xp || ''}</td>
                    <td className={`${TD} font-display`}>{e.credits || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </div>
      )}

      {user.redemptions.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">Redemptions</h2>
          <ul className="mb-10 space-y-2 text-sm">
            {user.redemptions.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2">
                {r.reward.name}, {r.cost} credits, {formatDate(r.createdAt)} <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </>
      )}

      <section className="grid max-w-4xl gap-10 border-t border-border pt-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Send a notification</h2>
          <AdminForm action={messageMember.bind(null, userId)} submitLabel="Send">
            <TextField name="title" label="Message" help="Shows in their portal notifications. Not an email." />
          </AdminForm>
        </div>
        {isAdmin && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Adjust XP or credits</h2>
            <AdminForm action={adjustMember.bind(null, userId)} submitLabel="Record adjustment">
              <TextField name="xp" label="XP change" type="number" defaultValue={0} help="Negative numbers take XP away." />
              <TextField name="credits" label="Credits change" type="number" defaultValue={0} />
              <TextField name="note" label="Reason" help="The member sees this. It is also in the audit log." />
            </AdminForm>
          </div>
        )}
      </section>

      {isAdmin && (
        <section className="mt-10 flex flex-wrap items-center gap-8 border-t border-border pt-6">
          <ToggleButton action={setMemberStatus.bind(null, userId, profile.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')} label={profile.status === 'ACTIVE' ? 'Suspend member' : 'Reactivate member'} />
          <ConfirmAction action={deleteMember.bind(null, userId)} label="Delete account" question="This deletes the account and every record linked to it." />
        </section>
      )}
    </>
  );
}
