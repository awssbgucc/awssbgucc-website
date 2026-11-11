import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import { Markdown } from './Markdown';

export function PostDetail({ post }: { post: Post }) {
  return (
    <article className="reading-article">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link href="/blog">Writing</Link>
        <span aria-hidden="true">/</span>
        <span>Community notes</span>
      </nav>
      <h1>{post.title}</h1>
      <p className="reading-lead">{post.excerpt}</p>
      <p className="reading-byline">{post.author}{post.publishedAt && ` / ${formatDate(post.publishedAt)}`}</p>
      {post.coverImage && (
        <div className="reading-cover" data-reveal="mask">
          <Image src={post.coverImage} alt="" fill priority sizes="(min-width: 1024px) 960px, 100vw" />
        </div>
      )}
      {post.body && <Markdown>{post.body}</Markdown>}
    </article>
  );
}
