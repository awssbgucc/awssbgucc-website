import type { Metadata } from 'next';
import { CertificationForm } from '@/components/admin/CertificationForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New certification' };

export default async function NewCertificationPage() {
  await requireRole();
  return (
    <>
      <PageHeader title="New certification" />
      <CertificationForm />
    </>
  );
}
