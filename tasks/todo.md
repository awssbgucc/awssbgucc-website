# Todo

Plans go here as checkable items before any work starts. Each phase in BUILD_PROMPT.md gets its own section. Add a review at the end of each phase: what was built, what was checked, what is left.

## Open questions for Joel

- [ ] Confirm group email: awssbgucc@gmail.com or awsbuildergroup.ucc@gmail.com
- [ ] Check the Box Leader's Library: brand kit hex values, logo files, Amazon Ember files and any web-use notes
- [ ] Ask the program team whether SBG sites may use "aws" in the domain
- [ ] Choose and buy a domain
- [ ] WhatsApp community link, LinkedIn, Instagram, X links
- [ ] Team photos, programmes and levels
- [ ] CANSSAG full name and logo, CITSA and AmaliTech Coding Club logos
- [ ] Exact dates, venues, Meetup links and attendance for past events
- [ ] Written approval from UCC to use the pixel crest (show them assets/pixel-art/ucc-crest-preview.png)
- [ ] Members count and departments count for the stats row
- [ ] Confirm every member benefit against the current program terms
- [ ] Event summaries and body text for all six seeded events (see C3)

## Phase 0: read and plan

- [x] Read CLAUDE.md, docs/, tasks/
- [x] Write the Phase 1 plan here
- [x] List contradictions, TODO(joel) items and disagreements
- [x] Check in with Joel (31 Oct 2026: all five decisions below approved as recommended)

Also checked: all three grids match their declared sizes, the Cape Coast cell is land with 5 land neighbours, `check:copy` passes on the starter files, and token contrast was calculated. No project code was written.

## Decisions needed before Phase 1

Only these block Phase 1. Everything else below can wait for its own phase.

- [x] **Next.js version.** I recommend pinning Next.js 15 (see W1), which departs from "current stable" in CLAUDE.md.
- [x] **Tokens.** May I add `--color-white`, `--color-danger` (#f87171) and `--color-logo-purple` (#a95df3)? Components may not use raw hex, but the docs need all three (C7).
- [x] **Contrast.** How do we fix the failing purple and faint text (C8)? I recommend using faint for non-text only, and a lighter purple for text once the brand kit hex values are confirmed. Until you decide, Phase 1 uses the tokens as written and the styleguide shows the failures.
- [x] **Map label.** May the label stay under the map until the two-column layout starts, instead of only under 480px (C10)? I recommend yes.
- [x] **Git.** This folder is not a git repository. May I run `git init` and add a `.gitignore`? I recommend yes, with commits only when you ask.

## Phase 1: scaffold and design system

### Scaffold

- [x] Run `git init` and add a `.gitignore` covering `.env*`, `.next`, `node_modules` and test output (if approved)
- [x] Generate the scaffold in a temporary folder and move it in, so README.md and the other starter files are not overwritten
- [x] Next.js App Router with `src/`, TypeScript `strict`, Tailwind v4, ESLint, pnpm
- [x] Add Vitest and Playwright with Chromium, and a test config for 375px and 1280px
- [x] Add package scripts: `dev`, `build`, `typecheck`, `lint`, `test`, `test:e2e`, `check:copy`
- [x] Make `pnpm lint` run ESLint and then `check:copy`
- [x] Add `src/lib/copy-rules.ts` with types, re-exporting `scripts/copy-rules.mjs`

### Tokens and fonts

- [x] Add the DESIGN.md tokens to `src/styles/globals.css` under `@theme`, plus any approved additions
- [x] Define `--grad-brand`, and limit it to the second hero line
- [x] Load Geist Mono and Geist through `next/font/google`, exposed as `--font-mono-face` and `--font-sans-face`
- [x] Put the font classes on `<html>`, so the `@theme` font variables resolve at `:root`
- [x] Set the global focus ring (cyan, 2px, 2px offset) and base reduced-motion rules
- [x] Make the hero headline shrink below about 360px wide, so it cannot overflow (C11)

### Primitives (`src/components/ui/`)

- [x] Button: primary, secondary, text; 44px minimum height; link and button forms
- [x] Tag: the five event tags, with colours from the accent table
- [x] Card, Container, Section (alternating background), Eyebrow

### Pixel grids

- [x] Pure helpers in `src/lib/pixel/`: parse a grid, seeded hash for the 1 in 9 texture, row colour mix, land-only halo cells
- [x] Vitest tests: declared sizes match the JSON, the hash is stable and close to 1 in 9, halo cells are never sea, the marker is in the expected cell
- [x] `<PixelGrid />`: server-rendered inline SVG with `role="img"` and `aria-label`
- [x] Draw one path per row and opacity, rather than one node per cell. The map has 592 land cells and the crest has 1151, so this keeps the DOM small and makes the row-by-row fade simple
- [x] Set map row colours with CSS `color-mix` on the tokens, so no hex is duplicated in components
- [x] Set the gap in `viewBox` units. It is about 2px at desktop size and scales down on phones, as `ghana-preview-small.png` shows (C9)
- [x] `<PixelMap />`: gradient fill, 70% and 50% opacity, lime cell, land-only halo, pulse ring, leader line and label
- [x] Map motion in CSS only: north to south fade, one marker flash, then the pulse. Under reduced motion: no fade or pulse, and a static 5 by 5 ring at 70%
- [x] Reserve the map's aspect ratio, so nothing shifts on load
- [x] Render the crest and chip from their own JSON palettes, with no recolouring. The chip stays static
- [x] Add the crest's one-time fade on first view with the smallest possible client script, since it sits below the fold

### Styleguide and verification

- [x] `/styleguide`: every primitive and all three grids; returns 404 in production
- [x] Playwright smoke test: `/styleguide` loads in dev, and returns 404 on a production build
- [x] Compare the map side by side with `ghana-preview.png` and `ghana-preview-small.png`
- [x] Check reduced motion, keyboard focus and horizontal scroll at 320px, 375px, 768px and 1280px
- [x] Run `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm check:copy`
- [x] Capture screenshots at 375px and 1280px, write the review here, then stop for Joel

### Phase 1 review (31 Oct 2026)

Built: the Next.js 15.5.28 scaffold, tokens, Geist fonts, the six primitives, `<PixelGrid />`, `<PixelMap />`, the crest and chip renders, and `/styleguide`.

Checked:

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (12 tests) and `pnpm check:copy` pass
- Playwright: the styleguide renders all three grids at 375px and 1280px, and returns 404 on a production build
- No horizontal scroll at 320px, 375px, 768px, 1024px and 1280px, and no console errors
- Pulse ring sampled over time: 3 by 3 to 5 by 5, fading out, repeating every 3s
- Reduced motion: no animations, static 5 by 5 ring at 70%
- The crest fade waits until it is scrolled into view
- Tab focus: cyan 2px ring with a 2px offset, and 44px button height
- Map compared by eye with `ghana-preview.png`

Changes from the plan or the docs:

- The two-column hero and the map's side label start at 1280px, the desktop size in DESIGN.md. At 1024px the 80px headline wrapped and the map was too small
- TypeScript stays on 5 and ESLint on 9, because `eslint-config-next` 15 requires ESLint 9 or lower. pnpm reports ESLint 9.39.5 as no longer supported, so this goes away only when we can move to Next.js 16
- `lucide-react` is pinned to 1.64.0, because pnpm's release age policy rejected 1.65.0 as too new. The `unrs-resolver` install script is denied
- Playwright uses ports 3210 and 3211, because 3100 is used by another local project

Left:

- `/` returns 404 until Phase 2, and there is no favicon yet
- The purple and faint contrast failures remain until the brand kit colours are confirmed
- Committed as 58ad68f

## Phase 2: public pages with static data

Decisions from Joel, 31 Oct 2026: events are added from the dashboard later, so none are seeded. Everything else follows the recommendations in this file.

- [x] Typed content in `src/lib/content/static.ts`, shaped like the models in docs/ADMIN.md, with tested selectors
- [x] Home, events list, event detail, team, partners, blog list, post detail, 404, nav, mobile menu and footer
- [x] Metadata, Open Graph image, sitemap, robots and a favicon
- [x] Copy updated in docs: hero name (C18), `Work with us` (C17), muted eyebrows (W6)
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm check:copy`
- [x] Screenshots of every page at 375px
- [ ] Lighthouse mobile 90+ on the default settings: not met on this laptop, see the review

### Phase 2 review (31 Oct 2026)

Checked:

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (23 tests) and `pnpm check:copy` pass
- Playwright: 18 dev tests at 375px and 1280px, and 3 production tests pass
- No horizontal scroll or console errors on any page at 375px and 1280px
- Event and post layouts checked with sample records at `/styleguide/preview`, which returns 404 in production

Lighthouse on the home page, production build, this laptop (Ryzen 3 2200U):

| Setting | Performance | Accessibility | Best practices |
|---|---|---|---|
| Default, 4x CPU slowdown, 3 runs | 76 to 85 | 96 | 100 |
| 2x CPU slowdown, my estimate of a typical phone on this CPU, 5 runs | 90 to 94 | 96 | 100 |

For comparison, the near-empty `/blog` scores 85 to 90 on the default setting, so most of the gap comes from this CPU and the framework. The home page costs about 8 more points, from hydrating the map SVG and its animation. `will-change` and inlined CSS did not help, so both were reverted. Run PageSpeed Insights on the deployed site in Phase 7 for the real figure.

Accessibility is 96 because of the Bootcamp tag's purple contrast (C8).

Choices made to avoid inventing content:

- The bootcamp card leaves out the voucher sentence and has no schedule yet (C19)
- The nav and footer use text until the official logo file is in `public/brand/`
- The 404 page leaves out the pixel chip until the program contact confirms it (W7)
- The closing section drops its WhatsApp sentence until the link exists (C21)
- Partner tiles show names until logos arrive
- The blog shows only its headline and intro while it has no posts, and the Past tab appears once a past event exists
- `/scd` and the Community Day card stay off (C29). The "Live now" dot is dropped (C30)
- The favicon is a lime square on the background colour, our own mark and not the logo. Say if you want something else

Left:

- Committed as 3c38419

## Phase 3: database

Decisions from Joel, 31 Oct 2026: a 60-second refresh timer (W2), remove `Event.featured` (C4), seed the team inactive (C2).

- [x] Prisma 7.10.1 schema from docs/ADMIN.md, without `featured`
- [x] First migration, seed from `prisma/seed-data.ts`, and query functions that read published and active records only
- [x] Public pages static, with a 60-second refresh
- [x] Verified on a throwaway local Postgres
- [ ] Run the migration and seed on Neon: needs Joel's connection strings
- [ ] Confirm the refresh timer on Amplify Hosting: needs a deploy, in Phase 7

### Phase 3 review (31 Oct 2026)

Checked on a throwaway local Postgres, not on Neon:

- A fresh database migrates and seeds without errors, and seeding again changes nothing
- Seeded site: published partners show. CANSSAG, the inactive team and the gated content do not
- With test rows on a production build: a new published event, an activated team member and a settings change all appeared after the 60-second timer, with no rebuild
- A draft event that was sooner than the published one never appeared, and draft event and post pages returned 404
- After a rebuild, the sitemap listed the published event and no drafts. The test rows were then removed
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (25 tests) and `pnpm check:copy` pass. Playwright: 18 dev and 3 production tests pass

Changes from the plan or the docs:

- Uses `@prisma/adapter-pg`, not the Neon adapter, because it works with both Neon and local Postgres. Neon's docs show the Neon adapter, so check this on the first connection
- Prisma's `latest` tag on npm is a version 8 release candidate, so Prisma is pinned to stable 7.10.1
- The install scripts for `@prisma/engines`, `prisma` and `esbuild` are denied, and migrate, generate and seed still work
- `pnpm build` and the Playwright tests now need `DATABASE_URL`. Amplify needs it at build time and at run time
- The first visitor after 60 seconds still gets the old page and triggers the refresh, so changes show after about a minute, on the next visit
- BUILD_PROMPT.md Phase 4 still mentions revalidating on save. That is not needed with the timer, apart from the admin's own screens

Left:

- Committed as b3468ec

## Phase 4: admin auth and content management

Decisions from Joel, 31 Oct 2026: Better Auth (W3), move buttons instead of drag (W8), and admin saves reject only dashes and emojis (C23).

- [x] Better Auth with Google, an `AdminUser` allowlist on sign-up and sign-in, and `requireRole()` in every page and action
- [x] Screens for overview, events, team, partners, posts, settings and users
- [x] Copy rules on save, publish rules, slugs, draft previews and `updatedBy`
- [x] Unit tests and the unauthenticated redirect test
- [ ] Real Google sign-in: needs Joel's OAuth client ID and secret
- [ ] Choose the real database and run the migrations on it

### Phase 4 review (31 Oct 2026)

Checked on a throwaway local Postgres, with signed sessions created directly in the database, because no Google credentials exist yet:

- Better Auth's real hooks: an outsider is rejected with no row created, a removed admin cannot start a session, and a listed admin can
- A valid session for an email not on the allowlist sees only "This account does not have access"
- Every flow in a browser: create, edit, publish, preview, reorder, activate, delete, settings, and adding and removing users
- A draft is 404 publicly, and its preview needs sign in. An edit reaches the public page
- An editor has no settings or users links and is sent away from those pages. A removed editor loses access at once
- The only admin cannot remove or demote themselves
- No horizontal page scroll at 375px. Tables scroll inside their own box

Not checked: the Google redirect itself, and the server actions called directly by an editor, which rely on the same `requireRole('ADMIN')` line as the pages.

Changes from the plan or the docs:

- Added `updatedBy` to `TeamMember` and `Partner`, because ADMIN.md says every write sets it and these two models had no field for it
- No `revalidatePath` on public pages, because the 60-second timer replaces it (W2)
- No SCD switch in settings (C29), no pixel chip on sign-in (W7), and no middleware, because Amplify does not support edge middleware
- Partners use a publish switch, not an active switch (C1)

Database decision for Joel: the AWS account is on a paid plan with no credits. RDS db.t4g.micro in eu-west-1 costs about $18.60 a month ($12.41 instance, $2.54 for 20 GB, about $3.65 public IPv4). Neon's free tier costs nothing. Recommendation: Neon.

Left:

- Phase 4 is not committed

## Phase 5: uploads

### Decisions needed before I start

- [ ] **D1. Credentials (W4).** No AWS keys in environment variables. Amplify rejects variable names that start with `AWS`, so the two in CLAUDE.md cannot be set there. On Amplify: an SSR Compute role with the one-bucket policy. Locally: an IAM user with the same policy, used through a named profile (`AWS_PROFILE=sbg-ucc`), which the SDK picks up by itself. CLAUDE.md and `.env.example` change to match.
- [ ] **D2. No SVG in v1 (W4).** The browser uploads straight to S3, so the server never sees the bytes and cannot sanitise them without a second step that downloads and rewrites every SVG. `next/image` also refuses SVG unless `dangerouslyAllowSVG` is on. Logos become transparent PNG or WebP. ADMIN.md lines 147 and 149 change to match.
- [ ] **D3. Partner logos: PNG or WebP only.** The partner tile turns logos into white shapes (`brightness-0 invert`), so a JPEG logo on a white background shows as a white box. Photos and covers take JPEG, PNG or WebP.
- [ ] **D4. Uploads on the edit screen only.** Keys contain the record id (`team/<memberId>/...`), and a new record has no id until it is saved. The new form says "Save first, then add a photo." The alternative is to make the id when the new form opens, which leaves files behind when a form is abandoned.
- [ ] **D5. Event gallery waits.** ADMIN.md lists gallery uploads, but DESIGN.md and CONTENT.md never say where the gallery shows. Proposal: this phase does team photos, partner logos, and event and post covers. The gallery comes back when it has a design, so we do not store photos that show nowhere.
- [ ] **D6. The bucket.** eu-west-1 (af-south-1 is an opt-in region and costs more). Objects are public to read through a bucket policy, because `next/image` fetches them by URL. At our size it costs cents a month. Either I create the bucket, CORS rule, policies and IAM user with your `default` AWS CLI profile, or you create them by following DEPLOY.md. I need one or the other to meet the "done when" check.
- [ ] **D7. Commit Phase 4 first**, as its own commit, so the two phases stay separate in the history.

### Plan

- [ ] Add `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- [ ] `src/lib/uploads/rules.ts`, pure and unit tested: allowed types for each kind, the 5 MB limit, the key builder `<folder>/<recordId>/<random>.<ext>`, and a check that a URL is in our bucket under the right record
- [ ] `src/lib/uploads/s3.ts`: the S3 client, a presigned PUT that signs the content type and exact size so S3 refuses any other file, valid for 5 minutes, and a delete helper
- [ ] A server action, not an API route, that calls `requireRole()`, checks the record exists, checks type and size, and returns the upload URL and the public URL
- [ ] On save, zod accepts only a URL from our bucket under that record. After a save replaces or removes an image, and after a record is deleted, the old file is deleted from S3
- [ ] `ImageField` in `src/components/admin/`: file picker, preview, status text, remove button. It checks type and size first for a quick message; the server checks again
- [ ] Add the field to the team, partner, event and post forms, their schemas and actions
- [ ] `images.remotePatterns` in `next.config.ts`, built from `S3_PUBLIC_BASE_URL`
- [ ] `.env.example`: `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_BASE_URL`, and a note on `AWS_PROFILE`
- [ ] `docs/DEPLOY.md`: bucket settings, Block Public Access, the public read bucket policy, CORS for the site and `localhost:3000`, the IAM policy JSON (`s3:PutObject` and `s3:DeleteObject` on `arn:aws:s3:::<bucket>/*` only), the Amplify Compute role and the local profile
- [ ] Update ADMIN.md and CLAUDE.md for D1 to D3
- [ ] Tests: unit tests for the rules, and a Playwright check that a signed-out request for an upload URL is refused
- [ ] Verify on the real bucket: upload a team photo and a partner logo, then see both on the public site at 375px and 1280px. Try a 6 MB file, a GIF, an SVG, and a PUT with a different size from the signed one, and confirm each is refused

Known gap: a file uploaded and then never saved stays in the bucket. A lifecycle rule cannot tell those apart from used files, so v1 accepts a few orphans.

## Contradictions in the docs

Each item ends with what I propose. Items marked "blocks Phase N" need an answer before that phase.

### Data and content

- **C1. Partner `active` does not exist.** ADMIN.md scope and screens give partners a deactivate action and an active switch, and CONTENT.md counts "active partners". The model only has `status`. Proposal: treat active as PUBLISHED and use a publish switch on that screen. Blocks Phase 3.
- **C2. Team members cannot be drafts.** CONTENT.md seeds every record as Draft unless marked Published, but `TeamMember` has no status and `active` defaults to true, so unreviewed team records would go live. Proposal: seed them with `active` false, and you switch them on after review. Blocks Phase 3.
- **C3. Seeded events cannot satisfy the model.** `startsAt`, `endsAt`, `summary` and `body` are required. Three events have no exact date, four have no end time, and none has a summary or body. The rules forbid inventing them. Proposal: make these four fields optional in the database and required only for publishing. This is a data model change, so it needs your approval. Blocks Phase 2 and Phase 3.
- **C4. `featured` is unused.** The model has `Event.featured`, but CONTENT.md picks the soonest upcoming event. Proposal: remove the field. Blocks Phase 3.
- **C5. "Open role" cards have no data.** DESIGN.md wants them, but `TeamMember.name` is required and no open roles are listed. Proposal: leave them out of v1. Blocks Phase 2.
- **C6. Initials or no placeholder avatars.** DESIGN.md bans placeholder avatars, and CONTENT.md shows initials until a photo is uploaded. Proposal: follow CONTENT.md, because initials do not pretend to be a person. Blocks Phase 2.

### Design

- **C7. Raw hex is banned, but the docs require it.** The destructive red, the chip's `#a95df3` (not the same as `--color-purple`, `#b460ef`), and the white used by primary buttons have no tokens. Proposal: add the three tokens listed above. Crest colours stay in its JSON. Blocks Phase 1.
- **C8. Tokens fail the 4.5:1 rule in DESIGN.md.** `--color-text-faint` fails on every surface (3.68 on bg, 3.48 on bg-alt, 3.32 on card, 2.98 on card-raised). `--color-purple` passes only on bg (4.73) and fails on bg-alt (4.47), card (4.27) and card-raised (3.84). That covers the Group Leader label and the Bootcamp tag. Blocks Phase 1.
- **C9. A fixed 2px gap cannot scale with the container.** DESIGN.md asks for a 2px gap, a cell size set by container width, and server-rendered SVG with no client JS. The server does not know the width. Proposal: use a proportional gap, which matches the previews. Blocks Phase 1.
- **C10. The map label does not fit just above 480px.** At 480px the map is 80% of 432px, which leaves at most 86px beside it. The coordinate line needs about 120px. At 768px, an 80% wide map would also be about 840px tall. Proposal: keep the label under the map until two columns start, and cap the map's width. Blocks Phase 1.
- **C11. The 44px hero overflows at 320px.** "Cape Coast." is about 281px wide in Geist Mono, with 272px available, which breaks the no horizontal scroll rule. Proposal: shrink the type below 360px only.
- **C12. What accents are for.** "Color means something" and "never decorate" conflict with lime on every eyebrow and the accent markers on the About points. Lime also already marks the live state, the Cape Coast pixel, events roles and the Networking tag. Proposal: see W6. Blocks Phase 2.
- **C13. One idea per section, or more.** The principle says one paragraph and one action, while the hero has three actions and About has two paragraphs and three points. Proposal: CONTENT.md wins, and the principle is a guide.
- **C14. Chip placement.** CLAUDE.md says each grid appears in one place only, while DESIGN.md and COMPLIANCE.md give the chip two pages. The dev-only styleguide adds a third, and shows the crest with its gate off. Proposal: the specific docs win, and the styleguide is exempt because it returns 404 in production.
- **C15. Ember is not one monospace face.** The docs ask for a monospace display face, but option 1 names Ember Display and Ember Mono without saying which fills `--font-mono-face` or what the body uses. Proposal: stay on Geist (see W5).
- **C16. Coordinates round inconsistently.** The JSON has lat 5.1053 and lon -1.2466. The label's `5.10 N  1.25 W` truncates one and rounds the other. Proposal: keep the label as written, since it is the approved copy and also matches the preview. Say if you prefer 5.11.

### Copy against the rules

- **C17. A question as a heading.** CLAUDE.md bans rhetorical question headings, and CONTENT.md has `Want to work with us?`. Proposal: `Work with us`, if you agree. Blocks Phase 2.
- **C18. Name variant in the hero.** COMPLIANCE rule 7 bans other name variants, and rule 6 bans implying the university runs the group. The hero says `UCC's AWS Student Builder Group`. Proposal: `We are the AWS Student Builder Group at University of Cape Coast.` Blocks Phase 2.
- **C19. Bootcamp card against rule 21.** Public bootcamp copy should state the schedule and goal only. The card adds voucher terms and gives no schedule. Proposal: you check the voucher line against the program terms, and supply the schedule to add. Blocks Phase 2.
- **C20. Community Day short name.** Rule 8 requires the full name at first mention, but the home card uses only the short form. Proposal: use the full name on the card. It stays hidden until the page is on.
- **C21. WhatsApp copy with no link.** The closing paragraph mentions the WhatsApp community, but the button disappears while the link is a TODO. Proposal: send me the link before launch, or I add a Meetup-only version of that line. Blocks launch.
- **C22. Number ranges.** CLAUDE.md allows a hyphen for number ranges, and in the same sentence says to write them with "to". Proposal: always use "to".

### Code and scope

- **C23. Admin copy rule scope.** ADMIN.md rejects dashes and emojis with one specific message, but `isCleanCopy` also fails on banned phrases. A post containing a banned word would be told to remove a dash that is not there. Proposal: add a check for characters and emojis only, and use it for admin saves. Blocks Phase 4.
- **C24. Helper name.** CLAUDE.md says `requireAdmin()`, while ADMIN.md and BUILD_PROMPT.md say `requireRole()`. Proposal: `requireRole()`.
- **C25. Where presigning lives.** CLAUDE.md puts it under `api/`, while ADMIN.md uses a server action. Proposal: server action.
- **C26. SVG sanitising cannot happen with a direct upload.** ADMIN.md sanitises SVGs before saving, but also says the server never handles file bytes. A presigned PUT also does not enforce the 5 MB limit by itself. Proposal: see W4. Blocks Phase 5.
- **C27. Logo normalising.** DESIGN.md says partner uploads are normalised to SVG or transparent PNG. ADMIN.md describes no such step, and allows JPEG and WebP. Proposal: restrict the logo field to SVG and PNG, with no conversion. Blocks Phase 5.
- **C28. Pixel logo lockup.** The "Later" list in BUILD_PROMPT.md suggests a pixel version of the group logo lockup, which COMPLIANCE rules 1 and 4 forbid. It also puts a landmark in About, where the crest sits. Proposal: remove the lockup idea.
- **C29. `/scd` in v1.** CLAUDE.md lists the route and ADMIN.md has the switch, but its content models are a later phase, and Phase 2 omits the page. Switching it on would show an empty page. Proposal: no route or switch in v1; keep the field for later.
- **C30. Unspecified features.** The announcement bar is in the schema with no design or copy, and the "Live now" dot has no data or location. Proposal: build the bar in Phase 2 to the existing tokens, and drop the dot.
- **C31. Phase count.** README.md says seven phases, and BUILD_PROMPT.md has eight, counting Phase 0. Proposal: correct the README.

## TODO(joel) by file

Line numbers are from the files as they stand today.

### docs/DESIGN.md

- Line 48: confirm the accent hex values against the Box brand kit
- Line 92: check Box for licence or usage notes on embedding Amazon Ember on the web

### docs/COMPLIANCE.md

- Line 24: ask UCC in writing for approval of the pixel crest, and show them the preview
- Line 48: ask the program team about "aws" in the domain before buying anything

### docs/CONTENT.md

- Line 13: confirm the group email
- Line 15: WhatsApp community link
- Line 17: LinkedIn link
- Line 18: Instagram link
- Line 19: X link
- Line 45: members on Meetup
- Line 47: departments represented
- Line 104: confirm every benefit against the program terms
- Line 167: team photos, programmes and levels
- Line 186: CANSSAG full name and logo
- Line 190: verify every event title, date and venue; attendance must come from the records
- Line 194: exact date of the group launch session
- Line 195: exact date of the certifications talk
- Line 196: exact date and venue of the first in-person build session
- Line 201: Meetup URL for every event

Not marked, but also missing: a start time for the Freshers Onboarding event on line 197.

### Other files

CLAUDE.md:92, BUILD_PROMPT.md:14, 45 and 59, CONTENT.md:3 and lessons.md:21 mention TODO(joel) only as a rule. They are not open items. Nothing is marked in README.md, scripts/ or assets/.

## Decisions I think are wrong

### W1. "Next.js current stable" on Amplify Hosting. Blocks Phase 1.

Current stable appears to be 16.x. The latest result I found was 16.2.10 from July, so I will confirm with the registry at scaffold time. AWS documents Amplify compute for Next.js 12 through 15. Proposal: pin the latest 15.x, which still received patches as of July, and move to 16 when AWS documents support. The alternative is to change host, which conflicts with the reason for choosing Amplify.

### W2. `revalidatePath` on Amplify Hosting. Decide before Phase 3.

ADMIN.md relies on it to show changes within seconds, but the AWS page lists on-demand ISR as unsupported, along with streaming and edge middleware. Proposal: use time-based ISR for public pages, at 60 seconds, which is on the supported list. Deploy a small test to Amplify before Phase 3 to confirm how it behaves.

Time-based ISR also fixes a separate flaw. With only on-save revalidation, a finished event stays in "Next event" and "Upcoming", and "Events run" stays low, until someone happens to save something.

### W3. Auth.js v5. Decide before Phase 4.

It is still in beta on npm after about four years. The Better Auth team took it over in September 2025, it is in security-patch mode, and they point new projects to Better Auth. A July 2026 advisory included a critical authentication bypass that affected only the v5 beta. That risk matters on a site whose only login guards the admin dashboard. Proposal: use Better Auth with Google and the same allowlist. It stores its data in the database, so it adds tables, and it needs your approval as a stack change. Check the role in the database on each action, so removing an admin takes effect immediately.

### W4. Long-lived AWS keys and direct SVG uploads. Decide before Phase 5.

Amplify does not allow environment variable names with an `AWS` prefix, so `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in CLAUDE.md cannot be set there. Proposal: use an Amplify SSR Compute role with the same one-bucket permissions, so there are no stored keys, and use the normal key only in local development under a different profile.

For uploads, use a presigned POST with a size limit for raster images. SVGs carry a stored script risk and `next/image` blocks them by default, so I would drop SVG uploads in v1 and accept transparent PNG for logos.

### W5. Amazon Ember as the first font choice. Decide before Phase 6.

COMPLIANCE rule 10 cites the trademark guidelines against imitating AWS fonts, even though the Playbook names Ember. Ember is also not a monospace family for body and display together, and it depends on a licence we have not seen. Proposal: make Geist the final choice, unless the Box notes clearly allow web use and you prefer Ember.

The same rule is why the brand kit check matters for colours. DESIGN.md took its accents from other groups' sites and names AWS Builder Center as a reference.

### W6. Lime on every eyebrow. Decide before Phase 2.

It weakens the one thing lime should do: draw the eye to Cape Coast. Proposal: use `--color-text-muted` for eyebrows and neutral markers on the About points. Keep lime for the marker, the live state and its table roles.

### W7. The pixel chip as a logo trace. Decide before Phase 2.

The Playbook says logos must not be recoloured or stretched, and the exception in COMPLIANCE rule 4 is ours, not the program's. The chip's source note also shows it is a redraw of the logo. Proposal: ask the program contact when you ask about the domain. If the answer is no or unclear, use the official logo file on those two pages. Your call, since COMPLIANCE.md needs your sign-off.

### W8. Drag to reorder. Decide before Phase 4.

It needs a new library or fragile native dragging, and it works poorly by keyboard and on phones. DESIGN.md requires keyboard access. Proposal: move up and move down buttons.

### W9. No content on the public site at launch. Decide before Phase 2.

Every event is a Draft and publishing needs a Meetup URL, so events, the next event card and "Events run" are all empty until the links are in. The blog has no seed posts or empty state text. The From Code to Cloud session is on Sat 14 Nov 2026, two weeks from today, so it is the first one to publish. Proposal: send me its Meetup link first. Hide "Events run" at zero, and give me one line of empty state copy for the blog.

### For later phases: not wrong, but the docs are out of date

- Phase 3: Prisma 7 moved connection URLs to `prisma.config.ts`, removed `directUrl` and requires a driver adapter. I will follow the current Prisma and Neon docs for the `DATABASE_URL` and `DIRECT_URL` split.
- Phase 7: AWS advises against keeping secrets in Amplify environment variables, so DEPLOY.md needs a proper home for the database, auth and OAuth secrets.

## Sources checked on 31 Oct 2026

- Amplify support for Next.js: https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html
- Amplify environment variables: https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html
- Amplify SSR Compute role: https://docs.aws.amazon.com/amplify/latest/userguide/amplify-SSR-compute-role.html
- Auth.js joining Better Auth: https://github.com/nextauthjs/next-auth/discussions/13252
- Auth.js v5 beta status: https://github.com/nextauthjs/next-auth/discussions/13382
- July 2026 security update: https://better-auth.com/blog/security-update-july-2026
- Prisma config reference: https://www.prisma.io/docs/orm/reference/prisma-config-reference
- Next.js versions: https://versionlog.com/nextjs/
