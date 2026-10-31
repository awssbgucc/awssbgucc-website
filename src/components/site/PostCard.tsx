import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { externalLabel } from '@/lib/content/selectors';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function PostCard({ post }: { post: Post }) {
  const linkClass = 'underline-offset-4 hover:underline';
  return (
    <Card>
      <h2 className="text-lg font-semibold">
        {post.externalUrl ? (
          <a href={post.externalUrl} className={linkClass}>
            {post.title}
          </a>
        ) : (
          <Link href={`/blog/${post.slug}`} className={linkClass}>
            {post.title}
          </Link>
        )}
      </h2>
      <p className="mt-2 text-text-muted">{post.excerpt}</p>
      <p className="mt-3 text-sm font-medium text-text-muted">
        {post.author}
        {post.publishedAt && `, ${formatDate(post.publishedAt)}`}
        {post.externalUrl && `, on ${externalLabel(post.externalUrl)}`}
      </p>
    </Card>
  );
}
