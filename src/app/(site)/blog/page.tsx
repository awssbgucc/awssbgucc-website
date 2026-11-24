import type { Metadata } from 'next';
import { NewsletterBand } from '@/components/site/NewsletterBand';
import { PageIntro } from '@/components/site/PageIntro';
import { PostBrowser, type PostBrowserItem } from '@/components/site/PostBrowser';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { getEvents, getPosts } from '@/lib/content/queries';
import { estimateReadingTime, postCategory } from '@/lib/content/reading';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Detailed session recaps and notes from the AWS Student Builder Group at University of Cape Coast.',
};

export default async function BlogPage() {
  const [posts, events] = await Promise.all([getPosts(), getEvents()]);
  const eventByRecapId = new Map(
    events.filter((event) => event.recapPostId).map((event) => [event.recapPostId!, event]),
  );

  const items: PostBrowserItem[] = posts.map((post) => {
    const linkedEvent = eventByRecapId.get(post.id) ?? null;
    const reading = estimateReadingTime(post.body);
    const category = postCategory(post, !!linkedEvent);
    return {
      post,
      readingTime: reading.label,
      categoryKey: category.key,
      categoryLabel: category.label,
      tone: category.tone,
      eventTitle: linkedEvent ? linkedEvent.title.split(':')[0] : null,
    };
  });

  const totalMinutes = posts
    .filter((post) => !post.externalUrl)
    .reduce((sum, post) => sum + estimateReadingTime(post.body).minutes, 0);

  return (
    <>
      <section className="band band-top">
        <Container>
          <PageIntro
            label="Recaps and notes"
            title="Writing"
            intro="Detailed recaps from our campus sessions, career conversations, and hands-on workshops at the University of Cape Coast."
          >
            {posts.length > 0 && (
              <dl className="intro-stats">
                <div>
                  <dt>Articles</dt>
                  <dd>{posts.length}</dd>
                </div>
                {totalMinutes > 0 && (
                  <div>
                    <dt>Reading time</dt>
                    <dd>{totalMinutes} min</dd>
                  </div>
                )}
              </dl>
            )}
          </PageIntro>

          {/* TODO(joel): confirm this empty state line (W9 in tasks/todo.md). */}
          {items.length === 0 ? (
            <EmptyState label="No posts yet">Recaps from our sessions will be posted here.</EmptyState>
          ) : (
            <PostBrowser items={items} />
          )}
        </Container>
      </section>

      <NewsletterBand source="blog" surface="alt" />
    </>
  );
}
