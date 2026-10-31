import { cache } from 'react';
import { db } from '@/lib/db';

// Everything here is for the public site, so it reads published and active records only.

export const getSiteSettings = cache(async () => {
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error('Site settings are missing. Run pnpm db:seed.');
  return settings;
});

export const getEvents = cache(() => db.event.findMany({ where: { status: 'PUBLISHED' } }));

export const getEvent = cache((slug: string) => db.event.findFirst({ where: { slug, status: 'PUBLISHED' } }));

export const getTeam = cache(() => db.teamMember.findMany({ where: { active: true }, orderBy: { order: 'asc' } }));

export const getPartners = cache(() => db.partner.findMany({ where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' } }));

export const getPosts = cache(() =>
  db.post.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: { sort: 'desc', nulls: 'last' } } }),
);

// External posts link out from the list, so they have no page here.
export const getSitePost = cache((slug: string) =>
  db.post.findFirst({ where: { slug, status: 'PUBLISHED', externalUrl: null } }),
);
