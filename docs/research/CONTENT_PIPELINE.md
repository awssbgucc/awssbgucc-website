# Content pipeline: why Events was empty, and how content reaches the site

## Why the Events page showed nothing

Investigated on 11 Nov 2026, without reading the production database. A read-only Neon query was blocked by the permission system and was not retried.

1. `prisma/seed.ts` creates settings, partners, team and rewards, but **no events or posts**. The seed data never had complete event records (C3 in tasks/todo.md).
2. The 10 Nov import script (`scripts/import-community-history.ts`) was local-only by design and published records only with `--preview`, so verified events were never written to any database the site reads in production.
3. The dev server on port 3000 reads `.env` and `.env.local`, which point at Neon. Unless someone created events in the admin on Neon, there are none to show. This also breaks the CLAUDE.md rule that development never points at Neon.
4. The query and filter code were checked and are correct. `getEvents()` returns `status = PUBLISHED`; upcoming means `endsAt > now`. With the reviewed records imported into a local database, the page shows 3 past and 1 upcoming session.

The frontend was not the cause. The content was never imported into a database the site reads.

## Three states

| State | Where it lives | Who changes it |
|---|---|---|
| Source | `docs/research/COMMUNITY_SOURCE_ARCHIVE.md` (verbatim posts and listings), `Event-banners/`, `IMG/` | Nobody; it is a record |
| Reviewed | `content/community-history.json` (events and posts, each with `review.state`, sources and notes) and `content/media-manifest.json` (consent and provenance) | A developer, in a reviewed change |
| Published | The database: `status = PUBLISHED` on Event and Post | An admin, in the dashboard |

`review.state` is one of:

- `verified`: every field has a first-party source.
- `needs-confirmation`: publishable, with a conflict or derived fact named in the notes.
- `draft-only`: cannot be published, for example because there is no Meetup link (COMPLIANCE rule 17).

## Commands

The script never reads `.env`; set `DATABASE_URL` in the shell.

```powershell
# Local review database
$env:DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5434/postgres?sslmode=disable'
pnpm exec tsx scripts/import-community-history.ts                    # dry run
pnpm exec tsx scripts/import-community-history.ts --apply            # creates drafts
pnpm exec tsx scripts/import-community-history.ts --apply --preview  # local only: publishes verified and needs-confirmation records
```

By default the script only creates. A record matching an existing one by slug, Meetup event ID, title, or date and type is left untouched, so admin edits always win. Run it twice and nothing changes.

`--refresh` (15 Nov 2026) also updates the text of matching records that the import still owns, meaning `updatedBy` is still `content import`, so nobody has saved them in the admin, publishing included. It changes only title, summary or excerpt, body, venue, cover image, event photos, times and attendance (times and attendance from 16 Nov 2026), never status or links, and prints each field it changes. Records saved in the admin are reported and left alone.

```powershell
pnpm exec tsx scripts/import-community-history.ts --refresh                       # dry run: lists what would change
pnpm exec tsx scripts/import-community-history.ts --apply --refresh               # local
```

## Getting the content live (Joel)

1. All records in `content/community-history.json` were approved on 11 Nov 2026. The From Code to Cloud Meetup listing keeps its old room and time, as the event is over; the site holds the Computer Lab and the actual times, 10:00 AM to 2:00 PM.
2. Make sure the flyers and photos are deployed: they ship in `public/media/`, so a normal deploy is enough.
3. Back up Neon (a branch), then run the drafts-only import yourself:
   ```powershell
   $env:DATABASE_URL='<Neon direct URL>'
   $env:CONFIRM_REMOTE_HOST='<the host part of that URL>'
   pnpm exec tsx scripts/import-community-history.ts --apply --remote-drafts
   ```
   It refuses a remote database without both the flag and the matching host. It never publishes on a remote database.
4. In the admin, open each new draft, check it against its source, and publish. Publishing stays a human step.
5. If you would rather not run a script against Neon, create the same records through the admin form, copying each field from the JSON. The cover image field takes the `/media/events/...` path as it is.
6. After a copy change to the JSON (the 15 Nov editorial pass rewrote every event and post body), drafts already on Neon can take the new text with the same guard:
   ```powershell
   pnpm exec tsx scripts/import-community-history.ts --refresh --remote-drafts                # dry run first
   pnpm exec tsx scripts/import-community-history.ts --apply --refresh --remote-drafts
   ```
   Records already saved or published in the admin keep their text; paste the new text in through the admin.
7. Event photos (16 Nov 2026). Approved photos are listed under `eventPhotos` in `content/media-manifest.json` and written by `python scripts/prepare-media.py event-photos` to `public/media/events/<event>/`, so they deploy with the site. The event's `photos` in `content/community-history.json` lists their URLs, cover first. If From Code to Cloud is already on Neon and nobody has saved it in the admin, `--refresh --remote-drafts` adds the photos. If it was saved in the admin, the refresh leaves it alone, and the gallery field only takes uploads, so upload the 21 files from `public/media/events/from-code-to-cloud/` there, `fcc-everyone.webp` first (the first photo becomes the cover).

16 Nov 2026, on Joel's instruction: Neon branch `backup-before-content-import-2026-11-16` made from main, then `--apply --refresh --remote-drafts` created the 4 events and 3 posts (Neon had none), and the 7 were published by status only.
