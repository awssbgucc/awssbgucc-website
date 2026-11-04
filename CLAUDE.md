# CLAUDE.md

Project rules for Claude Code. Read this file fully at the start of every session, then read `tasks/lessons.md` and `tasks/todo.md` before touching code.

## What we are building

The website for the **AWS Student Builder Group at the University of Cape Coast** (UCC), Cape Coast, Ghana. It is a student-led group in the AWS Student Builder Groups program.

Two surfaces:

1. **Public site.** Shows who we are, what we run, who runs it, and how to join. The site proves the group is real to students, faculty and sponsors. It does not replace Meetup, which stays the official membership and RSVP platform.
2. **Admin dashboard** at `/admin`. The core team uses it to manage events, team, partners, posts and site settings, without touching code.

Read these before building anything:

| File | What it holds |
|---|---|
| `docs/DESIGN.md` | Visual system: tokens, type, components, the pixel map, motion |
| `docs/CONTENT.md` | Real copy and seed data for every section. Use it verbatim |
| `docs/ADMIN.md` | Dashboard scope, data model, auth, permissions |
| `docs/COMPLIANCE.md` | AWS brand and trademark rules. Non-negotiable |
| `BUILD_PROMPT.md` | Phased build plan with acceptance checks |
| `assets/pixel-map/ghana.json` | Pre-generated Ghana pixel grid with Cape Coast marked |
| `assets/pixel-art/` | UCC crest and SBG chip pixel grids, with previews |

## Stack

These are decided. Do not swap any of them without asking Joel first.

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js, current stable, App Router, TypeScript `strict` | Server components for the public site, server actions for admin forms |
| Styling | Tailwind CSS v4, tokens in `@theme` from `docs/DESIGN.md` | One source of truth for colors and type |
| Database | PostgreSQL on Neon (free tier) | Free, serverless, no idle cost |
| ORM | Prisma | Typed queries, migrations, seed script |
| Auth | Better Auth, Google provider, email allowlist in the `AdminUser` table | No passwords to store or reset |
| Uploads | Amazon S3, presigned PUT from the server, images served through `next/image` | We are an AWS group; uploads stay cheap |
| Validation | zod, shared between server actions and forms | |
| Tests | Vitest for `lib/`, Playwright smoke tests for key routes | |
| Hosting | AWS Amplify Hosting | Fits the group; the build becomes an article topic |
| Package manager | pnpm | |

No UI kit (no shadcn, no MUI, no Chakra). Components are hand-built from the tokens so the site does not look like every other template. Icons: `lucide-react` only, used sparingly, never as decoration.

## Repository layout

```
src/
  app/
    (site)/            public pages: /, /events, /events/[slug], /team, /partners, /blog, /blog/[slug], /scd
    admin/             dashboard, all routes behind auth
    api/               only what server actions cannot do (upload presign, auth)
  components/
    site/              public components
    admin/             dashboard components
    ui/                shared primitives (Button, Tag, Card, Field)
  lib/
    db.ts              Prisma client singleton
    auth.ts            Better Auth config and requireRole() helper
    validation/        zod schemas, one file per model
    copy-rules.ts      re-exports scripts/copy-rules.mjs for zod refinements
  styles/
    globals.css        Tailwind import plus @theme tokens
prisma/
  schema.prisma
  seed.ts              seeds from docs/CONTENT.md data
scripts/
  copy-rules.mjs       the rules: banned characters, emojis, banned phrases
  check-copy.mjs       scans the repo with those rules, exits 1 on errors
  generate-pixel-map.mjs
  pixelate-image.py    turns an image into a pixel grid (dev tool, needs Pillow)
assets/pixel-map/
assets/pixel-art/
tasks/
  todo.md
  lessons.md
```

## Writing rules (apply to code, copy, commits, comments, alt text, seed data)

These are hard rules. `pnpm check:copy` enforces most of them and must pass before any task is marked done.

1. **No em dashes or en dashes.** Not in copy, not in comments, not in commit messages, not in headings. Use a comma, a colon, a full stop, or rewrite the sentence. Use a plain hyphen only inside compound words (`hands-on`, `in-person`) and for number ranges (`9:30 to 1:00`, written out with "to").
2. **No emojis.** Anywhere, including the admin UI, toasts and console logs.
3. **No AI giveaways.** Do not write:
<!-- check-copy:off -->
   - Filler words: delve, unlock, unleash, elevate, empower, harness, leverage, seamless, robust, cutting-edge, game-changer, world-class, state-of-the-art, supercharge, revolutionize, transformative, tapestry, landscape, realm, embark, journey (as a metaphor), next generation of, vibrant community, look no further, whether you're a, in today's fast-paced.
   - Structures: "It's not just X, it's Y", "From X to Y, we've got you covered", three-adjective stacks, rhetorical questions as headings, "Ready to...?" closers.
   - Placeholder content: lorem ipsum, fake testimonials, invented stats, stock photos, "Trusted by" logo rows for partners we do not have.
<!-- check-copy:on -->
   - The full list, with error and warning levels, lives in `scripts/copy-rules.mjs`. Warnings are for a human to judge; errors fail the check.
4. **Concrete beats clever.** Name the actual thing: "Saturdays, 4:30 PM, LT5" beats "regular sessions on campus". If a fact is missing, leave a `TODO(joel):` comment and render nothing. Never invent a fact to fill the space.
5. **Sentence case** for headings and buttons. "Join on Meetup", not "Join On Meetup".
6. **Ghana conventions.** British spelling (programme, organise, centre). Dates as `Sat 14 Nov 2026`. Times as `9:30 AM`. Timezone is GMT (Africa/Accra); store UTC, render in `Africa/Accra`.

## Design rules (summary, full detail in docs/DESIGN.md)

- Dark first. Background `--bg`, cards `--card`, hairline borders. No light theme in v1.
- Two type families only: a monospace display face for headings, a sans for body.
- Accent colors carry meaning (role labels, tags, the Cape Coast pixel). Never decorate with them.
- Pixel art is the signature. Three grids, each in one place only: the Ghana map with Cape Coast lit in the hero, the UCC crest in About (once approved), and the SBG chip on the 404 and admin sign-in pages.
- Banned design giveaways: glassmorphism, floating blurred gradient blobs, centred hero with a "New" pill badge above it, 3-column icon grids titled "Why join us", cards that all lift and glow on hover, sparkle icons, gradient text on body copy, scroll-jacking.

## Workflow

1. **Plan first.** For any task with 3+ steps or a design decision, write the plan to `tasks/todo.md` as checkable items. Stop and check in with Joel before implementing.
2. **Minimal impact.** Touch only what the task needs. No drive-by refactors.
3. **Verify before done.** A task is done when: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm check:copy` all pass, and you have looked at the result in a browser at 375px and 1280px wide. Say what you checked.
4. **When something breaks, stop and re-plan.** Do not stack fixes on a broken approach.
5. **Lessons.** After any correction from Joel, add the pattern and a rule to `tasks/lessons.md`.
6. **Ask before changing** the stack, the brand tokens, the data model, or anything in `docs/COMPLIANCE.md`.
7. **Commits:** imperative, lowercase, no emoji, no dashes as separators. Example: `add events list with past and upcoming tabs`.

## Commands

```
pnpm dev            local dev server
pnpm build          production build
pnpm typecheck      tsc --noEmit
pnpm lint           eslint
pnpm test           vitest
pnpm test:e2e       playwright
pnpm check:copy     node scripts/check-copy.mjs
pnpm db:migrate     prisma migrate dev
pnpm db:seed        prisma db seed
```

## Environment variables

```
DATABASE_URL=                 Neon pooled connection string
DIRECT_URL=                   Neon direct connection string (migrations)
AUTH_SECRET=                  openssl rand -base64 32
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
S3_BUCKET=
S3_REGION=                    eu-west-1 or af-south-1
S3_PUBLIC_BASE_URL=           https://<bucket>.s3.<region>.amazonaws.com
AWS_ACCESS_KEY_ID=            IAM user scoped to the one bucket, PutObject and DeleteObject only
AWS_SECRET_ACCESS_KEY=
NEXT_PUBLIC_SITE_URL=
```

Never commit `.env*` files. Never log secrets.
