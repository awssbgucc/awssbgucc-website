import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Copies the reviewed records in content/community-history.json into a database.
// It creates missing records. Anything that already matches (slug, Meetup ID, title, or date and type) is left untouched,
// so edits made in the admin always win. With --refresh, a match that the import still owns (updatedBy "content import",
// so nobody has saved it in the admin, publishing included) gets the reviewed text again: title, summary or excerpt,
// body, venue, cover image, event photos, times and attendance. Status and links never change. Running it twice changes nothing.
// Deliberately does not load .env: DATABASE_URL must be set in the shell.
//
//   Dry run, local:                 pnpm exec tsx scripts/import-community-history.ts
//   Create drafts, local:           ... --apply
//   Local visual preview:           ... --apply --preview   (publishes verified and needs-confirmation records that can be published)
//   Update reviewed text:           ... --apply --refresh   (add --remote-drafts for a remote database, as below)
//   Drafts on a remote database:    ... --apply --remote-drafts   with CONFIRM_REMOTE_HOST set to the database host name.
//                                   Never publishes. Joel runs this himself after approving it; publishing then happens in the admin.

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Set DATABASE_URL in the shell. This script does not read .env.');
const host = new URL(url).hostname;
const local = ['localhost', '127.0.0.1'].includes(host);
const apply = process.argv.includes('--apply');
const preview = process.argv.includes('--preview');
const remoteDrafts = process.argv.includes('--remote-drafts');
const refresh = process.argv.includes('--refresh');
const IMPORTER = 'content import';

if (!local) {
  if (!remoteDrafts) throw new Error(`${host} is not a local database. Remote imports need --remote-drafts and CONFIRM_REMOTE_HOST.`);
  if (process.env.CONFIRM_REMOTE_HOST !== host) throw new Error(`Set CONFIRM_REMOTE_HOST=${host} to confirm the target. Nothing was written.`);
  if (preview) throw new Error('--preview publishes records and is only allowed on a local database.');
}

type Review = { state: 'verified' | 'needs-confirmation' | 'draft-only'; sources: string[]; notes: string };
type EventRecord = {
  slug: string; title: string; tag: 'BOOTCAMP' | 'BUILD' | 'TALK' | 'NETWORKING' | 'COMMUNITY_DAY'; format: 'IN_PERSON' | 'ONLINE';
  startsAt: string; endsAt: string; venue: string | null; summary: string; body: string; meetupUrl: string | null;
  coverImage: string | null; photos: string[]; attendance: number | null; recapPostSlug: string | null; review: Review;
};
type PostRecord = { slug: string; title: string; excerpt: string; author: string; publishedAt: string | null; coverImage: string | null; body: string; review: Review };

const data = JSON.parse(readFileSync('content/community-history.json', 'utf8')) as { events: EventRecord[]; posts: PostRecord[] };
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const publishable = (review: Review) => review.state !== 'draft-only';

/** The fields that differ between a stored record and the reviewed one, or null when there is nothing to do. */
function changes<T extends Record<string, unknown>>(stored: Record<string, unknown>, reviewed: T): Partial<T> | null {
  const same = (a: unknown, b: unknown) => {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => v === b[i]);
    return a === b;
  };
  const diff = Object.fromEntries(Object.entries(reviewed).filter(([key, value]) => !same(stored[key], value))) as Partial<T>;
  return Object.keys(diff).length ? diff : null;
}

try {
  console.log(`${apply ? 'Writing to' : 'Dry run against'} ${host}${preview ? ' (local preview: publishable records go live)' : ' (new records are drafts)'}${refresh ? ', refreshing text the import still owns' : ''}`);
  const postIds = new Map<string, string>();
  for (const { review, ...record } of data.posts) {
    const match = await db.post.findFirst({ where: { OR: [{ slug: record.slug }, { title: record.title }] } });
    if (match) {
      postIds.set(record.slug, match.id);
      const diff = refresh && match.updatedBy === IMPORTER
        ? changes(match, { title: record.title, excerpt: record.excerpt, body: record.body, coverImage: record.coverImage })
        : null;
      if (!diff) { console.log(`Keep existing post: ${record.slug}${refresh && match.updatedBy !== IMPORTER ? ' (edited in the admin)' : ''}`); continue; }
      if (apply) await db.post.update({ where: { id: match.id }, data: { ...diff, updatedBy: IMPORTER } });
      console.log(`${apply ? 'Refreshed' : 'Would refresh'} post ${record.slug}: ${Object.keys(diff).join(', ')}`);
      continue;
    }
    const status = preview && publishable(review) ? 'PUBLISHED' : 'DRAFT';
    if (apply) {
      const created = await db.post.create({ data: { ...record, publishedAt: record.publishedAt ? new Date(record.publishedAt) : null, status, updatedBy: IMPORTER } });
      postIds.set(record.slug, created.id);
    }
    console.log(`${apply ? 'Created' : 'Would create'} post ${record.slug}: ${status} [${review.state}]`);
  }
  for (const { review, recapPostSlug, ...record } of data.events) {
    const eventId = record.meetupUrl?.match(/\/events\/(\d+)/)?.[1];
    const matches = await db.event.findMany({ where: { OR: [
      { slug: record.slug },
      ...(eventId ? [{ meetupUrl: { contains: `/events/${eventId}` } }] : []),
      { startsAt: new Date(record.startsAt), tag: record.tag },
      { title: { equals: record.title, mode: 'insensitive' } },
    ] } });
    if (matches.length) {
      const [match] = matches;
      const diff = refresh && matches.length === 1 && match.updatedBy === IMPORTER
        ? changes(match, {
            title: record.title, summary: record.summary, body: record.body, venue: record.venue, coverImage: record.coverImage, photos: record.photos,
            startsAt: new Date(record.startsAt), endsAt: new Date(record.endsAt), attendance: record.attendance,
          })
        : null;
      if (!diff) {
        const why = refresh && match.updatedBy !== IMPORTER ? ' Edited in the admin.' : '';
        console.log(`Keep existing event: ${record.slug} (${matches.length} match). No fields or status changed.${why}`);
        continue;
      }
      if (apply) await db.event.update({ where: { id: match.id }, data: { ...diff, updatedBy: IMPORTER } });
      console.log(`${apply ? 'Refreshed' : 'Would refresh'} event ${record.slug}: ${Object.keys(diff).join(', ')}`);
      continue;
    }
    // The same rule as the admin form: no Meetup link, no publishing.
    const status = preview && publishable(review) && record.meetupUrl ? 'PUBLISHED' : 'DRAFT';
    if (apply) {
      await db.event.create({ data: {
        ...record,
        startsAt: new Date(record.startsAt),
        endsAt: new Date(record.endsAt),
        recapPostId: recapPostSlug ? postIds.get(recapPostSlug) ?? null : null,
        status,
        updatedBy: IMPORTER,
      } });
    }
    console.log(`${apply ? 'Created' : 'Would create'} event ${record.slug}: ${status} [${review.state}]${review.state !== 'verified' ? ` ${review.notes}` : ''}`);
  }
} finally {
  await db.$disconnect();
}
