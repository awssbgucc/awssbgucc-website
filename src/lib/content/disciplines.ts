import type { SbgIconName, SbgTone } from '@/components/site/SbgIcon';

// What members can explore, kept honest: each area says whether the group has actually covered it.
// Evidence points at event and post slugs; a link shows only while that record is published.
// Sources are the IDs in docs/research/COMMUNITY_SOURCE_ARCHIVE.md.

export type DisciplineStatus = 'covered' | 'scheduled' | 'announced' | 'explore';

export const STATUS_LABEL: Record<DisciplineStatus, string> = {
  covered: 'Covered in a session',
  scheduled: 'On the calendar',
  announced: 'Announced',
  explore: 'Open to explore',
};

export type Evidence = { kind: 'event' | 'post'; slug: string; label: string };

export type Discipline = {
  id: string;
  title: string;
  icon: SbgIconName;
  tone: SbgTone;
  status: DisciplineStatus;
  line: string;
  here: string;
  sources: string[];
  evidence: Evidence[];
};

export const DISCIPLINES: Discipline[] = [
  {
    id: 'cloud',
    title: 'Cloud foundations',
    icon: 'bolt',
    tone: 'purple',
    status: 'covered',
    line: 'What the cloud is, what compute and storage do, and how AWS fits into the apps you already use.',
    here: 'Covered at the launch, at freshers onboarding and in the first weeks of the Zero to Cloud Practitioner bootcamp.',
    sources: ['S1', 'S2', 'S3', 'S6'],
    evidence: [
      { kind: 'event', slug: 'aws-sbg-ucc-launch', label: 'Launch, Sat 22 Aug 2026' },
      { kind: 'event', slug: 'freshers-onboarding', label: 'Freshers onboarding, Sat 10 Oct 2026' },
      { kind: 'post', slug: 'first-website-on-amazon-s3', label: 'Bootcamp week 3: compute and storage' },
    ],
  },
  {
    id: 'web',
    title: 'Websites and apps',
    icon: 'brackets',
    tone: 'magenta',
    status: 'covered',
    line: 'Building something people can open in a browser, then getting it online and keeping it there.',
    here: 'Bootcamp participants deployed a Hostel Finder website on Amazon S3. The first in-person build session takes personal portfolios live.',
    sources: ['S1', 'S14'],
    evidence: [
      { kind: 'post', slug: 'first-website-on-amazon-s3', label: 'Our first website on Amazon S3' },
      { kind: 'event', slug: 'from-code-to-cloud', label: 'From Code to Cloud, Sat 14 Nov 2026' },
    ],
  },
  {
    id: 'careers',
    title: 'Careers and certifications',
    icon: 'ladder',
    tone: 'blue',
    status: 'covered',
    line: 'Where certifications fit, which paths exist in cloud work, and the skills employers look for beyond the badge.',
    here: 'A careers conversation with Nathaniel Agbenyenu, and Cloud Practitioner exam preparation in the bootcamp.',
    sources: ['S2', 'S4', 'S9'],
    evidence: [
      { kind: 'event', slug: 'building-your-aws-career', label: 'Building Your AWS Career, Sat 26 Sep 2026' },
      { kind: 'post', slug: 'certifications-are-part-of-the-path', label: 'Certifications are part of the path' },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps and cloud-native',
    icon: 'wrench',
    tone: 'mint',
    status: 'covered',
    line: 'How teams ship, automate and run software, from the first deploy to keeping it healthy.',
    here: 'Discussed at the launch with guest speaker Isaac Tandoh, a DevOps engineer. A hands-on session has not run yet.',
    sources: ['S6'],
    evidence: [{ kind: 'event', slug: 'aws-sbg-ucc-launch', label: 'Launch, Sat 22 Aug 2026' }],
  },
  {
    id: 'ai',
    title: 'AI, machine learning and agents',
    icon: 'brackets-double',
    tone: 'purple',
    status: 'scheduled',
    line: 'Using models and AI tools to build, from coding assistants to apps with generative AI inside.',
    here: 'From Code to Cloud includes a demonstration of AI coding tools. Members named AI as an interest from the start.',
    sources: ['S6', 'S14'],
    evidence: [{ kind: 'event', slug: 'from-code-to-cloud', label: 'From Code to Cloud, Sat 14 Nov 2026' }],
  },
  {
    id: 'serverless',
    title: 'Compute and serverless',
    icon: 'clock',
    tone: 'blue',
    status: 'announced',
    line: 'Running code on servers you rent by the second, or without managing servers at all.',
    here: 'The bootcamp announced Amazon EC2 and AWS Lambda as its next topics after week 3.',
    sources: ['S1'],
    evidence: [],
  },
  {
    id: 'security',
    title: 'Security',
    icon: 'key',
    tone: 'magenta',
    status: 'explore',
    line: 'Permissions, identity and keeping what you build safe from the start.',
    here: 'Named as a focus when the group was announced. No dedicated session has run yet.',
    sources: ['S8'],
    evidence: [],
  },
  {
    id: 'data',
    title: 'Data and analytics',
    icon: 'drop',
    tone: 'mint',
    status: 'explore',
    line: 'Collecting, storing and asking questions of data, from spreadsheets to pipelines.',
    here: 'Business analytics was named as an interest when the group was announced. No session has run yet.',
    sources: ['S8'],
    evidence: [],
  },
];
