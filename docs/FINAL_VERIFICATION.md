# Final verification

Thu 5 Nov 2026. Checked on Joel's laptop against a throwaway local database (PGlite on port 5433). Nothing was committed, pushed or deployed, and no production service was changed. Neon, the live S3 bucket and the Google OAuth client were not written to.

**Assessment: not ready for production deployment yet.** The code works end to end against a local database and a production build, but four things outside the code have to happen first: the Neon migration, the S3 bucket policy and CORS, a live Google sign-in test, and Joel's decisions on privacy and sign-up. The deployment section at the end has the order.

## 1. What is implemented

Three surfaces in one Next.js app, as in `docs/PLATFORM.md`:

- **Public site:** home with the Ghana pixel map, events and event detail with recaps and materials, projects, team, partners, blog, contact, privacy notice, code of conduct, public member profiles at `/builders/[handle]`, Community Day page (off by default).
- **Builder portal** (`/builder`): Google sign-in, three-step onboarding, dashboard, sessions, check-in by venue code or QR, challenges and submissions, projects, progress (XP, levels, streaks, achievements, participation grid), rewards and profile customisation, community directory, notifications, profile and privacy controls (download data, correction request, delete account).
- **Admin dashboard** (`/admin`): events and attendance (QR, editor add and remove), posts, announcements, team, partners, Community Day, members (suspend, adjust balance, message, delete), challenges, submission review, projects review, reports, rewards and redemptions, achievements, XP and credit rules, privacy requests, audit log, site settings, admin users.

## 2. Feature status

| Feature | Status | Evidence |
|---|---|---|
| Public pages render, compliance footer, no horizontal scroll | Verified and functional | `site.spec.ts`, 9 pages at 375 and 1280, on dev and on the production build |
| Event management: create, publish, appears publicly | Verified and functional | `journeys.spec.ts` |
| Member onboarding | Verified and functional, with a seeded session | `journeys.spec.ts`. Google itself was not in the loop |
| Member and admin permission boundaries | Verified and functional | `journeys.spec.ts`, `boundaries.spec.ts`, `admin.spec.ts`, `guards.test.ts` |
| Suspension | Verified and functional | Suspended member redirected; admin suspension ends sessions, blocks the API, is audited |
| Attendance check-in | Verified and functional | Wrong code refused, pays once, duplicate detected, 10 tries per 10 minutes enforced |
| Challenge submission | Verified and functional | Non-GitHub link refused, saved, visible to reviewer |
| Submission approval and rejection | Verified and functional | Approval pays 77 XP once; rejection needs feedback, pays nothing, is audited, feedback reaches the member |
| XP and credit awards | Verified and functional | Ledger rows checked in the database; concurrent check-ins pay once (`engine.int.test.ts`) |
| Reward redemption | Verified and functional | Balance 100 to 40, owned reward shown; concurrent redemptions cannot overspend (`engine.int.test.ts`) |
| Refunds and reversals | Verified and functional | Admin refund restores credits once, removes the banner from the profile, is audited |
| Profile customisation | Verified and functional | Owned banner applied; the server checks ownership |
| Public profile visibility | Verified and functional | 200 and noindex while public, 404 once private; private and members-only profiles 404 publicly |
| Data export | Verified and functional | Own data only, `no-store`, no referrer id, 401 signed out and when suspended |
| Account deletion | Verified and functional | Confirmation by handle; user, sessions, ledger removed; privacy request and audit row kept |
| Portal phone navigation, admin phone menu | Verified and functional | `journeys.spec.ts` (mobile project) |
| Google sign-in for members and admins | Blocked by external configuration | Needs the consent screen and redirect URIs; see section 9 |
| Sign-up domain limit, unverified email refusal, suspension at sign-in | Implemented but not fully verified | Rules unit-tested (`auth-rules`); the Better Auth hooks run only on a real Google sign-in |
| Member project images | Blocked by external configuration | Upload API refusals verified; a real upload needs the bucket policy and CORS |
| Project review and approval award | Implemented but not fully verified | Code reviewed; no end-to-end test |
| Referrals, streaks, achievements beyond the first | Implemented but not fully verified | Rules unit-tested; "achievements once" in `engine.int.test.ts`; no browser flow |
| Editor role kept out of admin-only actions | Implemented but not fully verified | 14 `requireRole('ADMIN')` calls; every action has a guard (`guards.test.ts`); no browser test as an editor |
| Announcements, notifications, reports, audit log page, privacy request handling, Community Day admin | Implemented but not fully verified | Pages load (200) for an admin; no flow tests |
| Pixel crest, pixel chip on 404 and admin sign-in, SBG logo | Incomplete, waiting on approval | `TODO(joel)` in code; COMPLIANCE.md rules unchanged |
| Neon production database | Blocked by external configuration | Migration not applied |
| Amplify hosting and domain | Blocked by external configuration | Not deployed |

## 3. Automated tests run

All on Thu 5 Nov 2026, after the fixes in section 6.

| Check | Result |
|---|---|
| `pnpm typecheck` | Passed |
| `pnpm lint` (ESLint and check:copy) | Passed, 236 files, 0 errors, 0 warnings |
| `pnpm test` | 195 of 195 passed |
| `pnpm test:int` (local database) | 9 of 9 passed |
| `next build` (local database) | Passed, 55 static pages |
| Playwright dev suite on the production build (`next start`): `site`, `admin`, `journeys`, `boundaries` | 62 passed, 0 failed, 14 skipped |
| Playwright dev-only tests on `next dev`: styleguide and preview | 4 of 4 passed |
| Playwright production checks (`e2e/prod`) on the production build | 4 of 4 passed |

The 14 skips are tests marked for one viewport only (for example "One run is enough" on mobile, "Phone layout only" on desktop), by design. Nothing was skipped because it failed.

**How it was run.** One worker, one Next server at a time. The dev suite ran against `next start` on port 3210, using a temporary config that only changed the web server to reuse it, then deleted. Under `next dev` the laptop's memory forced the dev server to restart itself twice ("approaching the used memory threshold"), and the recompiles pushed page loads past the 5 second assertion window. No timeouts were raised, and no assertions were removed or loosened. The two styleguide tests need `next dev`, because those pages return 404 in production by design, so they ran there separately.

**New tests** in `e2e/dev/boundaries.spec.ts`: rejection, a member reaching only their own records, check-in attempt limit, admin suspension, admin refund, data download and account deletion. In `journeys.spec.ts`: the admin phone menu.

**Test fixes.** Three locators were ambiguous: `getByRole('alert')` also matched Next's route announcer, `getByLabel('End')` also matched "Attendance", and feedback text appears in both the feedback panel and the history list. Each was narrowed to the element meant, with the same expected text. One assertion of mine matched audit rows from earlier runs and now uses the redemption id. `cleanUp()` now also removes e2e audit rows.

**Not run:** Lighthouse, a real Google sign-in, a real S3 upload, anything against Neon or Amplify, screen reader testing, real phones.

## 4. Browser journeys

In headless Chromium through Playwright, with signed sessions written to the local database (the same cookie Better Auth issues):

- Signed out: portal and dashboard redirect to sign in; upload and export APIs answer 401.
- Newcomer: onboarding in three steps to the dashboard.
- Member: wrong and right check-in codes, eleven attempts in a row, submission with a bad and a good link, redemption, applying a banner, making the profile public and private, downloading data, deleting the account.
- Admin: creating and publishing an event, approving and rejecting submissions, suspending a member, refunding a redemption, the phone menu.
- Two members: one cannot open the other's draft project, see their submission, or get their data in an export.

## 5. Screenshots

`review/screenshots/`, 112 files, named `<surface>-<page>-<width>.png` at 375, 768, 1280 and 1440, full page, from the production build with fixture data. The folder is in `.gitignore`, because the admin pages show Joel's email.

Pages: public home, events, event detail, projects, team, partners, member profile; member sign-in, onboarding, dashboard, sessions, check-in, challenges, submission, progress (achievements and progression), rewards, profile (with customisation); admin sign-in, overview, events, event edit, attendance, members, member detail, challenges, challenge edit, submissions, rewards.

Each load was also checked for console errors, horizontal overflow, the number of h1 headings, unlabelled form controls, links and buttons without a name, and images without alt text. Final run: no console or hydration errors, no overflow, one h1 on every page, nothing unlabelled.

## 6. UI and UX issues found and fixed

1. **Admin on a phone opened on 480px of links.** Every admin page at 375 began with the whole navigation. It now folds behind a Menu button below 1024px and closes after navigation (`src/components/admin/SidebarNav.tsx`).
2. **No current page in the admin nav.** Now marked with `aria-current` and an underline, as the portal already does.
3. **Member sign-in button below the first screen on phones,** and with it any suspended or wrong-domain error. The feature list is hidden below 640px (`src/app/sign-in/page.tsx`).
4. **Focus ring on the onboarding heading at load.** The global `:focus-visible` rule beat the heading's `outline-none`. Elements focused only by script (`tabindex="-1"`) no longer get the ring; keyboard focus everywhere else is unchanged (`src/styles/globals.css`).
5. **No h1 on public member profiles.** The member's name is now the h1 there (`ProfileCard` `nameIsHeading`).
6. **Refunds had no confirmation.** "Cancel and refund" was one click. It now asks first, like every other destructive admin action.

Looked at and left alone: the phone map shows only the southern rows (DESIGN.md asks for it); stat labels such as "1 Check-ins recorded" are the CONTENT.md labels; desktop nav links are 20px tall with spacing, which passes WCAG 2.5.8; admin tables scroll sideways inside their frame on phones.

All three surfaces share the tokens, the two type families, the label style and the dark cards. The portal and admin use the same sidebar pattern; the public site keeps its own nav.

**Hydration warning.** "A tree hydrated but some attributes of the server rendered HTML didn't match" appeared on `/builder/profile` and `/admin/events/[id]` during the first run of the page sequence on a fresh `next dev`. It did not appear when the same pages were loaded warm, loaded first on a cold server, or in a second cold run of the full sequence, and it never appeared on the production build (224 page loads). Both times the dev server had just started on a `.next` folder written by `next build`; I think it is a dev compile race, but I could not capture the diff, so it is not proven. If it shows up in development again, copy the full message from the console.

## 7. Security and privacy findings

Fixed:

1. **Deleting an account left project images in S3.** Both self-service and admin deletion now remove the member's project images after the database transaction, as the other delete paths already did.
2. **The privacy notice understated what is kept after deletion.** It said "without your profile"; the code keeps the email address and account id in the privacy request and audit log. The sentence now says so.

Verified:

- Admin rights come only from `AdminUser`, read on every request; a member session is refused on every admin route (24 routes in the platform build review, 5 again here).
- Members cannot read another member's projects, submissions or export; the user id always comes from the session.
- Suspension ends sessions at once, and `requireMember()` and `currentMember()` refuse a suspended profile.
- XP is paid once per action (unique ledger key); approved submissions cannot be reviewed again; credits cannot be spent twice (row lock plus balance check); refunds are paid once.
- Check-in: 10 attempts per member per 10 minutes, kept in the database so it holds across server instances.
- Uploads: admins any folder, members only `projects/<id>/` for a project they own; JPEG, PNG or WebP only, no SVG, 5 MB, content type and exact size signed, 5 minute URLs.
- Private data: portal and export responses are `private, no-store`; members-only materials are not in public event HTML; private and members-only profiles 404 publicly; no emails on public pages; public profiles are rendered per request.
- Audit rows are written for suspension, deletion, balance changes, check-in edits, reviews, redemption changes, reward edits and messages.

Open, for Joel:

3. **Draft project images are public by URL.** The bucket policy makes all of `projects/*` readable, so an image is reachable before review if someone has its address. Addresses contain a random id and are not listed anywhere. Accept, or keep drafts under a private prefix and copy on approval.
4. **The data export includes reviewer emails** (`reviewedBy` and the history `actor`). Strip them, or keep them as part of the member's record.
5. **No limit on upload URL requests.** A member can request many 5 MB uploads into their own project folder; unsaved files stay in the bucket. Low cost at this size.
6. **Reversals are partial by design.** Removing a check-in takes back its XP but not a referral award it triggered; rejecting a project after approval keeps the XP. Use a balance adjustment.
7. **Any editor can delete an event,** which takes back the check-in XP it gave. Challenges and rewards need an admin. Confirm editors should have this.
8. **Uploaded bytes are not inspected.** S3 serves them with the signed image type. Member images are reviewed before they show publicly.
9. **`RateLimit` rows are never cleaned up.** Harmless at this size.

## 8. Migration and seed review

`prisma/migrations/20261105090000_add_member_platform/migration.sql` was read in full and not run against Neon. It only adds: 21 new tables, enums, indexes and foreign keys, and nullable columns on `Event` (`checkInCode`, `checkInOpensAt`, `checkInClosesAt`) and `SiteSettings` (`memberEmailDomains` and the Community Day fields). No drops, renames, type changes or updates to existing rows. One behaviour change: deleting an event now also deletes its check-ins.

`prisma/seed.ts` was read, not run. Every write is `createMany` with `skipDuplicates`, so it never overwrites an edit. Two side effects to know:

- Running it on Neon again recreates any seeded team member or partner an admin has since deleted. Check the dashboard after the seed, or seed only the new tables (award rules, achievements, rewards).
- `SiteSettings` row 1 already exists, so `memberEmailDomains` stays empty: sign-up is open to any verified Google account until it is set in Site settings.

`pnpm db:fixtures` refuses any host that is not localhost, and the e2e helpers refuse a non-local `DATABASE_URL`.

## 9. Integration work remaining

### AWS (Joel, in the console)

- **IAM: no change needed.** The app's `sbg-ucc-uploads` policy already allows `s3:PutObject` and `s3:DeleteObject` on `sbg-ucc-uploads/*`, which includes `projects/*`. The local user `sbg-ucc-uploads-dev` was denied `GetBucketPolicy` and `GetBucketCors` when I tried to read them, which confirms it holds only that policy.
- **Bucket policy: one change.** Add `arn:aws:s3:::sbg-ucc-uploads/projects/*` to the `PublicReadUploads` statement (`s3:GetObject` only). It grants read, not write: writing still needs a presigned URL from the server. Block Public Access for ACLs stays on.
- **CORS:** add the production origin (and the Amplify branch URL if members will use it) next to `http://localhost:3000`, `PUT` only.
- **Amplify:** the SSR Compute role with the same policy, as in `docs/DEPLOY.md`.

Safe upload test, after the policy change: on a local dev server against the local database, sign in as a fixture member, create a draft project, upload a small PNG, and confirm the image shows and the object is under `projects/<id>/`. Then delete the project and confirm the object is gone. Repeat with a 6 MB file and a GIF, which must be refused. This writes one object to the bucket and removes it, so do it when Joel agrees.

### Neon (Joel)

1. Create a branch or restore point of `main` before migrating (Neon branches are instant). Record its name.
2. With `DIRECT_URL` set to the Neon direct connection in the shell: `pnpm db:deploy`. Check `prisma migrate status`.
3. Insert the initial configuration with `pnpm db:seed` (create-only), or only the new tables if team or partner rows have been deleted. Never run `pnpm db:fixtures` or the e2e tests there.
4. Set `memberEmailDomains` in Site settings if sign-up should be limited.
5. Keep the backup branch until the portal has run for a week.

### Google OAuth (Joel, no change made)

- Redirect URIs needed: `<NEXT_PUBLIC_SITE_URL>/api/auth/callback/google` for each origin (`http://localhost:3000` locally, then the production domain). Better Auth uses `NEXT_PUBLIC_SITE_URL` as its base URL and trusted origin, so on Amplify it must be the address members use, at build time and at run time.
- The consent screen must be published, or only listed test users can sign in.
- Live tests that only a real Google account can do: a new member signs up and lands on onboarding; an admin email reaches `/admin`; a wrong-domain email is refused once a domain is set; a suspended member is refused at sign-in; an unverified email is refused.

## 10. Privacy and compliance

The privacy notice describes what the code stores, and was corrected once (section 7). It is **not** a legal review. Outstanding:

- Check against Ghana's Data Protection Act, 2012 (Act 843), and ask UCC whether the group must register with the Data Protection Commission (`TODO(joel)` in `src/app/(site)/privacy/page.tsx`).
- How long records are kept, including the deletion note with an email address. The notice names no period, and none should be invented.
- Members under 18, and who handles data requests (todo Q10, Q11).
- The code of conduct needs core team review before the portal opens: who to report to, how reporters are protected, and what happens after a report.
- `docs/COMPLIANCE.md` is unchanged. The crest and the pixel chip stay off until approved.

Other `TODO(joel)` items: group email address, WhatsApp and social links, member and department counts, team photos and levels, partner logos and the CANSSAG name, exam voucher wording and member benefits against current program terms, the blog empty state line, the official SBG logo, and the XP and credit values in `prisma/seed-data.ts`.

## 11. Operational risks

| Risk | Likelihood | Effect | Mitigation |
|---|---|---|---|
| First Google sign-in fails on the live domain (redirect URI, base URL) | Medium | Nobody can sign in | Test with one admin and one member account before announcing |
| Seed recreates deleted team or partner rows | Low | Wrong people on the team page | Check the dashboard after seeding |
| Open sign-up before a domain decision | Medium | Non-students in the directory | Set `memberEmailDomains`, or keep profiles private by default (they are) |
| Check-in codes shared outside the room | Medium | False attendance | Short windows, editor removal, code of conduct |
| Neon free tier scale-to-zero | Low | First request after idle is slower | Acceptable for a student group |
| One admin account | Medium | Locked out if Joel is unavailable | Add a second admin in Admin users |
| Uploads unusable until the bucket policy changes | High until done | Project images do not show | Section 9 |
| ISR refresh on Amplify not confirmed (todo W2) | Medium | Public pages lag behind edits by more than a minute | Check after the first deploy |

## 12. Decisions outstanding

1. Sign-up open to any verified Google account, or a UCC domain only.
2. Draft project images public by URL, or private until approval.
3. Reviewer emails in member exports.
4. Editors deleting events.
5. Data Protection Act review, retention period, members under 18, named owner for data requests.
6. Code of conduct review by the core team.
7. XP, credit and reward values.
8. When to run the Neon migration, and the S3 and OAuth changes.

## 13. Deployment readiness

**Do not deploy yet.** On the code side, the features in section 2 marked verified work end to end on a production build. Before members are invited:

1. Joel decides 1, 2 and 5 in section 12.
2. Neon backup branch, migration, seed (section 9).
3. Bucket policy and CORS, then the safe upload test.
4. Amplify deploy with the compute role and `NEXT_PUBLIC_SITE_URL`.
5. Google redirect URIs and consent screen, then the live sign-in tests.
6. A short look at 375 and 1280 on the live site, and a second admin account.
