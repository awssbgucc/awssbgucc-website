import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageIntro } from '@/components/site/PageIntro';
import { PostCard } from '@/components/site/PostCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPosts } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Writing', description: 'Session recaps and notes from the AWS Student Builder Group at University of Cape Coast.' };

export default async function BlogPage() {
  const posts = await getPosts();
  const [first, ...rest] = posts;
  return (
    <section className="band band-top">
      <Container>
        <PageIntro label="Recaps and notes" title="Writing" intro="What happened at our sessions, in our own words, and what we learned along the way." />
        {/* TODO(joel): confirm this empty state line (W9 in tasks/todo.md). */}
        {!first ? (
          <EmptyState label="No posts yet">Recaps and build notes will appear here once they have been reviewed.</EmptyState>
        ) : (
          <>
            <PostCard post={first} feature />
            {rest.length > 0 && <div className="post-grid">{rest.map((post) => <PostCard key={post.id} post={post} />)}</div>}
          </>
        )}
      </Container>
    </section>
  );
}
