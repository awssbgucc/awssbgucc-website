import type { Metadata } from 'next';
import { PostForm } from '@/components/admin/PostForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New post' };

export default async function NewPostPage() {
  await requireRole();
  return (
    <>
      <PageHeader title="New post" />
      <PostForm />
    </>
  );
}
