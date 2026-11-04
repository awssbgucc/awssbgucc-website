import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { PartnerForm } from '@/components/admin/PartnerForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deletePartner } from '../actions';

export const metadata: Metadata = { title: 'Edit partner' };

type Props = { params: Promise<{ id: string }> };

export default async function EditPartnerPage({ params }: Props) {
  await requireRole();
  const partner = await db.partner.findUnique({ where: { id: (await params).id } });
  if (!partner) notFound();
  return (
    <>
      <PageHeader title="Edit partner" />
      <PartnerForm partner={partner} />
      <div className="mt-10 border-t border-border pt-6">
        <ConfirmAction action={deletePartner.bind(null, partner.id)} label="Delete partner" question="This cannot be undone." />
      </div>
    </>
  );
}
