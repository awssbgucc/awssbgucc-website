import type { Metadata } from 'next';
import Link from 'next/link';
import { LINK, PageHeader, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Reports' };

const DAY = 24 * 60 * 60 * 1000;

function Figure({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="font-display text-3xl text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

// Counts only, from stored records. Nothing about individual members leaves this page.
export default async function ReportsPage() {
  await requireRole();
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY);
  const [members, onboarded, newMembers, activeMembers, checkIns, sessions, submissions, approvedProjects, profiles] = await Promise.all([
    db.memberProfile.count(),
    db.memberProfile.count({ where: { onboardedAt: { not: null } } }),
    db.memberProfile.count({ where: { createdAt: { gte: since30 } } }),
    db.checkIn.groupBy({ by: ['userId'], where: { createdAt: { gte: since30 } } }).then((rows) => rows.length),
    db.checkIn.count(),
    db.event.findMany({
      where: { status: 'PUBLISHED', checkInOpensAt: { not: null } },
      orderBy: { startsAt: 'desc' },
      take: 12,
      select: { id: true, title: true, startsAt: true, attendance: true, _count: { select: { checkIns: true } } },
    }),
    db.submission.groupBy({ by: ['status'], _count: true }),
    db.project.count({ where: { status: 'APPROVED' } }),
    db.memberProfile.findMany({ where: { onboardedAt: { not: null } }, select: { interests: true, level: true, programme: true } }),
  ]);
  const tally = (values: (string | null)[]) => {
    const map = new Map<string, number>();
    for (const value of values) if (value) map.set(value, (map.get(value) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  };
  const interests = tally(profiles.flatMap((p) => p.interests));
  const levels = tally(profiles.map((p) => p.level));
  const programmes = tally(profiles.map((p) => p.programme)).slice(0, 10);

  return (
    <>
      <PageHeader title="Reports" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Figure label="Member accounts" value={members} hint={`${onboarded} finished onboarding`} />
        <Figure label="New in the last 30 days" value={newMembers} />
        <Figure label="Checked in, last 30 days" value={activeMembers} hint="Members with at least one check-in" />
        <Figure label="Check-ins recorded" value={checkIns} />
        <Figure label="Approved projects" value={approvedProjects} />
        {submissions.map((s) => (
          <Figure key={s.status} label={`Submissions: ${s.status.toLowerCase().replace('_', ' ')}`} value={s._count} />
        ))}
      </div>

      <h2 className="mt-12 mb-3 text-lg font-semibold">Recent sessions</h2>
      {sessions.length === 0 ? (
        <p className="text-text-muted">No session has run check-in yet.</p>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Session</th>
                <th className={TH}>Date</th>
                <th className={TH}>Check-ins</th>
                <th className={TH}>Public figure</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className={TD}>
                    <Link href={`/admin/events/${s.id}/attendance`} className={LINK}>
                      {s.title}
                    </Link>
                  </td>
                  <td className={`${TD} font-display text-xs`}>{formatDate(s.startsAt)}</td>
                  <td className={`${TD} font-display`}>{s._count.checkIns}</td>
                  <td className={`${TD} font-display`}>{s.attendance ?? 'not set'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        {[
          ['Interests', interests],
          ['Levels', levels],
          ['Top programmes', programmes],
        ].map(([title, rows]) => (
          <section key={title as string}>
            <h2 className="mb-3 text-lg font-semibold">{title as string}</h2>
            {(rows as [string, number][]).length === 0 ? (
              <p className="text-sm text-text-muted">No data yet.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {(rows as [string, number][]).map(([label, count]) => (
                  <li key={label} className="flex justify-between gap-4 border-b border-border pb-1.5">
                    <span>{label}</span>
                    <span className="font-display text-text-muted">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
