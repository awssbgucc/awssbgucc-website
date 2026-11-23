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
    line: 'Creating websites and web apps, deploying them to AWS and keeping them online.',
    here: 'Bootcamp participants deployed a Hostel Finder website on Amazon S3 in week 3. At From Code to Cloud, our first in-person build session, participants put their own portfolios online the same way.',
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
    line: 'Where AWS certifications fit, career paths in cloud computing and the practical skills employers look for.',
    here: 'A careers talk with Nathaniel Agbenyenu, plus Cloud Practitioner exam preparation in the Zero to Cloud Practitioner bootcamp.',
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
    line: 'How teams automate deployments, monitor systems and keep software running reliably.',
    here: 'Discussed at the launch with guest speaker Isaac Tandoh, a DevOps engineer. A hands-on session has not run yet.',
    sources: ['S6'],
    evidence: [{ kind: 'event', slug: 'aws-sbg-ucc-launch', label: 'Launch, Sat 22 Aug 2026' }],
  },
  {
    id: 'ai',
    title: 'AI, machine learning and agents',
    icon: 'brackets-double',
    tone: 'purple',
    status: 'announced',
    line: 'Working with machine learning models, AI coding tools and applications powered by generative AI.',
    here: 'AI has been on our list since the launch. A dedicated AI session has not run yet.',
    sources: ['S6'],
    evidence: [],
  },
  {
    id: 'serverless',
    title: 'Compute and serverless',
    icon: 'clock',
    tone: 'blue',
    status: 'covered',
    line: 'Running code on virtual servers, or as functions without managing any servers at all.',
    here: 'At From Code to Cloud, participants launched their own Amazon EC2 instance and connected it to their website. AWS Lambda has not had a session yet.',
    sources: ['S1', 'S18'],
    evidence: [{ kind: 'event', slug: 'from-code-to-cloud', label: 'From Code to Cloud, Sat 14 Nov 2026' }],
  },
  {
    id: 'security',
    title: 'Security',
    icon: 'key',
    tone: 'magenta',
    status: 'covered',
    line: 'Permissions, identity management and securing cloud applications from the start.',
    here: 'At From Code to Cloud, participants diagnosed an Access Denied error and fixed an Amazon S3 bucket policy. A dedicated security session has not run yet.',
    sources: ['S8', 'S18'],
    evidence: [{ kind: 'event', slug: 'from-code-to-cloud', label: 'From Code to Cloud, Sat 14 Nov 2026' }],
  },
  {
    id: 'data',
    title: 'Data and analytics',
    icon: 'drop',
    tone: 'mint',
    status: 'explore',
    line: 'Collecting, storing and analysing data, from simple datasets to cloud pipelines.',
    here: 'Business analytics was named when the group was announced. A session on data has not run yet.',
    sources: ['S8'],
    evidence: [],
  },
];

export type BoardRecord = { key: string; kind: Evidence['kind']; slug: string; title: string; date: string | null };

/**
 * The published sessions and stories that any area points at: the rail the technology board draws its traces to.
 * Dated records come first, oldest first; stories without a publish date follow in the order given. Records nobody
 * points at are left out, so the board never shows an empty claim. Pass published records only.
 */
export function boardRecords(
  disciplines: Discipline[],
  events: { slug: string; title: string; startsAt: Date }[],
  posts: { slug: string; title: string; publishedAt: Date | null }[],
): BoardRecord[] {
  const wanted = new Set(disciplines.flatMap((d) => d.evidence.map((e) => `${e.kind}:${e.slug}`)));
  const records: (BoardRecord & { at: number })[] = [];
  for (const e of events) {
    if (wanted.has(`event:${e.slug}`)) records.push({ key: `event:${e.slug}`, kind: 'event', slug: e.slug, title: e.title.split(':')[0], date: e.startsAt.toISOString(), at: e.startsAt.getTime() });
  }
  for (const p of posts) {
    if (wanted.has(`post:${p.slug}`)) records.push({ key: `post:${p.slug}`, kind: 'post', slug: p.slug, title: p.title, date: p.publishedAt?.toISOString() ?? null, at: p.publishedAt?.getTime() ?? Infinity });
  }
  return records.sort((a, b) => (a.at === b.at ? 0 : a.at - b.at)).map(({ key, kind, slug, title, date }) => ({ key, kind, slug, title, date }));
}
