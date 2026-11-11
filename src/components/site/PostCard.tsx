import Image from 'next/image';
import Link from 'next/link';
import { externalLabel } from '@/lib/content/selectors';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import { focusFor } from '@/lib/content/media';

export function PostCard({ post, feature = false }: { post: Post; feature?: boolean }) {
  const href = post.externalUrl ?? `/blog/${post.slug}`;
  const external = !!post.externalUrl;
  return (
    <article className={`post-card ${feature ? 'post-card-feature' : ''} ${post.coverImage ? '' : 'post-card-plain'}`}>
      {post.coverImage && (
        <div className="post-cover">
          <Image src={post.coverImage} alt="" fill sizes={feature ? '(min-width: 1024px) 55vw, 100vw' : '(min-width: 768px) 40vw, 100vw'} style={{ objectPosition: focusFor(post.coverImage) }} />
        </div>
      )}
      <div className="post-text">
        <p className="type-label text-text-muted">
          {post.publishedAt ? formatDate(post.publishedAt) : 'Community notes'}
          {external ? ` / ${externalLabel(post.externalUrl!)}` : ''}
        </p>
        <h2>
          {external ? <a href={href} className="stretched">{post.title}</a> : <Link href={href} className="stretched">{post.title}</Link>}
        </h2>
        <p className="post-excerpt">{post.excerpt}</p>
        <p className="post-by">{post.author}<span>{external ? 'Read the original' : 'Read the story'}</span></p>
      </div>
    </article>
  );
}
