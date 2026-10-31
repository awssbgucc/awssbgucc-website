import type { MetadataRoute } from 'next';
import { publishedEvents, publishedPosts } from '@/lib/content/selectors';
import { events, posts } from '@/lib/content/static';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '',
    '/events',
    '/team',
    '/partners',
    '/blog',
    ...publishedEvents(events).map((event) => `/events/${event.slug}`),
    ...publishedPosts(posts)
      .filter((post) => !post.externalUrl)
      .map((post) => `/blog/${post.slug}`),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
