import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostDetail } from '@/components/site/PostDetail';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Preview' };

type Props = { params: Promise<{ id: string }> };

export default async function PostPreviewPage({ params }: Props) {
  await requireRole();
  const post = await db.post.findUnique({ where: { id: (await params).id } });
  if (!post) notFound();
  return <PostDetail post={post} />;
}
