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

## 9. Hardening and launch readiness, 22 Nov 2026

Joel's second phase: real concurrency tests, Google token storage, the Better Auth update, a Content Security Policy, CI, monitoring and the portal launch checklist. Everything ran against local databases on a throwaway PostgreSQL 17.7 (the official portable binaries, unzipped into a scratch folder with Joel's approval, listening on 127.0.0.1 only). Nothing was read from or written to Neon, S3 or Google. Nothing was pushed or deployed.

Where each change lives:

| Change | Where | Needs Joel |
|---|---|---|
| Race tests, D4 and D5 fixed | `main`, cde3941 | No |
| CI workflow | `main`, 86dc93f | Push, then optionally require it on `main` |
| Error logging, health route, monitoring plan | `main`, cbfd227 | The AWS and uptime steps in docs/DEPLOY.md |
| Stop storing Google tokens (S6) | `main`, cf9bc7d | Approved and merged 22 Nov |
| Better Auth 1.7.26 (M2) | `main`, ac1b317 | Approved and merged 22 Nov |
| Content Security Policy (S7) | `main`, f435521 | Approved and merged 22 Nov |

Joel approved all three on 22 Nov 2026. Each was rebased onto `main` in turn, so history stays linear. Checked on the merged code: typecheck, lint, copy check, 268 unit tests, 13 database tests on PGlite (the 9 race tests skip there and run in CI on PostgreSQL), and the production build with the full end-to-end suite on a fresh database with CI's placeholder environment: 132 passed, 0 failed, 30 skipped by design, 9.7 min.

### 9.1 Concurrency on real PostgreSQL (D2, D3, D4, D5)

New: `src/lib/platform/races.int.test.ts` and `src/lib/admin/users.int.test.ts`. Each case fires the requests together with `Promise.all` and repeats five rounds, because a race does not lose every time. They detect PGlite (`version()` reports wasm32) and skip there, so a pass on PGlite can no longer be mistaken for proof.

| Case | Protection | Result | With the protection removed |
|---|---|---|---|
| Rate limit, 15 requests at a limit of 5, five keys | Row lock in `withinLimit` (D2) | Exactly 5 each time | Old code: 3 runs of 3 failed, up to 15 of 15 let through |
| Two redemptions by one member | `lockMember` | One succeeds, balance right | Both succeed |
| Six members, one item left | Conditional stock decrement | One succeeds, stock 0 | All six succeed |
| Three cancels of one redemption | Conditional status update | One refund, stock restored once | All three succeed |
| Two editors approve one submission | Conditional status update | One approval, paid once | Both succeed (the ledger's unique key still stops a second payment) |
| Member and editor check the same person in | Unique key on CheckIn | One check-in, one award | Not mutated: needs a schema change |
| One referred member at two sessions at once | Unique ledger key | Referrer paid once | |
| Three referred members attend at once, referrer at 9 of 10 | Referrer row lock (new) | 10 | 12: **D5 confirmed and fixed** |
| Two admins demote or remove each other at once | Admin rows locked in one transaction (new) | One change, one admin left | Both succeed, no admin left: **D4 confirmed and fixed** |

All 21 database tests pass on real PostgreSQL, three runs in a row. D3 is resolved: CI runs these on a Postgres 17 service container on every push.

Fixes:

- **D5.** `rewardReferral` locks the referrer's profile row before counting this month's referrals. Deadlock check: every path takes at most this one profile lock, after its own inserts, and no path waits on another member's inserts while holding it.
- **D4.** `changeAccess()` in `src/lib/admin/users.ts` locks every ADMIN row, re-checks that the actor is still an admin, re-reads the target and applies the rule, in one transaction. The two dashboard actions call it after `requireRole('ADMIN')`. Behaviour is otherwise unchanged; the D1 end-to-end test still passes.

### 9.2 Google tokens (S6)

Traced through Better Auth 1.7.14's source:

- **Where written.** The OAuth callback (`oauth2/link-account`) stores `accessToken`, `refreshToken`, `idToken` and their expiry on the `account` row: on sign-up, on linking, and again on every sign-in (`updateAccountOnSignIn` defaults to on). All three paths go through `internalAdapter.createAccount`, `linkAccount` or `updateAccount`, which run the `account` database hooks.
- **Who reads them.** Nothing in `src`. Inside Better Auth only `/get-access-token`, `/refresh-token` and `/account-info` (none called by the app) and sign-out's provider logout, which Google does not have.
- **What Google issues.** The sign-in asks for `openid email profile` with no `access_type=offline` (checked on the live sign-in start: `access_type` is absent), so Google issues no refresh token. The access token reads the basic profile for one hour. The ID token is a signed one-hour identity assertion, and Better Auth's `/sign-in/social` accepts a Google ID token directly, so a leaked fresh one could start a session for that member within the hour.
- **Encrypt or discard.** `account.encryptOAuthTokens` encrypts the access and refresh tokens only; the ID token stays in plain text. Discarding removes all three and costs nothing, because nothing uses them.

Done on the branch: `databaseHooks.account.create.before` and `update.before` blank all five token fields (`withoutProviderTokens()` in `src/lib/auth-rules.ts`). Sign-in is unchanged: Better Auth reads the profile from the fresh token in memory before the row is written. The privacy notice now says the tokens are used once and not kept.

Verified: a database test writes accounts through Better Auth's own `createAccount`, `updateAccount` and `linkAccount` and finds every token null, with `accountId` and `scope` intact; with the hooks removed it fails (`accessToken: "access"`). Unit tests, typecheck and lint pass on the branch. The end-to-end suite was not rerun on it: no end-to-end test goes through the Google callback, which is the only path the change touches. Not verified: a real Google sign-in, which needs Joel's Google client.

Existing rows: tokens already in Neon expired within an hour of each sign-in, and none is a refresh token. Clearing them is tidiness, not urgency. After the branch is deployed, Joel can run on Neon (writes production data, so it is his call):

```sql
UPDATE "account" SET "accessToken" = NULL, "refreshToken" = NULL, "idToken" = NULL,
  "accessTokenExpiresAt" = NULL, "refreshTokenExpiresAt" = NULL WHERE "providerId" = 'google';
```

### 9.3 Better Auth 1.7.14 to 1.7.26 (M2)

Security advisories fixed after 1.7.14 (all in 1.7.16, published 3 Nov 2026), checked against this setup:

| Advisory | Affects this app? |
|---|---|
| GHSA-9hm7-xhfp-cx58, unverified OAuth email treated as verified | No. Google sends `email_verified` as a boolean; the bug was string values, generic OAuth and Zoom. The app's own sign-in check relies on this flag, so the fix is still welcome |
| GHSA-4wq4-2ppv-q3hg (critical), Expo authorization proxy signs values | No. Needs the `expo()` plugin. No secret rotation needed |
| GHSA-fvxx-76fc-893x, revoked sessions with secondary storage or cookie cache | No. Neither is configured |
| Phone number, email OTP, organisation, passkey, Stripe, SSO, Electron advisories | No. None of those plugins is used |

Release notes 1.7.15 to 1.7.26, the "Action required" items: all concern plugins or options this app does not use (JWT, OAuth provider, MCP, SCIM, MongoDB, passkey, generic OAuth discovery). Relevant fixes: social providers no longer follow redirects on token exchange (1.7.15), `getSession` no longer keeps an expired session in context (1.7.22), and `better-call` 1.4.6 accepts POST requests with no body (1.7.26). On 1.7.14, a bodyless `POST /api/auth/sign-out` answers 415 and leaves the session valid. The app's own Sign out button sends a JSON body and was confirmed in Chrome to delete the session, so this is not a live bug.

Migration: none. The lockfile change is limited to the Better Auth packages and `better-call`. The Prisma schema is unchanged and Better Auth's table definitions differ only in bundling.

Verified on the branch: typecheck, lint, 259 unit tests, 21 database tests on real PostgreSQL, the full production end-to-end suite (129 passed, 0 failed, 27 skipped by design, the same as `main`), and the auth probe on a production build (sign-in start returns Google's URL with PKCE and state, a forged callback is refused with `state_mismatch`, session reading; a bodyless sign-out now answers 200 and deletes the session, where 1.7.14 answered 415 and kept it). Not verified: a real Google round trip.

Recommendation: upgrade. No change in this app's behaviour was found, the update carries the 1.7.16 security fixes and closes the bodyless sign-out gap, and it is a patch release on the pinned minor. 1.7.27 (20 Nov) changes only plugins this app does not use.

### 9.4 Content Security Policy (S7)

Audit of what the pages load (source search plus the browser):

- Scripts: Next's own chunks from `/_next/static`, Next's inline data scripts, and one inline theme script in the root layout. No third-party scripts, no `next/script`, no `eval`.
- Styles: built CSS from the site, plus inline `style` attributes.
- Fonts: self-hosted with `next/font/local`.
- Images: the site, `/_next/image`, the uploads bucket (unoptimised previews in dashboard forms), and a `data:` PNG for the attendance QR code.
- Requests: the site (server actions, Better Auth, `/api/uploads`) and the bucket (the browser's presigned PUT, same origin as `S3_PUBLIC_BASE_URL`).
- Navigation to Google for sign-in is a full-page redirect, which CSP does not govern.
- No frames, workers, plugins, or forms posting off-site.

The policy, in `src/lib/csp.ts`:

- **Public pages** (static, refreshed every 60 s): `script-src 'self' 'unsafe-inline'`. A per-request nonce would force every public page to render per request, losing the static cache and waking Neon on every visit. Even so, scripts cannot come from another site, and requests and images can reach only the site and the bucket.
- **Portal, dashboard and sign-in pages** (already rendered per request): `src/middleware.ts` makes a nonce per response; `script-src 'nonce-…' 'strict-dynamic' 'sha256-<theme script>'`. An injected script does not run where the sessions and admin actions are.
- Both: `default-src 'self'`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: <bucket>`, `font-src 'self'`, `connect-src 'self' <bucket>`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `report-uri /api/csp-report`.
- The report route keeps only the directive, the blocked origin and the page path. It reads the body as a stream and answers 413 past 8,000 bytes, so a chunked request with no Content-Length cannot make it read more (fixed after the push, from an automated security review; a unit test fails with the old read).
- Violation reports are logged as `csp_violation` lines (directive, blocked origin, page path), so a page broken after deploy shows in CloudWatch.

Verified on a production build of the branch:

- Headers: `/`, `/events`, `/privacy` and `/api/health` carry the fixed form; `/sign-in`, `/admin/sign-in`, `/admin` and `/builder` a nonce, different on every request; one policy per response.
- In Chrome: every script on `/sign-in` carries the nonce except the theme script, which runs by its hash; the theme applied and the page hydrated.
- New end-to-end spec `e2e/dev/csp.spec.ts`: records every violation the browser reports on 8 public and sign-in pages and 16 portal and dashboard pages (signed in as an admin), including the attendance QR code (a `data:` image), the event form with its Markdown preview, and a real check-in submitted under the strict policy. None reported.
- The whole production end-to-end suite with the policy on: 132 passed (the 129 plus 3 new), 0 failed.
- The test can fail: with the theme hash left out of the policy, two of the three tests failed (the theme script was blocked and the page had no theme), and the server logged `csp_violation` lines naming `script-src-elem`, `inline` and `/sign-in`.
- `next dev` with the development form: sign-in and home pages load, hydrate and report nothing.

Not verified: a real upload to S3 (the bucket's origin is in `connect-src`; a unit test checks it matches the host the SDK signs presigned URLs for) and Google's sign-in redirect on the live domain (a full-page navigation, which the policy does not cover).

Recommendation: merge and deploy it enforcing, not report-only. Every page and flow the tests reach is clean, and a report-only policy with no one reading the reports protects nothing. For the first week after deploy, search the logs for `csp_violation`; if a page breaks, revert the branch's one commit. Keeping `'unsafe-inline'` on public pages is a deliberate trade: the alternative makes every public page dynamic.

### 9.5 CI (M1)

`.github/workflows/ci.yml`, on every push to `main` and every pull request into it, read-only token, no secrets:

| Job | Steps |
|---|---|
| Types, lint, copy and unit tests | `pnpm install --frozen-lockfile`, typecheck, lint (ESLint and the copy rules), unit tests |
| Database tests on PostgreSQL | Postgres 17 service container; migrations; a drift check (`prisma migrate diff`, fails if the schema and migrations disagree); database and race tests on the empty database |
| Production build and end-to-end tests | A second Postgres container; migrations, seed, development fixtures and the reviewed event history; Chromium; the production Playwright config, which builds, starts and runs the shared flows and the production checks; the report kept for 7 days on failure |

The repository is public, so Actions minutes are free. The dev-server run (styleguide pages only) stays local.

Verified before push, by replaying each job's commands here on fresh databases with the same placeholder environment: database job 21 of 21 passed, drift check clean (and exits 2 when the schema differs); end-to-end job 129 passed, 0 failed, 27 skipped by design, 10.5 minutes. Not verified: the run on GitHub itself, which needs the push. Joel's token has the `workflow` scope that pushing a workflow file needs.

### 9.6 Monitoring

Built (on `main`):

- `src/instrumentation.ts` (`onRequestError`): one JSON line per server error, with the path without its query string, route, request type, a 300-character message and the digest shown on the dashboard's error page.
- `GET /api/health`: 200 or 503, nothing else; logs `health_check_failed`.
- S3 delete failures logged the same way.

Verified on a production build: with the database stopped, `/api/health` answered 503 and logged one line; a portal page logged `request_error` lines with the matching digest and no query string (the `?q=` search term was absent from the log); the home page kept serving from the cache; health returned to 200 when the database came back. Next reports one failed page several times (once per layout), so counts are approximate. The full end-to-end suite has run with this code as part of the CSP branch, which is built on it.

Plan (docs/DEPLOY.md, Monitoring), all free tier: SSR app logs on in Amplify; an Amplify alarm on `5xxErrors`; a CloudWatch metric filter and alarm on `request_error`; an external uptime check of the home page every 5 minutes and `/api/health` hourly. Hourly because each health call wakes Neon for 5 minutes, and Neon's free plan allows 100 compute-unit hours a month: a 5-minute database check would keep it awake all month (about 180) and Neon would suspend the project.

### 9.7 Portal launch readiness

Done without Joel:

- Concurrency guarantees tested on real PostgreSQL; two gaps fixed (D4, D5)
- CI written and replayed locally
- Error logging, health route and monitoring plan
- The three approval branches built, tested, approved and merged

Needs Joel's access or decision, in order:

1. Done 22 Nov: the three branches approved, merged and pushed. Deploy comes with Phase 7 (the Amplify app does not exist yet).
2. Neon: `pnpm db:deploy` and `pnpm db:seed` with the direct connection (docs/DEPLOY.md, Builder portal, step 2). Additive migration, create-only seed.
3. S3 bucket policy: add `projects/*` to the live policy.
4. Google OAuth: publish the consent screen (testing mode admits listed test users only); confirm the production redirect URI `https://<domain>/api/auth/callback/google`.
5. Privacy notice: the Data Protection Act 2012 (Act 843) check and the question to UCC (TODO in `src/app/(site)/privacy/page.tsx`).
6. Code of conduct: review with the core team (TODO in `src/app/(site)/code-of-conduct/page.tsx`).
7. Monitoring: the four AWS and uptime steps in docs/DEPLOY.md.
8. GitHub: optionally require the CI checks on `main` (branch protection needs an admin of the repository).
9. After the token branch is live: optionally clear old tokens with the SQL in 9.2.

Still open, not urgent: S8 (rotating check-in code), S9 (Better Auth's in-memory rate limiter; only Google sign-in endpoints are exposed), S10 (build-time advisories inside Next and Prisma), F2 (loading feedback), U5, P1 and P2.

## Status

| ID | Severity | Category | Status |
|---|---|---|---|
| S1 | Medium | A | Fixed |
| S2 | Medium | A | Fixed |
| S3 | Low | A | Fixed |
| S4 | Low | A | Fixed |
| S5 | Low | A | Fixed |
| S6 | Low | B | Fixed, merged (9.2). Old rows on Neon: optional SQL in 9.2 |
| S7 | Low | B | Fixed, merged (9.4). Watch `csp_violation` for a week after deploy |
| S8 | Info | C | Recommendation |
| S9 | Info | B | Waiting for Joel; low risk, only Google sign-in endpoints are exposed |
| S10 | Info | | Not changed |
| D1 | High | A | Fixed |
| D2 | Medium | A | Fixed; proven on real PostgreSQL (9.1) |
| D3 | Medium | A | Resolved: race tests on real PostgreSQL, locally and in CI (9.1) |
| D4 | Low | A | Confirmed on real PostgreSQL and fixed (9.1) |
| D5 | Low | A | Confirmed on real PostgreSQL and fixed (9.1) |
| D6 | Low | A | Fixed |
| F1 | High | A | Fixed |
| F2 | Medium | C | Tried and reverted (broke 404 status and action refreshes) |
| F3 | Medium | A | Fixed |
| U1 | Medium | A | Fixed |
| U2 | Low | A | Fixed |
| U3 | Low | A | Fixed |
| U4 | Low | A | Fixed |
| U5 | Low | | Already tracked |
| M1 | | A | CI added (9.5) |
| M2 | | B | Fixed, merged (9.3) |
