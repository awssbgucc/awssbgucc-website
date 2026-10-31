import type { Event, Partner, Post, SiteSettings, TeamMember } from './types';

export const siteSettings: SiteSettings = {
  // TODO(joel): confirm this over the older awsbuildergroup.ucc@gmail.com
  email: 'awssbgucc@gmail.com',
  meetupUrl: 'https://www.meetup.com/aws-sbg-at-university-of-cape-coast',
  // TODO(joel): WhatsApp community link
  whatsappUrl: null,
  builderCenterUrl: 'https://bit.ly/4pNTKvI',
  // TODO(joel): LinkedIn, Instagram and X links
  linkedinUrl: null,
  instagramUrl: null,
  xUrl: null,
  // TODO(joel): members on Meetup and departments represented
  membersCount: null,
  departmentsCount: null,
  announcementText: null,
  announcementUrl: null,
  announcementActive: false,
  scdPageEnabled: false,
  uccCrestApproved: false,
};

function member(order: number, name: string, role: string, roleGroup: TeamMember['roleGroup']): TeamMember {
  return { id: `team-${order}`, name, role, roleGroup, programme: null, level: null, photoUrl: null, linkedin: null, order, active: true };
}

// TODO(joel): photos, programmes and levels for everyone except Joel's programme and level.
export const teamMembers: TeamMember[] = [
  { ...member(1, 'Joel Anarba Amuni', 'Group Leader', 'LEADER'), programme: 'BSc Computer Science', level: 'Level 300' },
  member(2, 'Emmanuel Nttey', 'Technical Lead', 'TECHNICAL'),
  member(3, 'Opoku Kelvin Boateng', 'Events Director', 'EVENTS'),
  member(4, 'Opoku Evans', 'Marketing and Communications Lead', 'COMMUNITY'),
  member(5, 'Mohammed Bonah Adu', 'Community and Partnerships Lead', 'COMMUNITY'),
  member(6, 'Rhoda Korantemaa', 'Operations and Documentation Lead', 'EVENTS'),
];

function partner(order: number, name: string, status: Partner['status']): Partner {
  return { id: `partner-${order}`, name, type: 'CAMPUS', logoUrl: null, url: null, description: null, order, status };
}

// TODO(joel): logos and links for every partner.
export const partners: Partner[] = [
  partner(1, 'CITSA', 'PUBLISHED'),
  partner(2, 'AmaliTech Coding Club', 'PUBLISHED'),
  // TODO(joel): CANSSAG full name and logo
  partner(3, 'CANSSAG', 'DRAFT'),
];

// Joel's decision, 31 Oct 2026: the team adds events from the dashboard, so none are seeded.
export const events: Event[] = [];

export const posts: Post[] = [];
