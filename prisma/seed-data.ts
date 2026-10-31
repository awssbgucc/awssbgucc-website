// From the Seed data section of docs/CONTENT.md. No events are seeded: the team adds them from the dashboard.

export const adminUsers = [{ email: 'anarbajoel@gmail.com', name: 'Joel Anarba Amuni', role: 'ADMIN' as const }];

export const siteSettings = {
  id: 1,
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
  scdPageEnabled: false,
  uccCrestApproved: false,
};

type RoleGroup = 'LEADER' | 'TECHNICAL' | 'EVENTS' | 'COMMUNITY';

function member(order: number, name: string, role: string, roleGroup: RoleGroup) {
  // Seeded inactive, so nobody appears publicly until Joel has reviewed the record.
  return { id: `seed-team-${order}`, name, role, roleGroup, order, active: false };
}

// TODO(joel): photos, programmes and levels for everyone except Joel's programme and level.
export const teamMembers = [
  { ...member(1, 'Joel Anarba Amuni', 'Group Leader', 'LEADER'), programme: 'BSc Computer Science', level: 'Level 300' },
  member(2, 'Emmanuel Nttey', 'Technical Lead', 'TECHNICAL'),
  member(3, 'Opoku Kelvin Boateng', 'Events Director', 'EVENTS'),
  member(4, 'Opoku Evans', 'Marketing and Communications Lead', 'COMMUNITY'),
  member(5, 'Mohammed Bonah Adu', 'Community and Partnerships Lead', 'COMMUNITY'),
  member(6, 'Rhoda Korantemaa', 'Operations and Documentation Lead', 'EVENTS'),
];

function partner(order: number, name: string, status: 'DRAFT' | 'PUBLISHED') {
  return { id: `seed-partner-${order}`, name, type: 'CAMPUS' as const, order, status };
}

// TODO(joel): logos and links for every partner.
export const partners = [
  partner(1, 'CITSA', 'PUBLISHED'),
  partner(2, 'AmaliTech Coding Club', 'PUBLISHED'),
  // TODO(joel): CANSSAG full name and logo
  partner(3, 'CANSSAG', 'DRAFT'),
];
