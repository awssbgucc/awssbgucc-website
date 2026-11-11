import type { Metadata } from 'next';
import { ProjectGuidance } from '@/components/builder/ProjectGuidance';
import { MemberProjectForm } from '@/components/builder/ProjectForm';
import { PageTitle } from '@/components/builder/ui';
import { requireMember } from '@/lib/member';

export const metadata: Metadata = { title: 'Add a project' };

export default async function NewProjectPage() {
  await requireMember();
  return (
    <>
      <PageTitle label="Projects" title="Add a project" intro="Save a draft first. Then you can add an image and submit it for review." />
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <MemberProjectForm />
        <ProjectGuidance />
      </div>
    </>
  );
}
