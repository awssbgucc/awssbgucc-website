import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminProjectForm } from '@/components/admin/AdminProjectForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { LINK, PageHeader } from '@/components/admin/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteAdminProject } from '../actions';

export const metadata: Metadata = { title: 'Edit project' };

type Props = { params: Promise<{ id: string }> };

export default async function EditAdminProjectPage({ params }: Props) {
  const admin = await requireRole();
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, include: { owner: { select: { id: true, email: true, profile: { select: { displayName: true } } } } } });
  if (!project) notFound();
  return (
    <>
      <Link href="/admin/projects" className={`${LINK} mb-2 inline-flex min-h-11 items-center text-sm`}>
        All projects
      </Link>
      <PageHeader title={project.title} />
      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <StatusBadge status={project.status} />
        {project.owner ? (
          <span>
            By{' '}
            <Link href={`/admin/members/${project.owner.id}`} className={LINK}>
              {project.owner.profile?.displayName ?? project.owner.email}
            </Link>
          </span>
        ) : (
          <span>Curated by the core team</span>
        )}
        {project.reviewedBy && <span>Last reviewed by {project.reviewedBy}</span>}
        {project.status === 'APPROVED' && (
          <Link href={`/projects/${project.slug}`} className={LINK}>
            Public page
          </Link>
        )}
      </div>
      <AdminProjectForm project={project} />
      {admin.role === 'ADMIN' && (
        <div className="mt-10 border-t border-border pt-6">
          <ConfirmAction action={deleteAdminProject.bind(null, project.id)} label="Delete project" question="This removes it everywhere." />
        </div>
      )}
    </>
  );
}
