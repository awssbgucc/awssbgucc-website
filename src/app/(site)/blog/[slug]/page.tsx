import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostDetail } from '@/components/site/PostDetail';
import { Section } from '@/components/ui/Section';
import { publishedPosts } from '@/lib/content/selectors';
import { posts } from '@/lib/content/static';

type Props = { params: Promise<{ slug: string }> };

// External posts link out from the list, so they have no page here.
function sitePosts() {
  return publishedPosts(posts).filter((post) => !post.externalUrl);
}

export function generateStaticParams() {
  return sitePosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = sitePosts().find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = sitePosts().find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <Section>
      <PostDetail post={post} />
    </Section>
  );
}
