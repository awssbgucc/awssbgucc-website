import type { Metadata } from 'next';
import { PageTitle, Panel } from '@/components/builder/ui';
import { ActivityCalendar } from '@/components/ui/ActivityCalendar';
import { Badge } from '@/components/ui/Badge';
import { ParticipationGrid } from '@/components/ui/ParticipationGrid';
import { Progress } from '@/components/ui/Progress';
import { Stat } from '@/components/ui/Stat';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { requireMember } from '@/lib/member';
import { criterionCounts } from '@/lib/platform/engine';
import { activityDays, memberRecord } from '@/lib/platform/member-data';
import { CRITERION_LABELS, LEVEL_THRESHOLDS, REFERRAL_MONTHLY_CAP } from '@/lib/platform/rules';

export const metadata: Metadata = { title: 'Progress' };

const REASONS: Record<string, string> = {
  CHECK_IN: 'Check-in',
  SUBMISSION_APPROVED: 'Approved submission',
  PROJECT_APPROVED: 'Approved project',
  REFERRAL: 'Referral',
  ACHIEVEMENT: 'Achievement',
  ADJUSTMENT: 'Adjustment by the team',
  REDEMPTION: 'Redemption',
  REFUND: 'Refund',
};

export default async function ProgressPage() {
  const { user } = await requireMember();
  const [record, counts, achievements, owned, ledger, rules, days] = await Promise.all([
    memberRecord(user.id),
    criterionCounts(user.id),
    db.achievement.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    db.memberAchievement.findMany({ where: { userId: user.id } }),
    db.ledgerEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
    db.awardRule.findMany({ where: { active: true } }),
    activityDays(user.id),
  ]);
  const earned = new Map(owned.map((o) => [o.achievementId, o.awardedAt]));
  const { level } = record;

  return (
    <>
      <PageTitle label="Progress" title="Your record" intro="Everything here comes from verified records: check-ins at sessions, reviewed work and approved projects. Opening the portal earns nothing." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="type-label text-text-muted">Level</p>
              <p className="font-display text-5xl font-medium text-white">{level.level}</p>
            </div>
            <p className="font-display text-sm text-text-muted">{level.next === null ? `${level.xp} XP, the top level` : `${level.xp} of ${level.next} XP`}</p>
          </div>
          <Progress value={level.progress} label={`Progress to level ${level.level + 1}`} className="mt-4" />
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat value={record.xp} label="XP" />
            <Stat value={record.credits} label="Credits" />
            <Stat value={record.streak.current} label="Sessions in a row" hint={`Longest: ${record.streak.longest}`} />
            <Stat value={record.counts.sessions} label="Sessions attended" />
          </div>
        </Panel>
        <Panel title="How streaks work">
          <p className="text-sm text-text-muted">A streak counts sessions in a row, not days. Missing a week of exams does not break it. Missing a session that ran check-in does.</p>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Sessions">{record.sessions.length === 0 ? <p className="text-sm text-text-muted">No session has run check-in yet.</p> : <ParticipationGrid sessions={record.sessions} attended={record.attended} />}</Panel>
        <Panel title="Participation calendar">
          <ActivityCalendar days={days} />
        </Panel>
      </div>

      <Panel title="Achievements" className="mt-6" action={<span className="type-label text-text-muted">{earned.size} of {achievements.length}</span>}>
        {achievements.length === 0 ? (
          <p className="text-sm text-text-muted">No achievements are set up yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => {
              const at = earned.get(a.id);
              const current = Math.min(counts[a.criterion], a.threshold);
              return (
                <li key={a.id} className={`rounded-md border p-4 ${at ? 'border-lime/40' : 'border-border'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold ${at ? 'text-white' : 'text-text-muted'}`}>{a.title}</p>
                    {at ? <Badge tone="lime">Earned</Badge> : <span className="font-display text-xs text-text-muted">{current}/{a.threshold}</span>}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{a.description}</p>
                  {!at && <Progress value={current / a.threshold} label={`${a.title} progress`} className="mt-3" />}
                  <p className="type-label mt-3 text-text-muted">
                    {at ? `Earned ${formatDate(at)}` : `${CRITERION_LABELS[a.criterion]}: ${a.threshold}`}
                    {(a.xp > 0 || a.credits > 0) && `, +${a.xp} XP, +${a.credits} cr`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel title="History">
          {ledger.length === 0 ? (
            <p className="text-sm text-text-muted">Nothing yet. Your first check-in will appear here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="text-text-muted">
                    <th className="border-b border-border-strong py-2 pr-4 font-medium">Date</th>
                    <th className="border-b border-border-strong py-2 pr-4 font-medium">What</th>
                    <th className="border-b border-border-strong py-2 pr-4 text-right font-medium">XP</th>
                    <th className="border-b border-border-strong py-2 text-right font-medium">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id}>
                      <td className="border-b border-border py-2.5 pr-4 font-display text-xs text-text-muted">{formatDate(entry.createdAt)}</td>
                      <td className="border-b border-border py-2.5 pr-4">
                        <span className="block text-white">{entry.note ?? REASONS[entry.reason]}</span>
                        <span className="text-xs text-text-muted">{REASONS[entry.reason]}</span>
                      </td>
                      <td className="border-b border-border py-2.5 pr-4 text-right font-display">{entry.xp || ''}</td>
                      <td className="border-b border-border py-2.5 text-right font-display">{entry.credits || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <div className="flex flex-col gap-6">
          <Panel title="The rules">
            <ul className="flex flex-col gap-3 text-sm">
              {rules.map((rule) => (
                <li key={rule.reason} className="border-b border-border pb-3">
                  <p className="text-white">{rule.description}</p>
                  <p className="type-label mt-1 text-lime">
                    +{rule.xp} XP, +{rule.credits} credits
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-text-muted">Each thing is awarded once. Referral awards are capped at {REFERRAL_MONTHLY_CAP} a month. A removed check-in takes its award back.</p>
          </Panel>
          <Panel title="Levels">
            <ol className="grid grid-cols-2 gap-x-6 gap-y-1 font-display text-sm">
              {LEVEL_THRESHOLDS.map((xp, index) => (
                <li key={xp} className={`flex justify-between ${index + 1 === level.level ? 'text-lime' : 'text-text-muted'}`}>
                  <span>Level {index + 1}</span>
                  <span>{xp}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}
