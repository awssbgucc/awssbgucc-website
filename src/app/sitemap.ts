import type { MetadataRoute } from 'next';
import { getEvents, getPosts, getProjects, getSiteSettings } from '@/lib/content/queries';
import { db } from '@/lib/db';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, posts, projects, settings, profiles] = await Promise.all([
    getEvents(),
    getPosts(),
    getProjects(),
    getSiteSettings(),
    db.memberProfile.findMany({ where: { visibility: 'PUBLIC', allowIndexing: true, status: 'ACTIVE' }, select: { handle: true } }),
  ]);
  const paths = [
    '',
    '/about',
    '/events',
    '/projects',
    '/team',
    '/partners',
    '/blog',
    '/contact',
    '/privacy',
    '/code-of-conduct',
    ...(settings.scdPageEnabled ? ['/scd'] : []),
    ...projects.map((project) => `/projects/${project.slug}`),
    ...profiles.map((profile) => `/builders/${profile.handle}`),
    ...events.map((event) => `/events/${event.slug}`),
    ...posts.filter((post) => !post.externalUrl).map((post) => `/blog/${post.slug}`),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
