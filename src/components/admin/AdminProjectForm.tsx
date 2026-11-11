import { saveAdminProject } from '@/app/admin/(protected)/projects/actions';
import type { Project } from '@/generated/prisma/client';
import { AdminForm } from './AdminForm';
import { CheckboxField, ImageField, MarkdownField, SelectField, TextArea, TextField } from './fields';

export function AdminProjectForm({ project }: { project?: Project }) {
  const memberOwned = !!project?.ownerId;
  return (
    <AdminForm action={saveAdminProject.bind(null, project?.id ?? null)}>
      <TextField name="title" label="Title" defaultValue={project?.title} />
      <TextField name="slug" label="Slug" defaultValue={project?.slug} help="Leave empty to generate it from the title." />
      <TextArea name="summary" label="Summary" defaultValue={project?.summary} help="200 characters at most." />
      <TextField name="stack" label="Built with" defaultValue={project?.stack.join(', ')} help="Separate with commas." />
      <TextField name="repoUrl" label="Repository link" defaultValue={project?.repoUrl} />
      <TextField name="demoUrl" label="Live link" defaultValue={project?.demoUrl} />
      {!memberOwned && <TextField name="credits" label="Built by" defaultValue={project?.credits} help="Only name people who agreed to be named." />}
      <ImageField name="imageUrl" label="Image" folder="projects" recordId={project?.id} defaultValue={project?.imageUrl} help="Needed before approval. JPEG, PNG or WebP, up to 5 MB." />
      <MarkdownField name="body" label="Write-up" defaultValue={project?.body} rows={10} />
      <CheckboxField name="featured" label="Feature on the home page" defaultChecked={project?.featured} />
      <SelectField
        name="status"
        label="Status"
        defaultValue={project?.status ?? 'DRAFT'}
        options={[
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PENDING', label: 'In review' },
          { value: 'APPROVED', label: 'Approved, shown publicly' },
          { value: 'REJECTED', label: 'Not approved' },
        ]}
        help={memberOwned ? 'Changing this to Approved or Not approved notifies the member and pays the award once.' : undefined}
      />
      {memberOwned && <TextArea name="reviewNote" label="Note to the member" defaultValue={project?.reviewNote} help="Shown to the member with the decision." />}
    </AdminForm>
  );
}
