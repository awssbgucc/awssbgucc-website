import { saveMember } from '@/app/admin/(protected)/team/actions';
import type { TeamMember } from '@/lib/content/types';
import { AdminForm } from './AdminForm';
import { CheckboxField, ImageField, SelectField, TextField } from './fields';

const GROUPS = [
  { value: 'LEADER', label: 'Group Leader' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'EVENTS', label: 'Events and operations' },
  { value: 'COMMUNITY', label: 'Community and marketing' },
];

export function MemberForm({ member }: { member?: TeamMember }) {
  return (
    <AdminForm action={saveMember.bind(null, member?.id ?? null)}>
      <TextField name="name" label="Name" defaultValue={member?.name} />
      <TextField name="role" label="Role" defaultValue={member?.role} />
      <SelectField name="roleGroup" label="Role group" options={GROUPS} defaultValue={member?.roleGroup} help="Sets the colour of the role label." />
      <TextField name="programme" label="Programme" defaultValue={member?.programme} />
      <TextField name="level" label="Level" defaultValue={member?.level} />
      <TextField name="linkedin" label="LinkedIn link" defaultValue={member?.linkedin} />
      <ImageField name="photoUrl" label="Photo" folder="team" recordId={member?.id} defaultValue={member?.photoUrl} help="JPEG, PNG or WebP, up to 5 MB. Shown square, so a square photo fits best." />
      <CheckboxField name="active" label="Show on the public site" defaultChecked={member?.active ?? false} />
    </AdminForm>
  );
}
