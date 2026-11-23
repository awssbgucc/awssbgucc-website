import { Activity, CheckSquare, FolderGit2, TrendingUp, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LINK, PageHeader, Panel, StatCard, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Reports' };

const DAY = 24 * 60 * 60 * 1000;

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
      <PageHeader title="Reports" description="Aggregate participation, attendance and member breakdown across the group." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Member accounts" value={members} hint={`${onboarded} finished onboarding`} icon={<Users aria-hidden size={18} />} tone="lime" />
        <StatCard label="New (30 days)" value={newMembers} icon={<TrendingUp aria-hidden size={18} />} tone="blue" />
        <StatCard
          label="Active (30 days)"
          value={activeMembers}
          hint="Members with at least one check-in"
          icon={<Activity aria-hidden size={18} />}
          tone="purple"
        />
        <StatCard label="Check-ins recorded" value={checkIns} icon={<CheckSquare aria-hidden size={18} />} tone="magenta" />
        <StatCard label="Approved projects" value={approvedProjects} icon={<FolderGit2 aria-hidden size={18} />} tone="lime" />
        {submissions.map((s) => (
          <StatCard
            key={s.status}
            label={`Submissions: ${s.status.toLowerCase().replace('_', ' ')}`}
            value={s._count}
            icon={<CheckSquare aria-hidden size={18} />}
            tone="neutral"
          />
        ))}
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-base font-semibold text-text-strong">Recent sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-text-muted">No session has run check-in yet.</p>
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
                    <td className={`${TD} font-display text-xs whitespace-nowrap`}>{formatDate(s.startsAt)}</td>
                    <td className={`${TD} font-display`}>{s._count.checkIns}</td>
                    <td className={`${TD} font-display`}>{s.attendance ?? 'not set'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {(
          [
            ['Interests', interests],
            ['Levels', levels],
            ['Top programmes', programmes],
          ] as [string, [string, number][]][]
        ).map(([title, rows]) => {
          const max = rows[0]?.[1] ?? 1;
          return (
            <Panel key={title} title={title}>
              {rows.length === 0 ? (
                <p className="text-sm text-text-muted">No data yet.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {rows.map(([label, count]) => {
                    const width = `${Math.max(8, Math.round((count / max) * 100))}%`;
                    return (
                      <li key={label} className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="truncate text-text">{label}</span>
                          <span className="font-display text-xs text-text-muted tabular-nums">{count}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-alt">
                          <div className="h-full rounded-full bg-lime" style={{ width }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
