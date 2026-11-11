import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Development and test fixtures. Never real people or real events.
// Refuses to run unless DATABASE_URL points at a local database, so nothing here can reach Neon.
// Run: pnpm db:fixtures (after pnpm db:seed). Every record has a dev- id, so running again changes nothing.

const url = process.env.DATABASE_URL ?? '';
const host = (() => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
})();
if (!['localhost', '127.0.0.1'].includes(host)) {
  console.error('dev-fixtures: DATABASE_URL is not a local database. Refusing to write fixtures.');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();
const at = (offsetDays: number, hour = 9) => new Date(Math.floor((now + offsetDays * DAY) / DAY) * DAY + hour * HOUR);

export const FIXTURE_USERS = [
  { id: 'dev-user-ama', name: 'Test Builder Ama', email: 'ama.fixture@example.test', handle: 'test-ama', visibility: 'PUBLIC' as const },
  { id: 'dev-user-kofi', name: 'Test Builder Kofi', email: 'kofi.fixture@example.test', handle: 'test-kofi', visibility: 'MEMBERS' as const },
  { id: 'dev-user-esi', name: 'Test Builder Esi', email: 'esi.fixture@example.test', handle: 'test-esi', visibility: 'PRIVATE' as const },
];

async function main() {
  // Users with no profile yet, for the onboarding test, and a user for the seeded admin email.
  const users = [
    ...FIXTURE_USERS.map(({ id, name, email }) => ({ id, name, email, emailVerified: true })),
    { id: 'dev-user-new', name: 'Test Newcomer', email: 'new.fixture@example.test', emailVerified: true },
    { id: 'dev-user-admin', name: 'Joel Anarba Amuni', email: 'anarbajoel@gmail.com', emailVerified: true },
  ];
  await prisma.user.createMany({ data: users, skipDuplicates: true });

  await prisma.memberProfile.createMany({
    data: FIXTURE_USERS.map(({ id, name, handle, visibility }, index) => ({
      userId: id,
      handle,
      displayName: name,
      programme: 'BSc Computer Science',
      level: `Level ${(index + 2) * 100}`,
      department: 'Computer Science and Information Technology',
      interests: index === 0 ? ['Serverless', 'Generative AI'] : ['Cloud foundations', 'DevOps and CI/CD'],
      visibility,
      showOnLeaderboards: visibility !== 'PRIVATE',
      referralCode: `DEVREF${index}X`,
      referredById: index === 1 ? 'dev-user-ama' : null,
      privacyAcceptedAt: new Date(),
      onboardedAt: new Date(),
    })),
    skipDuplicates: true,
  });

  const events = [
    { id: 'dev-event-1', slug: 'dev-intro-to-amazon-s3', title: 'Fixture: Intro to Amazon S3', tag: 'BUILD' as const, startsAt: at(-21), endsAt: at(-21, 12) },
    { id: 'dev-event-2', slug: 'dev-serverless-with-aws-lambda', title: 'Fixture: Serverless with AWS Lambda', tag: 'BUILD' as const, startsAt: at(-14), endsAt: at(-14, 12) },
    { id: 'dev-event-3', slug: 'dev-cloud-career-talk', title: 'Fixture: Cloud career talk', tag: 'TALK' as const, startsAt: at(-7), endsAt: at(-7, 11) },
    { id: 'dev-event-4', slug: 'dev-live-build-session', title: 'Fixture: Live build session', tag: 'BUILD' as const, startsAt: new Date(now - HOUR), endsAt: new Date(now + 2 * HOUR) },
    { id: 'dev-event-5', slug: 'dev-cloud-practitioner-bootcamp', title: 'Fixture: Cloud Practitioner bootcamp week', tag: 'BOOTCAMP' as const, startsAt: at(7, 16), endsAt: at(7, 18) },
  ];
  await prisma.event.createMany({
    data: events.map((event) => ({
      ...event,
      format: 'IN_PERSON' as const,
      venue: 'Fixture venue',
      summary: 'A development fixture. Not a real session.',
      body: 'This record exists only in local development and tests.',
      meetupUrl: 'https://www.meetup.com/aws-sbg-at-university-of-cape-coast',
      status: 'PUBLISHED' as const,
      checkInCode: event.id === 'dev-event-5' ? null : 'TEST24',
      checkInOpensAt: event.id === 'dev-event-5' ? null : new Date(event.startsAt.getTime() - HOUR / 2),
      checkInClosesAt: event.id === 'dev-event-5' ? null : new Date(event.endsAt.getTime() + HOUR / 2),
    })),
    skipDuplicates: true,
  });

  await prisma.eventResource.createMany({
    data: [
      { id: 'dev-resource-1', eventId: 'dev-event-1', label: 'Fixture slides', url: 'https://example.com/slides', kind: 'SLIDES' as const },
      { id: 'dev-resource-2', eventId: 'dev-event-1', label: 'Fixture lab repository', url: 'https://github.com/example/lab', kind: 'REPO' as const, access: 'MEMBERS' as const },
    ],
    skipDuplicates: true,
  });

  await prisma.challenge.createMany({
    data: [
      {
        id: 'dev-challenge-1',
        slug: 'dev-static-site-on-s3',
        title: 'Fixture: Host a static site on Amazon S3',
        summary: 'A development fixture challenge.',
        brief: 'Deploy a static page to an Amazon S3 bucket and share the repository.',
        requirements: '- A public repository\n- A README with the steps you followed',
        startsAt: at(-10),
        endsAt: at(20),
        status: 'PUBLISHED' as const,
        eventId: 'dev-event-1',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.announcement.createMany({
    data: [{ id: 'dev-announcement-1', title: 'Fixture announcement', body: 'A development fixture. Not a real announcement.', status: 'PUBLISHED' as const, publishedAt: new Date() }],
    skipDuplicates: true,
  });

  console.log('Fixtures ready. Check-ins and awards are made by the app, not here.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
