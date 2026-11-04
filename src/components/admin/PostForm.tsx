import { savePost } from '@/app/admin/(protected)/posts/actions';
import type { Post } from '@/lib/content/types';
import { AdminForm } from './AdminForm';
import { MarkdownField, SelectField, TextArea, TextField } from './fields';

const STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

export function PostForm({ post }: { post?: Post }) {
  return (
    <AdminForm action={savePost.bind(null, post?.id ?? null)}>
      <TextField name="title" label="Title" defaultValue={post?.title} />
      <TextField name="slug" label="Slug" defaultValue={post?.slug} help="Used in the link. Leave empty to generate it from the title." />
      <TextArea name="excerpt" label="Excerpt" defaultValue={post?.excerpt} />
      <TextField name="author" label="Author" defaultValue={post?.author} />
      <TextField name="externalUrl" label="External link" defaultValue={post?.externalUrl} help="For a post on LinkedIn or AWS Builder Center. Leave the body empty." />
      <MarkdownField name="body" label="Body" defaultValue={post?.body} help="Markdown." />
      <SelectField name="status" label="Status" options={STATUSES} defaultValue={post?.status} />
    </AdminForm>
  );
}
