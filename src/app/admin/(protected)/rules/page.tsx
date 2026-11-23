import type { Metadata } from 'next';
import { AdminForm } from '@/components/admin/AdminForm';
import { CheckboxField, TextField } from '@/components/admin/fields';
import { PageHeader, Panel } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { REFERRAL_MONTHLY_CAP } from '@/lib/platform/rules';
import { saveRule } from '../achievements/actions';

export const metadata: Metadata = { title: 'XP and credit rules' };

const NAMES: Record<string, string> = {
  CHECK_IN: 'Check-in at a session',
  SUBMISSION_APPROVED: 'Approved challenge submission',
  PROJECT_APPROVED: 'Approved project',
  REFERRAL: 'Referral, when the person referred attends a first session',
};

export default async function RulesPage() {
  await requireRole('ADMIN');
  const rules = await db.awardRule.findMany({ orderBy: { reason: 'asc' } });
  return (
    <>
      <PageHeader
        title="XP and credit rules"
        description={`Changes apply to new awards only. Members see these rules on their progress page. Referral awards are capped at ${REFERRAL_MONTHLY_CAP} a month per member. Achievements set their own values.`}
      />
      {rules.length === 0 ? (
        <p className="text-text-muted">No rules yet. Run pnpm db:seed to add the defaults.</p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {rules.map((rule) => (
            <Panel
              key={rule.reason}
              title={NAMES[rule.reason] ?? rule.reason}
              description={rule.updatedBy ? `Last changed by ${rule.updatedBy}` : undefined}
            >
              <AdminForm action={saveRule.bind(null, rule.reason)} framed={false}>
                <TextField name="xp" label="XP" type="number" defaultValue={rule.xp} />
                <TextField name="credits" label="Credits" type="number" defaultValue={rule.credits} />
                <TextField name="description" label="Shown to members as" defaultValue={rule.description} />
                <CheckboxField name="active" label="Active" defaultChecked={rule.active} />
              </AdminForm>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
