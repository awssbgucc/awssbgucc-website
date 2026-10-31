import Image from 'next/image';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import { Markdown } from './Markdown';

export function PostDetail({ post }: { post: Post }) {
  return (
    <article>
      <h1 className="type-section max-w-[24ch]">{post.title}</h1>
      <p className="mt-4 text-sm font-medium text-text-muted">
        {post.author}
        {post.publishedAt && `, ${formatDate(post.publishedAt)}`}
      </p>
      {post.coverImage && (
        <div className="relative mt-8 aspect-video max-w-3xl overflow-hidden rounded-md">
          <Image src={post.coverImage} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}
      {post.body && (
        <div className="mt-8">
          <Markdown>{post.body}</Markdown>
        </div>
      )}
    </article>
  );
}
