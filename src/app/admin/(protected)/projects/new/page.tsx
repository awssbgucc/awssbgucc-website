import type { Metadata } from 'next';
import { AdminProjectForm } from '@/components/admin/AdminProjectForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New project' };

export default async function NewAdminProjectPage() {
  await requireRole();
  return (
    <>
      <PageHeader title="Add a curated project" />
      <p className="mb-8 max-w-[62ch] text-text-muted">For work built at a group session or by the core team. Save first, then add the image and approve it.</p>
      <AdminProjectForm />
    </>
  );
}
