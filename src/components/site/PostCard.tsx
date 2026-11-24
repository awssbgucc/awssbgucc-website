import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/components/site/motion/TransitionLink';
import { focusFor } from '@/lib/content/media';
import { estimateReadingTime, type PostCategory } from '@/lib/content/reading';
import { externalLabel } from '@/lib/content/selectors';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function PostCard({
  post,
  feature = false,
  readingTime,
  categoryLabel,
  tone,
  eventTitle,
}: {
  post: Post;
  feature?: boolean;
  readingTime?: string;
  categoryLabel?: string;
  tone?: PostCategory['tone'];
  eventTitle?: string;
}) {
  const href = post.externalUrl ?? `/blog/${post.slug}`;
  const external = !!post.externalUrl;
  const resolvedCategory = categoryLabel ?? (external ? 'External' : 'Community notes');
  const resolvedTone = tone ?? (external ? 'magenta' : 'blue');
  const resolvedReadingTime = readingTime ?? estimateReadingTime(post.body).label;
  const metaRight = [post.publishedAt ? formatDate(post.publishedAt) : null, resolvedReadingTime || null].filter(Boolean).join(' / ');
  const ActionIcon = external ? ArrowUpRight : ArrowRight;

  return (
    <article
      className={`post-card ${feature ? 'post-card-feature' : ''} ${post.coverImage ? '' : 'post-card-plain'} post-tone-${resolvedTone}`}
      data-vt-source=""
    >
      {post.coverImage && (
        <div className="post-cover" data-vt="art">
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes={feature ? '(min-width: 1024px) 55vw, 100vw' : '(min-width: 768px) 40vw, 100vw'}
            style={{ objectPosition: focusFor(post.coverImage) }}
          />
        </div>
      )}
      <div className="post-text">
        <div className="post-meta-top">
          <p className="flex items-center gap-2 type-label text-text-muted">
            <span className={`swatch swatch-${resolvedTone}`} aria-hidden="true" />
            <span>
              {resolvedCategory}
              {external ? ` / ${externalLabel(post.externalUrl!)}` : ''}
            </span>
          </p>
          {metaRight && <span className="type-label text-text-muted">{metaRight}</span>}
        </div>
        <h2>
          {external ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="stretched">
              {post.title}
            </a>
          ) : (
            <Link href={href} className="stretched">
              {post.title}
            </Link>
          )}
        </h2>
        <p className="post-excerpt">{post.excerpt}</p>
        {eventTitle && <p className="post-event-ref">From {eventTitle}</p>}
        <p className="post-by">
          <span>{post.author}</span>
          <span className="post-read-cta">
            <span>{external ? 'Read original' : 'Read article'}</span>
            <ActionIcon size={15} aria-hidden className="post-read-arrow" />
          </span>
        </p>
      </div>
    </article>
  );
}
