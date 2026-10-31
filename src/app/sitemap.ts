import type { MetadataRoute } from 'next';
import { getEvents, getPosts } from '@/lib/content/queries';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, posts] = await Promise.all([getEvents(), getPosts()]);
  const paths = [
    '',
    '/events',
    '/team',
    '/partners',
    '/blog',
    ...events.map((event) => `/events/${event.slug}`),
    ...posts.filter((post) => !post.externalUrl).map((post) => `/blog/${post.slug}`),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
