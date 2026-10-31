import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/PageIntro';
import { PostCard } from '@/components/site/PostCard';
import { Section } from '@/components/ui/Section';
import { publishedPosts } from '@/lib/content/selectors';
import { posts } from '@/lib/content/static';

export const metadata: Metadata = { title: 'Writing' };

export default function BlogPage() {
  return (
    <Section>
      <PageIntro title="Writing" intro="Event recaps, build guides and notes from the group." />
      <div className="grid gap-4 md:grid-cols-2">
        {publishedPosts(posts).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </Section>
  );
}
