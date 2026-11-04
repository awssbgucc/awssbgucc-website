import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { MemberForm } from '@/components/admin/MemberForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteMember } from '../actions';

export const metadata: Metadata = { title: 'Edit member' };

type Props = { params: Promise<{ id: string }> };

export default async function EditMemberPage({ params }: Props) {
  await requireRole();
  const member = await db.teamMember.findUnique({ where: { id: (await params).id } });
  if (!member) notFound();
  return (
    <>
      <PageHeader title="Edit member" />
      <MemberForm member={member} />
      <div className="mt-10 border-t border-border pt-6">
        <ConfirmAction action={deleteMember.bind(null, member.id)} label="Delete member" question="This cannot be undone." />
      </div>
    </>
  );
}
