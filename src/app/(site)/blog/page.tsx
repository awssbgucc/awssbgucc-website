import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/PageIntro';
import { PostCard } from '@/components/site/PostCard';
import { Section } from '@/components/ui/Section';
import { getPosts } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Writing' };

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <Section>
      <PageIntro title="Writing" intro="Event recaps, build guides and notes from the group." />
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </Section>
  );
}
