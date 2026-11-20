# Website full audit, 20 Nov 2026

A review of the whole app as it stands at commit 374ed50: public site, builder portal, dashboard, database, auth, uploads, dependencies and build. Findings are grouped by area. Each one says where it is, what is wrong, why it matters, how sure I am, what to do, and whether it is fixed or waiting for Joel.

Category A: safe fix, made in this audit. Category B: needs Joel's approval first. Category C: product or design recommendation, not built.

## How this was checked

Everything below was run or read on 20 Nov 2026. Nothing touched Neon, S3 or Google.

| Check | How | Result at the start |
|---|---|---|
| Types | `pnpm typecheck` | Pass |
| Lint and copy rules | `pnpm lint` (ESLint plus `check:copy`) | 0 errors, 11 copy warnings, all in docs quoting the launch event's real title |
| Unit tests | `pnpm test` | 253 passed |
| Migrations | `prisma migrate deploy` on an empty local PGlite database, then `prisma migrate diff` against `schema.prisma` | Apply cleanly, no drift |
| Production build | `next build` against the local database | Pass. Shared JS 102 kB, home 120 kB first load |
| Routes | `curl` against `next start` on port 3211 | Every public route 200 or the expected 404, except two `/sign-in` URLs that return 500 (S3) |
| Access control | Local test sessions for a member, an editor and an admin, made like `e2e/dev/helpers.ts` does | Members refused all 21 dashboard routes; editors redirected from all 8 admin-only routes; signed-out visitors sent to sign-in; export API 401 |
| Uploads | `POST /api/uploads` as a member, for an event, another person's project, a path-traversal id and malformed JSON | All refused (401 or 400) |
| Links and markup | Script in Chrome fetching 13 public pages | 18 internal links, none broken; every image has alt text; one `h1` per page; every page has a title and description |
| Layout | Each route in a 375px and a 768px frame, measuring element edges, not only page scroll width | Public: no overflow outside intended scrollers. Portal and dashboard (26 routes) at 375: no overflow, no script errors |
| Headers | `curl -D` | No security headers; `X-Powered-By: Next.js` |
| Dependencies | `pnpm audit --prod`, `pnpm outdated --prod` | 8 advisories in 3 packages (S1, S10) |
| Secrets in Git | `git log --all -p` scanned for AWS, Google, Neon, private key and `AUTH_SECRET` patterns; `.env*` history checked | Nothing committed. `.env`, `.env.local` and `.neon` exist locally and are ignored |

Not verified, with the reason:

- **Real concurrency.** No Docker and no Postgres install on this laptop. PGlite runs one transaction at a time, so it cannot show a race. See D3.
- **Google sign-in, S3 uploads, Amplify.** Each needs a real external action. Sessions were made directly in the local database instead, as the e2e tests do.
- **Neon.** Read nothing, wrote nothing. Whether Neon has the platform migration and seed applied is still Joel's open item in docs/DEPLOY.md.

After the fixes (commits ef50059, 89aa786, 8993f80, 6700459):

| Check | Result |
|---|---|
| Types, lint and copy rules | Pass; the same 11 doc warnings |
| Unit tests | 259 passed (6 new) |
| Integration tests, local PGlite | 11 passed (2 new, `records.int.test.ts`) |
| Production build | Pass; shared JS 102 kB and home 120 kB, unchanged |
| End to end, `next start`, one worker, local database with the reviewed content imported | 129 passed, 0 failed, 27 skipped by design (1 new test, for D1) |
| Error pages | Each exercised in Chrome: a real race on `/admin/users`, a portal save and a portal page load with the database stopped |

## 1. Critical security issues

None found. The access model is sound: every dashboard page and action calls `requireRole()`, every portal page and action calls `requireMember()` or `requireUser()`, roles are read from the database on every request, and `src/lib/admin/guards.test.ts` fails the build if an action skips its guard. The runtime probe above agreed with the code.

## 2. Security issues

### S1. Next.js 15.5.28 has three published advisories. Medium. A. Fixed

- **Where:** `package.json`, `pnpm-lock.yaml`.
- **Problem:** GHSA-7qx7-33qx-rqx2 (SVG rejection bypass in image optimisation), GHSA-f3mh-rxg3-f5g2 (HttpOnly cookie exposure on Edge runtime routes), GHSA-pc58-hwjq-p385 (cross-client response injection when forwarding fetched responses). All patched in 15.5.29.
- **Why it matters:** this app does not use the Edge runtime or forward fetched responses, so real exposure is low, but the patch is inside the pinned `~15.5` range and costs nothing.
- **Fix:** `next` and `eslint-config-next` to 15.5.29. No change of major or minor version (W1 still holds).

### S2. No security headers; the dashboard can be framed. Medium. A. Fixed

- **Where:** `next.config.ts`.
- **Problem:** responses carry no `X-Frame-Options` or `frame-ancestors`, no `X-Content-Type-Options`, no `Referrer-Policy`, and they announce `X-Powered-By: Next.js`.
- **Why it matters:** any site can load `/admin` in an invisible frame and trick a signed-in admin into clicking through a two-step delete or a role change (clickjacking). Without a referrer policy, full portal URLs (with search terms) go to external sites.
- **Evidence:** `curl -D - http://localhost:3211/` before the fix. `grep` found no iframe or device API use anywhere in `src`, so strict values break nothing.
- **Fix:** `poweredByHeader: false`, and on every route: `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and `Strict-Transport-Security: max-age=31536000` (ignored over plain HTTP, so local work is unaffected). A full script CSP is S7.

### S3. `/sign-in?error=constructor` returns a 500. Low. A. Fixed

- **Where:** `src/app/sign-in/page.tsx`. The dashboard sign-in page shows one fixed message and is not affected.
- **Problem:** the error code from the URL is looked up with `SIGN_IN_ERRORS[error]`. Inherited names such as `constructor` and `__proto__` find a function or an object, and React fails to render it.
- **Evidence:** `curl` gave 500 for `?error=__proto__` and `?error=constructor`.
- **Why it matters:** anyone can link to a crashing sign-in page. No data is exposed.
- **Fix:** a `signInMessage()` helper in `src/lib/auth-rules.ts` that checks own keys only, with tests. After the fix both URLs return 200 with "Sign in did not work. Try again."

### S4. Upload route answers 401 to a signed-in member who may not upload. Low. A. Fixed

- **Where:** `src/app/api/uploads/route.ts`.
- **Problem:** a member asking to upload to an event, or to someone else's project, gets 401 "Sign in again to upload", which is wrong and confusing: they are signed in.
- **Fix:** 401 when nobody is signed in; 403 "You cannot add an image here." when signed in without permission.

### S5. Bound action arguments are trusted at runtime. Low. A. Fixed

- **Where:** `setUserRole` in `src/app/admin/(protected)/users/actions.ts`, `setMemberStatus` in `src/app/admin/(protected)/members/actions.ts`.
- **Problem:** values passed with `.bind()` come back from the browser and are not encrypted. `role` and `status` are typed but not checked. Both actions require ADMIN, and Prisma rejects unknown enum values, so the effect is an unhandled 500, not a privilege change.
- **Fix:** reject anything outside the enum before touching the database.

### S6. Google OAuth tokens are stored in plain text and never used. Low. B. Needs approval

- **Where:** `account` table (`accessToken`, `refreshToken`, `idToken`), written by Better Auth.
- **Why it matters:** the app only needs the verified email. A database leak would hand over live Google tokens for every member.
- **Proposal:** turn on Better Auth's OAuth token encryption, or clear the three columns after sign-in with a database hook. Either changes auth configuration, so it waits for Joel.

### S7. No Content Security Policy for scripts. Low. B. Needs approval

- **Where:** `next.config.ts`, `src/app/layout.tsx` (inline theme script).
- **Proposal:** a CSP with `script-src 'self'` plus the SHA-256 hash of `THEME_SCRIPT`, `img-src 'self' data:` plus the S3 host, `connect-src 'self'` plus the S3 host for presigned PUTs. Next's own inline scripts need a nonce, which makes every page dynamic, or `'unsafe-inline'`, which weakens the policy. Worth a decision, not a quick change.

### S8. The QR code carries the check-in code. Info. C

- **Where:** `src/app/admin/(protected)/events/[id]/attendance/page.tsx`.
- **Problem:** a photo of the projector, shared in a group chat, lets someone check in from home while the window is open. The window, the per-member limit and "New code" already limit this.
- **Option:** rotate the code on the projector view every few minutes. Product decision.

### S9. Better Auth's own rate limiter keeps counts in memory. Info. B

- **Where:** `src/lib/auth.ts`.
- **Problem:** on Amplify each instance counts separately. Only Google OAuth endpoints are exposed, so the risk is small. Moving it to database storage needs a new table, so it is a schema change.

### S10. Build-time dependencies with advisories. Info. Not changed

- `postcss@8.4.31` bundled inside `next` (four advisories about source map loading) and `effect@3.20.0` inside the Prisma CLI (a ReDoS). Both run only at build time on our own files. They clear when Next and Prisma update them.

## 3. Data integrity and backend issues

### D1. Removing an admin user deletes their whole member account. High. A. Fixed

- **Where:** `removeUser` in `src/app/admin/(protected)/users/actions.ts`.
- **Problem:** it deletes the `AdminUser` row and then `user.deleteMany({ where: { email } })`. The `user` row cascades to the member profile, check-ins, XP and credits ledger, submissions, projects, redemptions and notifications. Project images stay in S3 with nothing pointing at them.
- **Why it matters:** core team members are also members. Taking someone off the dashboard (for example when they hand over a role at the end of the year) would silently erase their attendance record and everything they earned, with no privacy request row and no audit row. The comment says the intent was to end their sessions; that line dates from before member accounts existed.
- **Evidence:** read from the code; the cascade rules are in `prisma/schema.prisma`.
- **Fix:** remove only the `AdminUser` row. `requireRole()` reads that table on every request, so dashboard access ends at once and the member record stays. Role changes and removals now write an `AuditLog` row (`admin.role`, `admin.remove`), which they did not before.

### D2. Rate limits can be exceeded by simultaneous requests. Medium. A. Fixed

- **Where:** `withinLimit` in `src/lib/platform/records.ts`.
- **Problem:** it reads the counter, decides, then writes. Under Postgres's default isolation two requests read the same count and both write count + 1, so a burst can pass the limit. The check-in limit is what stops code guessing.
- **Fix:** create the row if missing, then `SELECT ... FOR UPDATE` it inside the transaction, so hits for one key run one after another. Same pattern as `lockMember()` in the engine. New test `src/lib/platform/records.int.test.ts`.
- **Limit of the evidence:** the new test passes before and after the fix on PGlite, which serialises transactions (D3). The race is shown by reasoning about Postgres READ COMMITTED, not by a run.

### D3. The "concurrent" integration tests cannot fail on PGlite. Medium. C

- **Where:** `src/lib/platform/engine.int.test.ts`, docs/DEPLOY.md.
- **Problem:** PGlite runs one query at a time, so tests for "three check-ins at once" and "two redemptions at once" pass whether or not the locking is right.
- **Recommendation:** run `pnpm test:int` against a real Postgres 15+ (a local install or a CI service container, never Neon) before trusting the concurrency guarantees.

### D4. The "last admin" check is not atomic. Low. Not changed

- **Where:** `checkChange` in `src/app/admin/(protected)/users/actions.ts`.
- **Problem:** two admins demoting each other in the same second could both pass the count. Very unlikely for a team of six to ten; noted, not fixed.

### D5. Referral checks are not locked. Low. Not changed

- **Where:** `recordCheckIn` and `rewardReferral` in `src/lib/platform/engine.ts`.
- **Problem:** two check-ins at once for one member can both see "not the first session", and the monthly cap is counted without a lock. Effect: a missed or an eleventh referral award. Low stakes.

### D6. A member project's write-up has no length limit. Low. A. Fixed

- **Where:** `memberProjectSchema` in `src/lib/validation/project.ts`.
- **Problem:** title and summary are limited, the write-up is not, so a member can store up to the 1 MB request limit, which then renders on the public project page.
- **Fix:** 5,000 characters for members. Editors' curated projects keep no limit.

## 4. Functional and reliability issues

### F1. No error pages. High. A. Fixed

- **Where:** no `error.tsx` or `global-error.tsx` anywhere in `src/app`.
- **Problem:** any error while rendering (a Neon cold start that times out, a connection limit, a server action that throws, such as "There must be at least one admin") replaces the whole page with Next's unstyled "Application error: a server-side exception has occurred", with no navigation and no way back.
- **Fix:** an error page for the public site, the portal and the dashboard, inside each one's own layout, with a Try again button and a link home; and a `global-error.tsx` for failures in the root layout. Plain copy, existing tokens, no new components.

### F2. No feedback while a portal or dashboard page loads. Medium. C. Tried, reverted

- **Where:** `src/app/builder/(app)`, `src/app/admin/(protected)`.
- **Problem:** every portal and dashboard page is dynamic and reads the database. On a slow connection, or a Neon cold start, a click shows nothing until the next page arrives.
- **What happened:** a `loading.tsx` in each area streamed a "Loading" state ahead of the content, as intended. It also broke four end-to-end flows and a status code, so it was taken out again:
  - `/builder/projects/<someone else's id>` returned 200 instead of 404. Once streaming has started, a later `notFound()` cannot change the status. The not-found page still showed and nothing leaked, but the boundary test failed.
  - After a server action, the page did not update in three flows (redeeming then applying a banner, an admin refund, adding a team member), and once in the admin removal flow.
  - Without the two files, the same 18 member and admin flow tests pass on a fresh build.
- **Recommendation:** keep loading feedback at the component level instead: the pending states on buttons (F3), and `<Suspense>` around slow sections of a page, which keeps the page's own status and redirects. Worth doing page by page if Neon cold starts are noticed in practice.

### F3. Destructive confirmations and Google sign-in have no pending state. Medium. A. Fixed

- **Where:** `src/components/admin/ConfirmAction.tsx`, `src/components/admin/GoogleSignIn.tsx`.
- **Problem:** "Yes, delete" stays clickable while the action runs, so a second click sends it again. The Google button gives no sign it was pressed and swallows a failed request.
- **Fix:** disable and relabel while pending; show an error if the sign-in request fails.

## 5. UI, UX and accessibility issues

### U1. Repeated forms share element IDs. Medium. A. Fixed

- **Where:** `src/components/admin/fields.tsx`, seen on `/admin/rules` (four forms, each with `id="xp"`, `id="credits"`, `id="description"`).
- **Problem:** every label after the first points at the first form's input, so screen readers announce those inputs with no name, and clicking a label focuses the wrong field.
- **Evidence:** the 375px route scan listed nine unlabelled inputs on `/admin/rules`.
- **Fix:** `AdminForm` gives its fields a unique ID prefix with `useId()`.

### U2. Help text under form fields is not announced. Low. A. Fixed

- **Where:** `src/components/admin/fields.tsx`.
- **Problem:** help paragraphs have an ID but no input points at them.
- **Fix:** inputs reference their help text with `aria-describedby`, alongside the error.

### U3. The image upload button's focus ring is invisible on the light theme. Low. A. Fixed

- **Where:** `ImageField` in `src/components/admin/fields.tsx`.
- **Problem:** `focus-within:outline-white`, missed by the theme pass. White on paper.
- **Fix:** the `focus` token, like every other focus ring.

### U4. The dashboard has no skip link. Low. A. Fixed

- **Where:** `src/app/admin/(protected)/layout.tsx`.
- **Problem:** the public site and the portal have one; the dashboard's long sidebar has to be tabbed through on every page.
- **Fix:** the same skip link as the portal.

### U5. Projector code wider than a phone. Low. Already in tasks/todo.md

Recorded on 17 Nov. Unchanged.

## 6. Performance

Measured on the production build, local database:

| Measure | Value |
|---|---|
| Shared first-load JS | 102 kB |
| Home first-load JS | 120 kB |
| Heaviest dashboard form pages | 151 kB (Markdown preview in the browser) |
| Home HTML | 230 KB raw, 38 KB gzip |
| Home images | 36; hero preloaded; 26 lazy; the other 9 eager ones are small decorative tiles |
| Public pages | Static, refreshed every 60 s (`s-maxage=60`) |

No action needed now. Two notes for growth:

- **P1.** `getEvents()` reads every column, including bodies and photo lists, for list pages. Fine at five events; select only list fields past about 100. C.
- **P2.** The sitemap has no `lastModified`. Search engines recrawl less smartly. C.

## 7. Maintainability and architecture

- **M1. No CI.** No `.github` workflows, so typecheck, lint, tests and the build only run when someone remembers. C.
- **M2. Patch updates waiting.** `better-auth` 1.7.14 to 1.7.26, AWS SDK, `lucide-react`. Better Auth is auth, so update it on its own with the e2e flows. B (stack).
- **M3. The code is in good shape.** Clear layering (`lib/` pure rules with tests, `engine.ts` for every award, thin actions), consistent guards, comments that say why. No dead code or unused dependencies stood out.

## 8. Recommendations

Ranked by value for the group. Impact and effort are relative to each other; none of these adds a feature for its own sake.

| # | Recommendation | Why | Impact | Effort | Priority |
|---|---|---|---|---|---|
| 1 | Finish the portal launch checklist in docs/DEPLOY.md: platform migration and seed on Neon, `projects/*` in the bucket policy, Google consent screen published, the Data Protection Act check in the privacy notice | The portal is built and tested but cannot open to members until these are done. Nothing else on this list matters as much | High | Low, Joel's access needed | Now |
| 2 | CI on every push: typecheck, lint, unit tests, a production build, and the integration tests against a Postgres service container (M1, D3) | Every check in this audit ran by hand. CI keeps them true, and a real Postgres finally tests the locking (D2, D3) | High | Low | Now |
| 3 | Basic production monitoring: an Amplify or CloudWatch alarm on 5xx responses, and a free uptime check on `/` and `/builder` | Today an outage is noticed when a student says so. The new error pages show a reference that matches the server log, which only helps if someone reads the logs | High | Low | Next |
| 4 | Decide S6: encrypt or discard Google OAuth tokens | Removes the most sensitive thing the database holds, which the app never uses | Medium | Low | Next |
| 5 | Decide S7: a script Content Security Policy | Defence in depth against injected scripts, now that members can write text that goes public | Medium | Medium | Next |
| 6 | Update Better Auth (1.7.14 to 1.7.26) on its own, with the e2e flows (M2) | Auth patches; kept apart so a regression is easy to trace | Medium | Low | Next |
| 7 | Event structured data (schema.org `Event`) on event pages, and `lastModified` in the sitemap (P2) | Sessions can show in Google with date and venue, which helps students find the next one. Uses data the site already has | Medium | Low | Later |
| 8 | A rotating check-in code on the projector view (S8) | Stops remote check-in from a shared photo, which matters once XP buys real rewards | Medium | Medium | When physical rewards start |
| 9 | Lock the referral and last-admin checks (D4, D5) | Small correctness gaps that only bite under unusual timing | Low | Low | Later |
| 10 | List queries that select only list fields (P1) | Keeps public pages light as the event archive grows | Low | Low | Past about 100 events |

Not recommended: a redesign, new sections or more motion. The public site is consistent, accessible (axe clean on 17 Nov), fast enough on mobile and already says what the group does. The gains now are in launching the portal safely and keeping it running.

## Status

| ID | Severity | Category | Status |
|---|---|---|---|
| S1 | Medium | A | Fixed |
| S2 | Medium | A | Fixed |
| S3 | Low | A | Fixed |
| S4 | Low | A | Fixed |
| S5 | Low | A | Fixed |
| S6 | Low | B | Waiting for Joel |
| S7 | Low | B | Waiting for Joel |
| S8 | Info | C | Recommendation |
| S9 | Info | B | Waiting for Joel |
| S10 | Info | | Not changed |
| D1 | High | A | Fixed |
| D2 | Medium | A | Fixed, race not reproducible here |
| D3 | Medium | C | Recommendation |
| D4 | Low | | Not changed |
| D5 | Low | | Not changed |
| D6 | Low | A | Fixed |
| F1 | High | A | Fixed |
| F2 | Medium | C | Tried and reverted (broke 404 status and action refreshes) |
| F3 | Medium | A | Fixed |
| U1 | Medium | A | Fixed |
| U2 | Low | A | Fixed |
| U3 | Low | A | Fixed |
| U4 | Low | A | Fixed |
| U5 | Low | | Already tracked |
