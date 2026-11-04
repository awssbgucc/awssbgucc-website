import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, PageHeader, StatusPill, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Posts' };

export default async function AdminPostsPage() {
  await requireRole();
  const posts = await db.post.findMany({ orderBy: { updatedAt: 'desc' } });
  return (
    <>
      <PageHeader title="Posts" action={{ href: '/admin/posts/new', label: 'New post' }} />
      {posts.length === 0 ? (
        <Empty>No posts yet.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Title</th>
                <th className={TH}>Author</th>
                <th className={TH}>Published</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className={TD}>
                    <Link href={`/admin/posts/${post.id}`} className={LINK}>
                      {post.title}
                    </Link>
                  </td>
                  <td className={TD}>{post.author}</td>
                  <td className={TD}>{post.publishedAt ? formatDate(post.publishedAt) : ''}</td>
                  <td className={TD}>
                    <StatusPill published={post.status === 'PUBLISHED'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
