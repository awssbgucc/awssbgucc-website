import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/components/site/motion/TransitionLink';
import { focusFor } from '@/lib/content/media';
import { estimateReadingTime, extractHeadings, postCategory } from '@/lib/content/reading';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import { Cta } from './Cta';
import { Markdown } from './Markdown';
import { ReadingProgress, ReadingToc, SharePostButton } from './ReadingTools';

type RelatedEvent = {
  slug: string;
  title: string;
  startsAt: Date;
  venue: string | null;
};

type NeighbourPost = {
  slug: string;
  title: string;
};

export function PostDetail({
  post,
  relatedEvent = null,
  previous = null,
  next = null,
}: {
  post: Post;
  relatedEvent?: RelatedEvent | null;
  previous?: NeighbourPost | null;
  next?: NeighbourPost | null;
}) {
  const headings = extractHeadings(post.body);
  const reading = estimateReadingTime(post.body);
  const category = postCategory(post, !!relatedEvent);
  const hasAside = headings.length >= 2 || !!relatedEvent;

  return (
    <article className="reading-article">
      <ReadingProgress />

      <nav aria-label="Breadcrumb" className="crumbs">
        <Link href="/blog">Writing</Link>
        <span aria-hidden="true">/</span>
        <span>{post.title}</span>
      </nav>

      <header className="reading-header">
        <p className="type-label reading-kind">
          <span className={`swatch swatch-${category.tone}`} aria-hidden="true" />
          <span>{category.label}</span>
        </p>
        <h1 data-vt-dest="title">{post.title}</h1>
        <p className="reading-lead">{post.excerpt}</p>
        <div className="reading-meta">
          <p className="reading-byline">
            <span>{post.author}</span>
            {post.publishedAt && (
              <>
                <span aria-hidden="true">/</span>
                <span>{formatDate(post.publishedAt)}</span>
              </>
            )}
            {reading.label && (
              <>
                <span aria-hidden="true">/</span>
                <span>{reading.label}</span>
              </>
            )}
          </p>
          <SharePostButton />
        </div>
      </header>

      {post.coverImage && (
        <div className="reading-cover" data-reveal="mask" data-vt-dest="art">
          <Image
            src={post.coverImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            style={{ objectPosition: focusFor(post.coverImage) }}
          />
        </div>
      )}

      {headings.length >= 2 && (
        <details className="reading-toc-mobile">
          <summary>
            <span className="type-label text-text-strong">On this page</span>
            <span className="type-label text-text-muted">{headings.length} sections</span>
          </summary>
          <ol className="reading-toc-mobile-list">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'reading-toc-sub' : undefined}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className={`reading-layout ${hasAside ? 'reading-layout-with-aside' : ''}`.trim()}>
        <div className="reading-main min-w-0">
          {post.body && <Markdown headingAnchors>{post.body}</Markdown>}

          <div className="reading-foot">
            <Link href="/blog" className="reading-back">
              <ArrowLeft size={16} aria-hidden />
              <span>Back to all articles</span>
            </Link>
            <SharePostButton />
          </div>
        </div>

        {hasAside && (
          <aside className="reading-aside">
            {headings.length >= 2 && <ReadingToc headings={headings} />}
            {relatedEvent && (
              <section className="reading-event-card" aria-labelledby="related-event-heading">
                <p id="related-event-heading" className="type-label text-text-muted">
                  Related event
                </p>
                <h2>{relatedEvent.title}</h2>
                <p className="reading-event-meta">
                  {formatDate(relatedEvent.startsAt)} / {relatedEvent.venue ?? 'Online'}
                </p>
                <Cta href={`/events/${relatedEvent.slug}`} variant="arrow">
                  View event details
                </Cta>
              </section>
            )}
          </aside>
        )}
      </div>

      {(previous || next) && (
        <nav className="event-pager" aria-label="More articles">
          {previous ? (
            <Link href={`/blog/${previous.slug}`} className="pager-link">
              <span className="type-label">Previous article</span>
              <span>{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/blog/${next.slug}`} className="pager-link pager-next">
              <span className="type-label">Next article</span>
              <span>{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
