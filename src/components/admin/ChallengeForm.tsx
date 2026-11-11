import { saveChallenge } from '@/app/admin/(protected)/challenges/actions';
import type { Challenge } from '@/generated/prisma/client';
import { dateToAccraInput } from '@/lib/validation/shared';
import { AdminForm } from './AdminForm';
import { CheckboxField, MarkdownField, SelectField, TextArea, TextField } from './fields';

type Props = { challenge?: Challenge; events: { id: string; title: string }[] };

export function ChallengeForm({ challenge, events }: Props) {
  return (
    <AdminForm action={saveChallenge.bind(null, challenge?.id ?? null)}>
      <TextField name="title" label="Title" defaultValue={challenge?.title} />
      <TextField name="slug" label="Slug" defaultValue={challenge?.slug} help="Leave empty to generate it from the title." />
      <TextArea name="summary" label="Summary" defaultValue={challenge?.summary} help="Shown on the list. 200 characters at most." />
      <MarkdownField name="brief" label="Brief" defaultValue={challenge?.brief} rows={8} />
      <MarkdownField name="requirements" label="Requirements" defaultValue={challenge?.requirements} rows={6} help="What a submission must include. Reviewers check against this." />
      <MarkdownField name="rules" label="Participation rules" defaultValue={challenge?.rules} rows={4} help="Optional. For example, solo or teams, and what counts as your own work." />
      <TextField name="startsAt" label="Opens" type="datetime-local" defaultValue={challenge && dateToAccraInput(challenge.startsAt)} help="Ghana time." />
      <TextField name="endsAt" label="Deadline" type="datetime-local" defaultValue={challenge && dateToAccraInput(challenge.endsAt)} help="Ghana time." />
      <TextField name="xp" label="XP on approval" type="number" defaultValue={challenge?.xp} help="Leave empty to use the default rule." />
      <TextField name="credits" label="Credits on approval" type="number" defaultValue={challenge?.credits} help="Leave empty to use the default rule." />
      <TextField name="maxScore" label="Maximum score" type="number" defaultValue={challenge?.maxScore ?? 100} />
      <CheckboxField name="leaderboardEnabled" label="Show a leaderboard of approved submissions" defaultChecked={challenge?.leaderboardEnabled ?? true} />
      <SelectField name="eventId" label="Set at session" defaultValue={challenge?.eventId ?? ''} options={[{ value: '', label: 'No session' }, ...events.map((e) => ({ value: e.id, label: e.title }))]} />
      <SelectField name="status" label="Status" defaultValue={challenge?.status} options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }]} />
    </AdminForm>
  );
}
