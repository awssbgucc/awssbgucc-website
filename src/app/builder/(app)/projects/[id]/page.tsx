import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { ProjectGuidance } from '@/components/builder/ProjectGuidance';
import { MemberProjectForm } from '@/components/builder/ProjectForm';
import { Panel } from '@/components/builder/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { db } from '@/lib/db';
import { requireMember } from '@/lib/member';
import { deleteMemberProject, submitProjectForReview } from '../../../actions/projects';

export const metadata: Metadata = { title: 'Edit project' };

type Props = { params: Promise<{ id: string }> };

const STATUS_HELP: Record<string, string> = {
  DRAFT: 'Only you can see this draft. Submit it for review when it is ready.',
  PENDING: 'Your project is in review. You can still make edits while waiting.',
  APPROVED: 'Published on the public projects page. Saving edits will send it back for review.',
  REJECTED: 'Not approved yet. Read the reviewer note below, update your project and submit again.',
};

export default async function EditProjectPage({ params }: Props) {
  const { user } = await requireMember();
  const { id } = await params;
  const project = await db.project.findFirst({ where: { id, ownerId: user.id } });
  if (!project) notFound();
  const canSubmit = project.status === 'DRAFT' || project.status === 'REJECTED';

  return (
    <>
      <Link href="/builder/projects" className="type-label inline-flex min-h-11 items-center text-text-muted hover:text-text-strong">
        Your projects
      </Link>
      <div className="mt-2 mb-8 flex flex-wrap items-center gap-3">
        <h1 className="type-section">{project.title}</h1>
        <StatusBadge status={project.status} />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <MemberProjectForm project={project} />
        <div className="flex flex-col gap-6">
          <Panel title="Status">
            <p className="text-sm text-text-muted">{STATUS_HELP[project.status]}</p>
            {project.reviewNote && (
              <p className="mt-3 rounded-sm border border-border-strong p-3 text-sm text-text-strong">
                <span className="type-label block text-text-muted">Reviewer note</span>
                {project.reviewNote}
              </p>
            )}
            {canSubmit && (
              <form action={submitProjectForReview.bind(null, project.id)} className="mt-4">
                <button type="submit" disabled={!project.imageUrl} className="inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
                  Submit for review
                </button>
                {!project.imageUrl && <p className="mt-2 text-xs text-text-muted">Upload an image before submitting.</p>}
              </form>
            )}
            {project.status === 'APPROVED' && (
              <Link href={`/projects/${project.slug}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
                View public page
              </Link>
            )}
          </Panel>
          <ProjectGuidance />
          <div className="border-t border-border pt-4">
            <ConfirmAction action={deleteMemberProject.bind(null, project.id)} label="Delete project" question="This permanently removes the project from your account and the public site." />
          </div>
        </div>
      </div>
    </>
  );
}
