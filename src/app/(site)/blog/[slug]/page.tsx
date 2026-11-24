import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsletterBand } from '@/components/site/NewsletterBand';
import { PostDetail } from '@/components/site/PostDetail';
import { Container } from '@/components/ui/Container';
import { getEvents, getPosts, getSitePost } from '@/lib/content/queries';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).filter((post) => !post.externalUrl).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getSitePost((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, posts, events] = await Promise.all([getSitePost(slug), getPosts(), getEvents()]);
  if (!post) notFound();

  const relatedEvent = events.find((event) => event.recapPostId === post.id) ?? null;
  const sitePosts = posts.filter((p) => !p.externalUrl);
  const index = sitePosts.findIndex((p) => p.id === post.id);
  const previous = index > 0 ? sitePosts[index - 1] : null;
  const next = index >= 0 && index < sitePosts.length - 1 ? sitePosts[index + 1] : null;

  return (
    <>
      <section className="band band-top">
        <Container>
          <PostDetail
            post={post}
            relatedEvent={
              relatedEvent
                ? {
                    slug: relatedEvent.slug,
                    title: relatedEvent.title,
                    startsAt: relatedEvent.startsAt,
                    venue: relatedEvent.venue,
                  }
                : null
            }
            previous={previous ? { slug: previous.slug, title: previous.title } : null}
            next={next ? { slug: next.slug, title: next.title } : null}
          />
        </Container>
      </section>

      <NewsletterBand source="blog-post" surface="alt" />
    </>
  );
}
