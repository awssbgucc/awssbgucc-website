# Platform architecture

Added 5 Nov 2026, when the scope grew from a public site and a small dashboard to three connected surfaces. Read with CLAUDE.md, docs/ADMIN.md and docs/COMPLIANCE.md.

## Three surfaces, one app

| Surface | Routes | Who | Rendering |
|---|---|---|---|
| Public site | `/`, `/events`, `/events/[slug]`, `/projects`, `/projects/[slug]`, `/team`, `/partners`, `/blog`, `/blog/[slug]`, `/contact`, `/privacy`, `/code-of-conduct`, `/scd`, `/builders/[handle]` | Anyone | Static, refreshed every 60 seconds. `/builders/[handle]` renders per request so a privacy change applies at once |
| Builder portal | `/sign-in`, `/builder/welcome`, `/builder`, `/builder/sessions`, `/builder/check-in`, `/builder/challenges`, `/builder/projects`, `/builder/progress`, `/builder/rewards`, `/builder/community`, `/builder/notifications`, `/builder/profile`, `/api/me/export` | Signed-in members | Dynamic, `noindex`, never cached across users |
| Dashboard | `/admin/...` | `AdminUser` emails only | Dynamic, `noindex` |

One Next.js app, one database, one set of tokens. Separate apps would double the deploys, auth and design work for a team of six to ten.

## Who can do what

| Area | Anonymous | Member | EDITOR | ADMIN |
|---|---|---|---|---|
| Public pages | Read | Read | Read | Read |
| Own profile, record, data export, account deletion | | Yes | | |
| Check in | | Own, inside the window, with the code | Add or remove anyone | Same |
| Submit challenge work and projects | | Own | | |
| Events, materials, photos, posts, team, partners, announcements, Community Day | | | Yes | Yes |
| Challenges, submission reviews, project reviews | | | Yes | Yes |
| Members (read), reports | | | Yes | Yes |
| Suspend or delete members, adjust XP and credits | | | | Yes |
| Rewards, redemptions, achievements, award rules, audit log, privacy requests, settings, admin users | | | | Yes |

Hiding a link is never the control. Every admin page and server action calls `requireRole()`, and every portal page and action calls `requireMember()` or `requireUser()`. `src/lib/admin/guards.test.ts` reads the source and fails the build if any action skips its guard.

## Authentication

- Better Auth with Google, as before. Any Google account with a verified email can now create a member account. `SiteSettings.memberEmailDomains` can limit that to listed domains. Admin emails can always sign in.
- Admin rights come only from the `AdminUser` table, looked up by verified email on every request. A member profile has no field that grants admin rights, and `src/lib/member.ts` cannot write `AdminUser`.
- Suspending a member deletes their sessions, and `requireMember()` refuses a suspended profile, so it applies at once.
- Sign-in errors go to `/sign-in?error=CODE`, with messages in `src/lib/auth-rules.ts`.

## Records, XP and credits

Everything a member earns comes from a verified record:

| Record | Verified by | Award |
|---|---|---|
| Check-in | The code shown in the room, inside the window, or an editor | `CHECK_IN` rule |
| Approved challenge submission | A reviewer | The challenge's values, or the `SUBMISSION_APPROVED` rule |
| Approved project | A reviewer | `PROJECT_APPROVED` rule |
| Referral | The person referred attends a first session | `REFERRAL` rule, at most 10 a month |
| Achievement | The server, from the counts above | The achievement's values |

How it is kept honest:

- Every change to XP or credits is a `LedgerEntry`. Balances are sums, never stored totals.
- Unique keys stop double awards: `LedgerEntry (userId, reason, sourceId)`, `CheckIn (eventId, userId)`, `MemberAchievement (userId, achievementId)`, `Submission (challengeId, userId)`.
- All award logic lives in `src/lib/platform/engine.ts`, inside transactions. Redemptions lock the member's profile row (`SELECT ... FOR UPDATE`) before reading the balance, and decrement stock with a conditional update.
- Streaks count sessions in a row, never days. Opening the portal earns nothing.
- Removing a check-in removes its award. Deleting an event removes the check-in awards it gave. Approval of a submission is final; mistakes are corrected with an audited adjustment.
- Rate limits are stored in the database (`RateLimit`), because Amplify runs several server instances: check-in 10 tries in 10 minutes, submissions 10 an hour, redemptions 20 an hour, onboarding, privacy requests and exports.
- Sensitive actions write an `AuditLog` row: check-in changes, reviews, adjustments, rule and reward changes, redemption hand-overs and refunds, suspensions and deletions.

Tests: `src/lib/platform/rules.test.ts` (pure rules) and `src/lib/platform/engine.int.test.ts` (database: concurrent check-ins, double spends, refunds, stock, achievements, reviews), run with `pnpm test:int` against a local database only.

## Rewards

- Digital rewards (banners, accents, frames, titles) are real items in the portal, built from the design tokens. They are seeded as available.
- Physical rewards are added by an admin, off by default, and need a person to hand them over. Never offer vouchers, prizes or sponsored benefits the group does not have (COMPLIANCE rule 12 and the writing rules).
- Achievements and titles are group records. They never use AWS certification names and never claim to be AWS credentials.

## Privacy

- Profiles are private by default. Members choose members-only or public, leaderboard names, and search indexing separately.
- No phone numbers, student ID numbers, dates of birth, addresses or uploaded member photos. Avatars are initials.
- Members download their data (`/api/me/export`) and delete their account themselves. Deletion cascades through every member table; a `PrivacyRequest` row and an audit row record that it happened.
- The public projects page names an owner only when their profile is public.
- TODO(joel): Data Protection Act check before the portal opens, see `src/app/(site)/privacy/page.tsx`.

## Data model added

`MemberProfile`, `CheckIn`, `EventResource`, `Challenge`, `Submission`, `SubmissionEvent`, `Project`, `LedgerEntry`, `AwardRule`, `Achievement`, `MemberAchievement`, `Reward`, `Redemption`, `Notification`, `Announcement`, `AuditLog`, `PrivacyRequest`, `RateLimit`, `ScdSession`, `ScdSpeaker`, `ScdFaq`. New nullable fields on `Event` (check-in code and window) and `SiteSettings` (member domains, Community Day details). Migration `20261105090000_add_member_platform`, additive only.

## Development data

`prisma/dev-fixtures.ts` (`pnpm db:fixtures`) adds clearly labelled test members, events, a challenge and an announcement. It refuses to run unless `DATABASE_URL` is on localhost. The Playwright end-to-end tests make their own `e2e-` records and remove them. See docs/DEPLOY.md for running a local database.

## Cost notes

Portal and dashboard pages are rendered per request on Amplify compute, and every member visit reads the database. At the group's size this should stay small, but it is more than the static site alone. Record the real monthly cost after deploy. Uploads stay on the existing bucket; members can upload only project images.
