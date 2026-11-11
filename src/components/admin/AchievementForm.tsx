import { saveAchievement } from '@/app/admin/(protected)/achievements/actions';
import type { Achievement } from '@/generated/prisma/client';
import { CRITERION_LABELS } from '@/lib/platform/rules';
import { AdminForm } from './AdminForm';
import { CheckboxField, SelectField, TextArea, TextField } from './fields';

export function AchievementForm({ achievement }: { achievement?: Achievement }) {
  return (
    <AdminForm action={saveAchievement.bind(null, achievement?.id ?? null)}>
      <TextField name="code" label="Code" defaultValue={achievement?.code} help="A short id, for example five-sessions. Do not change it once awarded." />
      <TextField name="title" label="Title" defaultValue={achievement?.title} />
      <TextArea name="description" label="Description" defaultValue={achievement?.description} help="Say exactly what earns it." />
      <SelectField name="criterion" label="Measured by" defaultValue={achievement?.criterion} options={Object.entries(CRITERION_LABELS).map(([value, label]) => ({ value, label }))} />
      <TextField name="threshold" label="Threshold" type="number" defaultValue={achievement?.threshold ?? 1} />
      <TextField name="xp" label="XP when earned" type="number" defaultValue={achievement?.xp ?? 0} />
      <TextField name="credits" label="Credits when earned" type="number" defaultValue={achievement?.credits ?? 0} />
      <CheckboxField name="active" label="Active" defaultChecked={achievement?.active ?? true} />
    </AdminForm>
  );
}
