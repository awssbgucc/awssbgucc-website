import { saveReward } from '@/app/admin/(protected)/rewards/actions';
import type { Reward } from '@/generated/prisma/client';
import { OPTIONS } from '@/lib/platform/customise';
import { AdminForm } from './AdminForm';
import { CheckboxField, SelectField, TextArea, TextField } from './fields';

const KINDS = [
  { value: 'BANNER', label: 'Profile banner (digital)' },
  { value: 'ACCENT', label: 'Accent colour (digital)' },
  { value: 'FRAME', label: 'Frame (digital)' },
  { value: 'TITLE', label: 'Title (digital)' },
  { value: 'PHYSICAL', label: 'Physical item, handed over by the team' },
  { value: 'OTHER', label: 'Other, handled by the team' },
];

const VALUES = [
  { value: '', label: 'Nothing (not a digital reward)' },
  ...Object.entries(OPTIONS).flatMap(([kind, options]) => options.filter((o) => !o.free).map((o) => ({ value: o.key, label: `${kind.toLowerCase()}: ${o.label}` }))),
];

export function RewardForm({ reward }: { reward?: Reward }) {
  return (
    <AdminForm action={saveReward.bind(null, reward?.id ?? null)}>
      <TextField name="name" label="Name" defaultValue={reward?.name} />
      <TextField name="slug" label="Slug" defaultValue={reward?.slug} help="Leave empty to generate it from the name." />
      <TextArea name="description" label="Description" defaultValue={reward?.description} />
      <SelectField name="kind" label="Kind" defaultValue={reward?.kind} options={KINDS} />
      <SelectField name="value" label="Gives the item" defaultValue={reward?.value ?? ''} options={VALUES} help="Digital rewards only. Choose the item of the same kind." />
      <TextField name="cost" label="Cost in credits" type="number" defaultValue={reward?.cost} />
      <TextField name="stock" label="Stock" type="number" defaultValue={reward?.stock} help="Leave empty for no limit. Physical items need a real count." />
      <TextField name="perMemberLimit" label="Limit per member" type="number" defaultValue={reward?.perMemberLimit ?? 1} />
      <CheckboxField
        name="available"
        label="Available to redeem"
        help="Only switch on a physical reward once the item exists and someone will hand it over. Never offer vouchers or prizes the group does not have."
        defaultChecked={reward?.available}
      />
    </AdminForm>
  );
}
