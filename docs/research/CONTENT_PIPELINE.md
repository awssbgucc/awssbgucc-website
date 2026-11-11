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

The script only creates. A record matching an existing one by slug, Meetup event ID, title, or date and type is left untouched, so admin edits always win. Run it twice and nothing changes.

## Getting the content live (Joel)

1. All records in `content/community-history.json` were approved on 11 Nov 2026. Also correct the From Code to Cloud Meetup listing to 1:00 PM and the Computer Lab, New Science Annex.
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

I did not run step 3. Nothing was written to Neon.
