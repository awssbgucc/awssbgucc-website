import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CertificationForm } from '@/components/admin/CertificationForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteCertification } from '../actions';

export const metadata: Metadata = { title: 'Edit certification' };

type Props = { params: Promise<{ id: string }> };

export default async function EditCertificationPage({ params }: Props) {
  await requireRole();
  const certification = await db.memberCertification.findUnique({ where: { id: (await params).id } });
  if (!certification) notFound();
  return (
    <>
      <PageHeader title="Edit certification" />
      <CertificationForm certification={certification} />
      <div className="mt-10 border-t border-border pt-6">
        <ConfirmAction
          action={deleteCertification.bind(null, certification.id)}
          label="Delete certification"
          question="This cannot be undone."
        />
      </div>
    </>
  );
}
