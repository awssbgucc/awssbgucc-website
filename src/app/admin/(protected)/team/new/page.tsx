import type { Metadata } from 'next';
import { MemberForm } from '@/components/admin/MemberForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New member' };

export default async function NewMemberPage() {
  await requireRole();
  return (
    <>
      <PageHeader title="New member" />
      <MemberForm />
    </>
  );
}
