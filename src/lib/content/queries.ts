import { cache } from 'react';
import { db } from '@/lib/db';
import { DEFAULT_SOCIAL_URLS } from '@/lib/site';

// Everything here is for the public site, so it reads published and active records only.

export const getSiteSettings = cache(async () => {
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error('Site settings are missing. Run pnpm db:seed.');
  return {
    ...settings,
    whatsappUrl: settings.whatsappUrl ?? DEFAULT_SOCIAL_URLS.whatsapp,
    linkedinUrl: settings.linkedinUrl ?? DEFAULT_SOCIAL_URLS.linkedin,
    instagramUrl: settings.instagramUrl ?? DEFAULT_SOCIAL_URLS.instagram,
    xUrl: settings.xUrl ?? DEFAULT_SOCIAL_URLS.x,
  };
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

// Projects are public only once approved. The owner is named only if their profile is public.
export const getProjects = cache(() =>
  db.project.findMany({
    where: { status: 'APPROVED' },
    orderBy: [{ featured: 'desc' }, { reviewedAt: 'desc' }],
    include: { owner: { select: { profile: { select: { displayName: true, handle: true, visibility: true, status: true } } } } },
  }),
);

export const getProject = cache((slug: string) =>
  db.project.findFirst({
    where: { slug, status: 'APPROVED' },
    include: { owner: { select: { profile: { select: { displayName: true, handle: true, visibility: true, status: true } } } } },
  }),
);

export const getPublicResources = cache((eventId: string) =>
  db.eventResource.findMany({ where: { eventId, access: 'PUBLIC' }, orderBy: { order: 'asc' } }),
);

export const getAllPublicResources = cache(() =>
  db.eventResource.findMany({
    where: { access: 'PUBLIC', event: { status: 'PUBLISHED' } },
    orderBy: [{ event: { startsAt: 'desc' } }, { order: 'asc' }],
    include: { event: { select: { slug: true, title: true, startsAt: true, tag: true } } },
  }),
);

/** Check-ins per event, for the public attendance figure where none was entered by hand. */
export const getCheckInCounts = cache(async () => {
  const rows = await db.checkIn.groupBy({ by: ['eventId'], _count: true });
  return new Map(rows.map((row) => [row.eventId, row._count]));
});

export const getActivityTotals = cache(async () => {
  const [checkIns, projects] = await Promise.all([db.checkIn.count(), db.project.count({ where: { status: 'APPROVED' } })]);
  return { checkIns, projects };
});

export const getScd = cache(async () => {
  const [sessions, speakers, faqs, sponsors] = await Promise.all([
    db.scdSession.findMany({ orderBy: [{ startsAt: 'asc' }, { order: 'asc' }] }),
    db.scdSpeaker.findMany({ where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' } }),
    db.scdFaq.findMany({ orderBy: { order: 'asc' } }),
    db.partner.findMany({ where: { status: 'PUBLISHED', type: 'SPONSOR' }, orderBy: { order: 'asc' } }),
  ]);
  return { sessions, speakers, faqs, sponsors };
});

export const getPublicProfile = cache((handle: string) =>
  db.memberProfile.findFirst({ where: { handle, visibility: 'PUBLIC', status: 'ACTIVE', onboardedAt: { not: null } } }),
);
