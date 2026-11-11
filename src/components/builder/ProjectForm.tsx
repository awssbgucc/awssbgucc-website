import { saveMemberProject } from '@/app/builder/actions/projects';
import { AdminForm } from '@/components/admin/AdminForm';
import { ImageField, MarkdownField, TextArea, TextField } from '@/components/admin/fields';
import type { Project } from '@/generated/prisma/client';

export function MemberProjectForm({ project }: { project?: Project }) {
  return (
    <AdminForm action={saveMemberProject.bind(null, project?.id ?? null)} submitLabel={project ? 'Save changes' : 'Create draft'}>
      <TextField name="title" label="Title" defaultValue={project?.title} />
      <TextArea name="summary" label="Summary" defaultValue={project?.summary} help="One or two sentences. 200 characters at most." />
      <TextField name="stack" label="Built with" defaultValue={project?.stack.join(', ')} help="Separate with commas, for example Amazon S3, AWS Lambda, Next.js." />
      <TextField name="repoUrl" label="Repository link" defaultValue={project?.repoUrl} />
      <TextField name="demoUrl" label="Live link" defaultValue={project?.demoUrl} help="Optional." />
      <ImageField name="imageUrl" label="Screenshot or architecture diagram" folder="projects" recordId={project?.id} defaultValue={project?.imageUrl} help="Needed before the project can appear publicly. JPEG, PNG or WebP, up to 5 MB." />
      <MarkdownField name="body" label="Write-up" defaultValue={project?.body} help="Optional. What it does, how it is built, what you learnt." rows={10} />
    </AdminForm>
  );
}
