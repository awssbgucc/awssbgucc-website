import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTitle } from '@/components/builder/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { requireMember } from '@/lib/member';

export const metadata: Metadata = { title: 'Your projects' };

export default async function MyProjectsPage() {
  const { user } = await requireMember();
  const projects = await db.project.findMany({ where: { ownerId: user.id }, orderBy: { updatedAt: 'desc' } });
  return (
    <>
      <PageTitle
        label="Projects"
        title="Your projects"
        intro="Write up something you built. Once a reviewer approves it, it appears on the public projects page."
        action={<Button href="/builder/projects/new">Add a project</Button>}
      />
      {projects.length === 0 ? (
        <EmptyState label="No projects yet" action={<Button href="/builder/projects/new">Add a project</Button>}>
          Start a draft. Nothing is public until you submit it and a reviewer approves it.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/builder/projects/${project.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors duration-150 ease-brand hover:bg-card/60">
                <span className="min-w-0">
                  <span className="block font-semibold text-white">{project.title}</span>
                  <span className="type-label block text-text-muted">Updated {formatDate(project.updatedAt)}</span>
                </span>
                <StatusBadge status={project.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
