# Build prompt

Paste the section for the current phase into Claude Code. Do one phase per session. Each phase ends with a check-in; do not start the next phase until Joel approves.

---

## Phase 0: read and plan

```
Read CLAUDE.md, then every file in docs/, then tasks/lessons.md and tasks/todo.md.

Do not write any code yet. In tasks/todo.md, write a plan for Phase 1 as checkable items, and list:
- anything in the docs that contradicts itself
- every TODO(joel) you found, grouped by file
- any decision you think is wrong, with your reason

Then stop and wait for my reply.
```

## Phase 1: scaffold and design system

```
Scaffold the project as described in CLAUDE.md: Next.js App Router, TypeScript strict, Tailwind v4, pnpm, ESLint, Vitest, Playwright.

Then:
1. Put the tokens from docs/DESIGN.md into src/styles/globals.css under @theme.
2. Set up fonts with --font-mono-face and --font-sans-face. Use Geist Mono and Geist for now; Ember can replace them later if it is cleared.
3. Wire up scripts/check-copy.mjs as `pnpm check:copy` and make it part of `pnpm lint`.
4. Build the ui primitives: Button (primary, secondary, text), Tag, Card, Container, Section, Eyebrow.
5. Build <PixelGrid /> for any grid JSON, then <PixelMap /> on top of it for assets/pixel-map/ghana.json with the Cape Coast marker, exactly as docs/DESIGN.md describes, including reduced motion. Compare against assets/pixel-map/ghana-preview.png and ghana-preview-small.png.
6. Render the UCC crest and SBG chip from assets/pixel-art/ with <PixelGrid />.
7. Make a /styleguide route (dev only, 404 in production) that shows every primitive and all three grids.

Done when: typecheck, lint, test and check:copy pass, and /styleguide looks right at 375px and 1280px. Show me screenshots of both widths and stop.
```

## Phase 2: public pages with static data

```
Build every public page in docs/CONTENT.md using the copy exactly as written: home, events list, event detail, team, partners, blog list, post detail, and the footer and nav.

Read content from a typed module at src/lib/content/static.ts for now, shaped like the Prisma models in docs/ADMIN.md, so Phase 3 only swaps the data source.

Rules:
- Where CONTENT.md has a TODO(joel), render nothing for that item. Do not invent copy, stats or links.
- Follow docs/COMPLIANCE.md for the footer line, event terms link, logo use and naming.
- Mobile first. Check every page at 375px.
- Add metadata, Open Graph tags and a sitemap for public pages.

Done when: all checks pass, Lighthouse on mobile is 90+ for performance, accessibility and best practices on the home page, and you have screenshots of every page at 375px. Stop and show me.
```

## Phase 3: database

```
Add Prisma with the schema in docs/ADMIN.md, pointed at Neon via DATABASE_URL and DIRECT_URL.

1. Create the first migration.
2. Write prisma/seed.ts from the Seed data section of docs/CONTENT.md. Keep the Draft and Published statuses as listed. Keep TODO(joel) markers as code comments next to the affected fields.
3. Replace src/lib/content/static.ts with query functions in src/lib/content/ that read published records only.
4. Public pages stay statically rendered and are revalidated by path.

Done when: a fresh database seeds without errors, public pages render from the database, drafts do not appear anywhere public, and all checks pass. Stop and show me.
```

## Phase 4: admin auth and content management

```
Build the admin dashboard in docs/ADMIN.md, except uploads.

1. Better Auth with Google. Only AdminUser emails can sign in. Seed anarbajoel@gmail.com as ADMIN.
2. requireRole() in every server action and every admin page.
3. Screens for events, team, partners, posts, settings and users, as listed.
4. The shared copy rules in lib/copy-rules.ts reject em dashes, en dashes and emojis on save, with the message in docs/ADMIN.md.
5. Saving revalidates the right public paths.
6. Draft preview links for signed-in users.

Write tests for: role checks, the copy rules, publish rules for events, slug generation.
Add a Playwright test that an unauthenticated visit to /admin redirects to sign in.

Done when: all checks pass and I can sign in, edit an event, and see the change on the public page. Stop and show me.
```

## Phase 5: uploads

```
Add image uploads to S3 as described in docs/ADMIN.md: presigned PUT, type and size limits, SVG sanitising, key layout, next/image remotePatterns.

Write down the exact IAM policy JSON the access key needs, scoped to the one bucket, in docs/DEPLOY.md.

Done when: I can upload a team photo and a partner logo and see both on the public site. Stop and show me.
```

## Phase 6: polish and launch checks

```
1. Accessibility pass: keyboard through every page, check focus rings, alt text and contrast.
2. Performance pass: image sizes, font loading, no layout shift from the pixel map.
3. Run pnpm check:copy across the whole repo and the seeded database content.
4. Write docs/DEPLOY.md: Amplify Hosting setup, environment variables, Neon setup, Google OAuth setup, S3 bucket setup, and how to add a new admin.

Done when: everything in this list is ticked in tasks/todo.md, with a review section saying what was checked. Stop and show me.
```

## Phase 7: deploy

```
Walk me through deploying to AWS Amplify Hosting step by step using docs/DEPLOY.md. Do not run any command that creates or changes cloud resources without telling me first what it does and what it may cost.
```

---

## Revised plan, 5 Nov 2026

Joel asked for the complete platform rather than a staged MVP. Built in one pass, in milestones recorded in tasks/todo.md:

1. Foundations: schema, award engine, member auth beside the admin allowlist
2. Design system: typography roles, portal primitives and shell
3. Builder portal
4. Dashboard for the whole platform
5. Public site redesign
6. Verification

What remains before launch is in tasks/todo.md under the platform build review. Phases 6 (polish) and 7 (deploy) below still apply.

## Later

- Student Community Day content models and admin screens (agenda, speakers, sponsors, FAQ), then switch on `/scd`.
- Pixel art of a UCC landmark for the About section, and a pixel version of the group logo lockup.
