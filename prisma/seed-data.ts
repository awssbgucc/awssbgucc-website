// From the Seed data section of docs/CONTENT.md. No events are seeded: the team adds them from the dashboard.

export const adminUsers = [
  { email: 'anarbajoel@gmail.com', name: 'Joel Anarba Amuni', role: 'ADMIN' as const },
  { email: 'awssbgucc@gmail.com', name: 'AWS SBG UCC', role: 'ADMIN' as const },
];

export const siteSettings = {
  id: 1,
  // TODO(joel): confirm this over the older awsbuildergroup.ucc@gmail.com
  email: 'awssbgucc@gmail.com',
  meetupUrl: 'https://www.meetup.com/aws-sbg-at-university-of-cape-coast',
  whatsappUrl: 'https://chat.whatsapp.com/BnlWXQsAiJxBmZJwyYnpu0',
  builderCenterUrl: 'https://bit.ly/4pNTKvI',
  linkedinUrl: 'https://www.linkedin.com/company/awssbgucc',
  instagramUrl: 'https://www.instagram.com/awssbgucc',
  xUrl: 'https://x.com/awssbgucc',
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
  { reason: 'CHECK_IN' as const, xp: 50, credits: 10, description: 'Checking in at a session with the room code.' },
  { reason: 'SUBMISSION_APPROVED' as const, xp: 150, credits: 30, description: 'Getting a challenge submission approved by a reviewer. Individual challenges may set different values.' },
  { reason: 'PROJECT_APPROVED' as const, xp: 100, credits: 20, description: 'Getting a project approved for the public showcase.' },
  { reason: 'REFERRAL' as const, xp: 25, credits: 5, description: 'A referred member attends their first session (up to 10 per month).' },
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

function swag(slug: string, name: string, category: string, unitLabel: string, receivedTotal: number, lowStockThreshold: number, notes: string | null = null) {
  return { id: `seed-swag-${slug}`, slug, name, category, unitLabel, quantity: 0, receivedTotal, lowStockThreshold, notes };
}

export const swagItems = [
  swag('cotton-twill-cap-black', 'Cotton Twill Cap - Black', 'Apparel', 'pcs', 13, 3, 'AWS swag orders: 5 + 4 + 4 (20 pts each)'),
  swag('javalina-executive-pen-1000-black', 'Javalina Executive Pen (1000-count) - Black', 'Stationery', 'boxes', 1, 1, '1000-count bulk pack'),
  swag('javalina-executive-pen-1000-blue', 'Javalina Executive Pen (1000-count) - Blue', 'Stationery', 'boxes', 1, 1, '1000-count bulk pack'),
  swag('owala-bottle-24oz-very-very-dark', '24oz Owala Bottle - Very Very Dark', 'Drinkware', 'pcs', 12, 3),
  swag('core-team-kit-s', 'Core Team Kit - S', 'Core Team Kit', 'kits', 10, 2, 'AWS swag orders: 3 + 2 + 1 + 2 + 1 + 1 (1 pt each)'),
  swag('core-team-kit-m', 'Core Team Kit - M', 'Core Team Kit', 'kits', 3, 1, 'AWS swag orders: 3 (1 pt each)'),
  swag('core-team-kit-l', 'Core Team Kit - L', 'Core Team Kit', 'kits', 4, 1, 'AWS swag orders: 2 + 2'),
  swag('core-team-kit-xl', 'Core Team Kit - XL', 'Core Team Kit', 'kits', 1, 1, 'AWS swag orders: 1 (1 pt each)'),
  swag('javalina-spring-stylus-pen-lime-green', 'Javalina Spring Stylus Pen - Lime Green', 'Stationery', 'pcs', 55, 10, 'AWS swag orders: 35 + 20'),
  swag('javalina-spring-stylus-pen-burnt-orange', 'Javalina Spring Stylus Pen - Burnt Orange', 'Stationery', 'pcs', 45, 10, 'AWS swag orders: 20 + 25'),
  swag('mini-canvas-tote-14oz', '14oz Mini Canvas Tote', 'Bags', 'pcs', 10, 3),
  swag('clear-belt-bag-black', 'Clear Belt Bag - Black', 'Bags', 'pcs', 9, 2, 'AWS swag orders: 4 + 5 (10 pts each)'),
  swag('lanyard', 'Lanyard', 'Accessories', 'pcs', 10, 3),
  swag('flag-blue', 'Flag - Blue', 'Event Gear', 'pcs', 1, 1, '20 pts each'),
  swag('desk-mat', 'Desk Mat', 'Accessories', 'pcs', 2, 1, '20 pts each'),
  swag('magnetic-phone-accessory-black', 'Magnetic Phone Accessory - Black', 'Accessories', 'pcs', 1, 1, '5 pts each'),
];
