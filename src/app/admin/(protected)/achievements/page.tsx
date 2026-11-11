import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, PageHeader, StatusPill, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { CRITERION_LABELS } from '@/lib/platform/rules';
import { awardQualifyingMembers } from './actions';

export const metadata: Metadata = { title: 'Achievements' };

export default async function AdminAchievementsPage() {
  await requireRole('ADMIN');
  const achievements = await db.achievement.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { awards: true } } } });
  return (
    <>
      <PageHeader title="Achievements" action={{ href: '/admin/achievements/new', label: 'New achievement' }} />
      <p className="mb-6 max-w-[62ch] text-sm text-text-muted">The server gives each achievement once, from verified records only, the next time a member checks in or has work approved.</p>
      <div className="mb-6">
        <ToggleButton action={awardQualifyingMembers} label="Give achievements to members who already qualify" />
      </div>
      {achievements.length === 0 ? (
        <Empty>No achievements yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Title</th>
                <th className={TH}>Rule</th>
                <th className={TH}>Award</th>
                <th className={TH}>Earned by</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((a) => (
                <tr key={a.id}>
                  <td className={TD}>
                    <Link href={`/admin/achievements/${a.id}`} className={LINK}>
                      {a.title}
                    </Link>
                  </td>
                  <td className={TD}>
                    {CRITERION_LABELS[a.criterion]}: {a.threshold}
                  </td>
                  <td className={`${TD} font-display text-xs`}>
                    {a.xp} XP, {a.credits} cr
                  </td>
                  <td className={`${TD} font-display`}>{a._count.awards}</td>
                  <td className={TD}>
                    <StatusPill published={a.active} labels={['Off', 'Active']} />
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
