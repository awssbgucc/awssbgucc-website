import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { PostForm } from '@/components/admin/PostForm';
import { LINK, PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deletePost } from '../actions';

export const metadata: Metadata = { title: 'Edit post' };

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireRole();
  const post = await db.post.findUnique({ where: { id: (await params).id } });
  if (!post) notFound();
  return (
    <>
      <PageHeader title="Edit post" />
      <Link href={`/admin/preview/posts/${post.id}`} className={`${LINK} mb-6 inline-flex min-h-11 items-center text-sm underline`}>
        Preview this post
      </Link>
      <PostForm post={post} />
      <div className="mt-10 border-t border-border pt-6">
        <ConfirmAction action={deletePost.bind(null, post.id)} label="Delete post" question="This cannot be undone." />
      </div>
    </>
  );
}
