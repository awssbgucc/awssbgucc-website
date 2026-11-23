import { saveCertification } from '@/app/admin/(protected)/certifications/actions';
import type { MemberCertification } from '@/lib/content/types';
import { CERT_LEVELS, CERT_PATHWAYS } from '@/lib/validation/certification';
import { AdminForm } from './AdminForm';
import { SelectField, TextField } from './fields';

const STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

export function CertificationForm({ certification }: { certification?: MemberCertification }) {
  return (
    <AdminForm action={saveCertification.bind(null, certification?.id ?? null)}>
      <TextField name="memberName" label="Member name" defaultValue={certification?.memberName} />
      <TextField name="programme" label="Programme" defaultValue={certification?.programme} help="For example, BSc Computer Science. Optional." />
      <TextField name="levelOfStudy" label="Level" defaultValue={certification?.levelOfStudy} help="For example, Level 300. Optional." />
      <TextField name="certName" label="Certification name" defaultValue={certification?.certName} help="For example, AWS Certified Cloud Practitioner." />
      <TextField name="certCode" label="Exam code" defaultValue={certification?.certCode} help="For example, CLF-C02. Optional." />
      <SelectField name="certLevel" label="Level tier" options={CERT_LEVELS} defaultValue={certification?.certLevel ?? 'FOUNDATIONAL'} />
      <SelectField
        name="pathway"
        label="How they prepared (optional)"
        options={CERT_PATHWAYS}
        defaultValue={certification?.pathway ?? ''}
        help="Credit partner training accurately, such as AmaliTech training or self-study."
      />
      <TextField
        name="credlyUrl"
        label="Credly verification link"
        defaultValue={certification?.credlyUrl}
        help="Full badge URL starting with https://www.credly.com/badges/"
      />
      <TextField
        name="earnedAt"
        label="Date earned"
        type="date"
        defaultValue={certification?.earnedAt ? certification.earnedAt.toISOString().slice(0, 10) : ''}
        help="Optional."
      />
      <SelectField name="status" label="Status" options={STATUSES} defaultValue={certification?.status ?? 'DRAFT'} />
    </AdminForm>
  );
}
