import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostDetail } from '@/components/site/PostDetail';
import { Container } from '@/components/ui/Container';
import { getPosts, getSitePost } from '@/lib/content/queries';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).filter((post) => !post.externalUrl).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getSitePost((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getSitePost((await params).slug);
  if (!post) notFound();
  return (
    <section className="band band-top">
      <Container>
        <PostDetail post={post} />
      </Container>
    </section>
  );
}
