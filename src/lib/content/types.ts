// Shaped like the Prisma models in docs/ADMIN.md, so Phase 3 only swaps the data source.

export type Status = 'DRAFT' | 'PUBLISHED';
export type EventTag = 'BOOTCAMP' | 'BUILD' | 'TALK' | 'NETWORKING' | 'COMMUNITY_DAY';
export type EventFormat = 'IN_PERSON' | 'ONLINE';
export type RoleGroup = 'LEADER' | 'TECHNICAL' | 'EVENTS' | 'COMMUNITY';
export type PartnerType = 'CAMPUS' | 'SPONSOR' | 'COMMUNITY';

export type Event = {
  id: string;
  slug: string;
  title: string;
  tag: EventTag;
  format: EventFormat;
  startsAt: Date;
  endsAt: Date;
  venue: string | null;
  summary: string;
  body: string;
  meetupUrl: string | null;
  coverImage: string | null;
  photos: string[];
  attendance: number | null;
  recapPostId: string | null;
  status: Status;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  roleGroup: RoleGroup;
  programme: string | null;
  level: string | null;
  photoUrl: string | null;
  linkedin: string | null;
  order: number;
  active: boolean;
};

export type Partner = {
  id: string;
  name: string;
  type: PartnerType;
  logoUrl: string | null;
  url: string | null;
  description: string | null;
  order: number;
  status: Status;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string | null;
  externalUrl: string | null;
  coverImage: string | null;
  author: string;
  publishedAt: Date | null;
  status: Status;
};

export type SiteSettings = {
  email: string;
  meetupUrl: string;
  whatsappUrl: string | null;
  builderCenterUrl: string;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  xUrl: string | null;
  membersCount: number | null;
  departmentsCount: number | null;
  announcementText: string | null;
  announcementUrl: string | null;
  announcementActive: boolean;
  scdPageEnabled: boolean;
  uccCrestApproved: boolean;
};
