import { savePartner } from '@/app/admin/(protected)/partners/actions';
import type { Partner } from '@/lib/content/types';
import { AdminForm } from './AdminForm';
import { SelectField, TextField } from './fields';

const TYPES = [
  { value: 'CAMPUS', label: 'Campus partner' },
  { value: 'SPONSOR', label: 'Sponsor' },
  { value: 'COMMUNITY', label: 'Community partner' },
];

const STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

export function PartnerForm({ partner }: { partner?: Partner }) {
  return (
    <AdminForm action={savePartner.bind(null, partner?.id ?? null)}>
      <TextField name="name" label="Name" defaultValue={partner?.name} />
      <SelectField name="type" label="Type" options={TYPES} defaultValue={partner?.type} />
      <TextField name="url" label="Link" defaultValue={partner?.url} />
      <TextField name="description" label="Description" defaultValue={partner?.description} help="One line on what they do with us." />
      <SelectField name="status" label="Status" options={STATUSES} defaultValue={partner?.status} />
    </AdminForm>
  );
}
