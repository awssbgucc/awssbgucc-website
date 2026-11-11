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

// Builder portal configuration. These are rules, not content, and the core team can change them in the dashboard.
// TODO(joel): review the XP and credit values before launch.
export const awardRules = [
  { reason: 'CHECK_IN' as const, xp: 50, credits: 10, description: 'Checking in at a session with the code shown in the room' },
  { reason: 'SUBMISSION_APPROVED' as const, xp: 150, credits: 30, description: 'A challenge submission approved by a reviewer. A challenge can set its own values.' },
  { reason: 'PROJECT_APPROVED' as const, xp: 100, credits: 20, description: 'A project approved for the public showcase' },
  { reason: 'REFERRAL' as const, xp: 25, credits: 5, description: 'Someone you referred attends their first session. Up to 10 a month.' },
];

type Criterion = 'SESSIONS_ATTENDED' | 'SESSION_STREAK' | 'SUBMISSIONS_APPROVED' | 'PROJECTS_APPROVED' | 'REFERRALS';

function achievement(order: number, code: string, title: string, description: string, criterion: Criterion, threshold: number, xp: number, credits: number) {
  return { id: `seed-achievement-${code}`, code, title, description, criterion, threshold, xp, credits, order };
}

export const achievements = [
  achievement(1, 'first-session', 'First session', 'Checked in at your first session.', 'SESSIONS_ATTENDED', 1, 10, 0),
  achievement(2, 'five-sessions', 'Five sessions', 'Checked in at five sessions.', 'SESSIONS_ATTENDED', 5, 50, 10),
  achievement(3, 'ten-sessions', 'Ten sessions', 'Checked in at ten sessions.', 'SESSIONS_ATTENDED', 10, 100, 20),
  achievement(4, 'three-in-a-row', 'Three in a row', 'Attended three sessions in a row.', 'SESSION_STREAK', 3, 50, 10),
  achievement(5, 'first-approved', 'First approved build', 'Had a challenge submission approved.', 'SUBMISSIONS_APPROVED', 1, 25, 5),
  achievement(6, 'five-approved', 'Five approved builds', 'Had five challenge submissions approved.', 'SUBMISSIONS_APPROVED', 5, 100, 20),
  achievement(7, 'shipped', 'Shipped', 'Had a project approved for the showcase.', 'PROJECTS_APPROVED', 1, 50, 10),
  achievement(8, 'brought-a-friend', 'Brought a friend', 'Someone you referred attended a session.', 'REFERRALS', 1, 10, 0),
];

type DigitalKind = 'BANNER' | 'ACCENT' | 'FRAME' | 'TITLE';

function digital(order: number, kind: DigitalKind, value: string, name: string, description: string, cost: number) {
  return { id: `seed-reward-${kind.toLowerCase()}-${value}`, slug: `${kind.toLowerCase()}-${value}`, name, description, kind, value, cost, order, available: true };
}

// Only digital items, which work inside the portal. Physical rewards are added by the team when they exist.
export const rewards = [
  digital(1, 'BANNER', 'cells', 'Pixel cells banner', 'A profile banner built from the pixel map cells.', 40),
  digital(2, 'BANNER', 'scan', 'Scan lines banner', 'A profile banner with fine horizontal lines.', 40),
  digital(3, 'BANNER', 'tide', 'Tide banner', 'A profile banner with a slow wave pattern.', 60),
  digital(4, 'ACCENT', 'sky', 'Sky accent', 'Sky blue for your profile name and frame.', 30),
  digital(5, 'ACCENT', 'lavender', 'Lavender accent', 'Lavender for your profile name and frame.', 30),
  digital(6, 'FRAME', 'pixel', 'Pixel corners frame', 'Square pixel corners around your initials.', 50),
  digital(7, 'FRAME', 'double', 'Double line frame', 'A double line around your initials.', 50),
  digital(8, 'TITLE', 'lab-regular', 'Title: Lab regular', 'Shown under your name.', 80),
  digital(9, 'TITLE', 'first-deploy', 'Title: First deploy', 'Shown under your name.', 80),
  digital(10, 'TITLE', 'peer-reviewer', 'Title: Peer reviewer', 'Shown under your name.', 80),
  digital(11, 'TITLE', 'night-builder', 'Title: Night builder', 'Shown under your name.', 80),
];
