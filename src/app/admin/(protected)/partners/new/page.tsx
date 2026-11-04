import type { Metadata } from 'next';
import { PartnerForm } from '@/components/admin/PartnerForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New partner' };

export default async function NewPartnerPage() {
  await requireRole();
  return (
    <>
      <PageHeader title="New partner" />
      <PartnerForm />
    </>
  );
}
