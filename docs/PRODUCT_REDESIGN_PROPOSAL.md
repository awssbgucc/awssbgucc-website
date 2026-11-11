# Product redesign proposal

Status: **proposal, not approved.** Nothing here overrides CLAUDE.md, DESIGN.md, CONTENT.md, ADMIN.md or COMPLIANCE.md until Joel approves it, section by section. Where a recommendation would change one of those files, it says so and lists the change under section 13.

Evidence for the GEU comparisons is in `docs/REFERENCE_AUDIT_GEU.md`. Written Thu 5 Nov 2026.

## 1. Where we are

### What is built

| Phase | State | Notes |
|---|---|---|
| 0 Plan | Done | Decisions recorded in tasks/todo.md |
| 1 Design system | Done, committed 58ad68f | Tokens, Geist fonts, Button, Tag, Card, Container, Section, Eyebrow, PixelGrid, PixelMap, styleguide |
| 2 Public pages | Done, committed 3c38419 | Home, events, event detail, team, partners, blog, post, 404, nav, footer, metadata, sitemap |
| 3 Database | Done, committed b3468ec | Prisma 7 on Postgres, seed, published-only queries, 60s refresh |
| 4 Admin | Done, committed dc33361 | Better Auth with Google, AdminUser allowlist, requireRole, screens for every model, previews |
| 5 Uploads | Done, **not committed** | Presigned S3 PUT, type and size limits, record-scoped keys, cleanup on replace and delete |
| 6 Polish | Not started | |
| 7 Deploy | Not started | Nothing is live |

The dev server now runs against Neon, and you are signed in to the admin on it. The overview shows 0 events, 3 partners (2 published) and 0 posts.

### What works

- The engineering base is sound: server-rendered pages, strict types, shared zod rules, role checks read from the database on every request, a tight S3 policy, 61 unit tests and 34 dev Playwright tests at the last count.
- The pixel map is a real signature. Nobody else has it, and it says where we are without a word.
- The writing rules and compliance rules are stricter than GEU's, which keeps us out of trouble GEU may not avoid.

### What is weak (seen in the browser on 5 Nov at 1366px and 375px)

1. **The site is empty.** Events: one line and a button. Team: a headline, then the footer, with no empty state. Blog: a headline and intro. The stats row on home shows a single figure ("2 Partner associations"). "Real or nothing" is the right rule, but at launch it delivers nothing. We need real content, and well-designed empty states for the gaps.
2. **No photographs anywhere.** `document.images` is 0 on home. GEU's strongest asset is pictures of full rooms. We have run sessions since August, so photos should exist.
3. **The marker is below the fold.** At 1366 by 633 the Cape Coast cell sits under the fold. At 375px the map starts after the buttons and the marker is about a full screen further down. The one thing the hero exists to show is not visible when the page opens.
4. **Monospace everywhere.** Geist Mono is used for the hero, every section headline and the nav lockup. At 44px on desktop a two-line mono headline is wide and slow to read. It feels like a terminal, and less like a group of people.
5. **Card grids carry the home page.** Programmes, benefits and partners are all equal cards in grids. Nothing leads, and nothing shows an actual session.
6. **Home does not answer "when is the next thing?"** The next event sits fourth, after About and Programmes.
7. **Event pages end at the event.** The model has `photos`, `attendance` and `recapPostId`, but nothing shows a past event as a story with photos and outcomes.
8. **There is no reason to come back** after joining Meetup. Everything useful to a member lives on Meetup and WhatsApp.

### What is fixed and what is open

| Fixed unless you say otherwise | Open for reconsideration |
|---|---|
| The stack in CLAUDE.md | The visual direction in DESIGN.md (you asked for this) |
| Meetup for membership and RSVP | Adding a member portal |
| COMPLIANCE.md in full | Typography roles, the home page structure |
| Writing rules | The "three grids, one place each" rule |
| Dark first, tokens only, no UI kit | Out-of-scope list in ADMIN.md ("member accounts") |

## 2. Revised product vision

> One place that shows what AWS SBG UCC runs, what its members have built, and what each member has done. The public site proves the group is real. The builder portal gives every member a record of sessions attended, labs done and projects shipped, checked by the team. Meetup stays the front door for joining and RSVPs.

Three surfaces in one Next.js app:

1. **Public site.** Editorial, photo-led, honest. Upcoming sessions, past sessions as stories, projects, team, partners, writing.
2. **Builder portal** (`/builder`). For signed-in members. The next session, materials, check-in, your record, later your submissions.
3. **Admin** (`/admin`). For the core team. Content, plus attendance, members and reviews.

The test for every portal feature: **does it record or support something that happened in a real session or a real project?** If it only rewards opening the app, it is out.

## 3. Target users and their goals

| User | Arrives from | Wants | Surface |
|---|---|---|---|
| A prospective student, any department | A WhatsApp link, on a phone, on mobile data | Is this real? When is the next session? Do I need experience? | Public |
| A new member after the first session | The session itself, or a QR code at the venue | Check in, get the slides and lab, know what is next | Portal |
| A returning member | Habit, a WhatsApp reminder | Next session, the current lab, my record, a CV-worthy project page | Portal |
| A core team editor | The dashboard | Publish events, take attendance, post recaps, review projects, quickly | Admin |
| The group leader (ADMIN) | The dashboard | All of the above, plus settings, people and data requests | Admin |
| Faculty, a department, CITSA | A link from the leader | Proof of activity: past sessions, attendance, photos | Public |
| A sponsor or speaker | An email | Who the members are, what they build, how to work with us | Public |
| The AWS program contact | The program's records | That the group runs real events within program rules | Public |
| The next group leader | A handover | A site they can run without the person who built it | Admin and docs |

## 4. Public site recommendations

### 4.1 Home: from cards to an editorial page

Proposed order. Each section exists only when it has real content.

1. **Hero.** Headline and copy left, map right, unchanged in spirit. Fix the size so the Cape Coast marker and label are visible without scrolling at 1280 by 720 and at 375 by 667 (section 7.3).
2. **Next session strip.** Straight after the hero. Date block in mono (`SAT 14 NOV`), title, time, venue, `RSVP on Meetup`. If nothing is scheduled, the existing "No event scheduled" line.
3. **What we run.** Programme rows, not cards: tag, name, one line, and the next or latest session of that programme. One photo per row once we have one.
4. **From the last session.** The most recent past event: title, date, recorded attendance, three to five photos, a link to the full story.
5. **Built by members.** Up to three projects, when they exist. Hidden until then.
6. **The team.** Photo strip.
7. **Partners.** Logos.
8. **Join.** Meetup, WhatsApp, and later "Sign in to the builder portal".

The About copy and the four benefits become one section between 1 and 2, or move to a short `/about`. Either way, the 2 by 2 benefits card grid goes. This changes the CONTENT.md home order, so it needs your approval.

### 4.2 Events

- **Event detail becomes before and after.** Before: what it is, when, where, RSVP. After: a recap block (`attendance`, photos from `Event.photos`, the linked recap post, materials). The fields already exist. Only the gallery design was missing, which is why D5 deferred it.
- **List rows, not cards**, at least on desktop: a date column in mono, then title, tag, venue. Past rows show attendance and a "Photos" or "Recap" marker.
- **Filters** only once there are more than about eight events.

### 4.3 Projects (`/projects`, new)

An admin-curated showcase first, then member-submitted through the portal (section 5). Each project: title, one-line summary, the people (consenting members only), the AWS services used, a screenshot or architecture diagram, and links to the repo and a live URL. **No project ships to the page without an image.** That fixes GEU's wall of identical text cards.

### 4.4 Team, partners, blog

- **Team:** keep the design. Add an empty state ("The team list is being updated.") so the page is never just a headline. Fill in the photos.
- **Partners:** add the one-line `description` on each tile. It is in the model but not shown.
- **Blog:** an empty state line, which I proposed in W9 and still need from you.

### 4.5 Pages to add later

- `/privacy`: needed the day the portal collects any member data.
- `/code-of-conduct`: needed the day members can submit anything public.
- `/scd`: unchanged plan, behind its switch.

### 4.6 Pages not to add

- A separate `/gallery`. Photos live on their event.
- A separate `/challenges` page until we run a challenge.
- A brand page in v1. A short `docs/BRAND.md` for volunteers does the job.
- A facts or entity page. Good metadata and a clean About do the same work.

## 5. Builder portal recommendation

### 5.1 Should we add it?

**Yes, in stages, after the public site and admin are live.** Reasons:

- It gives students a reason to return that comes from real activity: materials after a session, a record of what they did, a project page they can put on a CV.
- It replaces a manual job. Attendance today is "entered by hand from the attendance sheet". Check-in makes it a by-product of the session.
- It gives sponsors and faculty verifiable numbers, so there is nothing to round up.

Reasons for caution, which shape the staging:

- Every member account is personal data we must protect, explain and delete on request.
- Volunteers must run it every week: open check-in, review submissions, answer "I could not check in".
- Leaders graduate. Anything we build must survive a handover.

### 5.2 Capability assessment

Value = how directly it serves real community activity. Burden = ongoing volunteer time once built.

| Capability | Value | Build complexity | Ongoing burden | Recommendation |
|---|---|---|---|---|
| Google sign-in for members | High, needed for everything else | Medium (auth change, section 9) | Low | MVP |
| Onboarding | Medium | Low | None | MVP, two short steps |
| Student profile (private) | Medium | Low | Low | MVP |
| AWS learning interests | Medium: helps plan sessions | Low | None | MVP, a fixed list |
| Personal dashboard | High, if led by the next session | Low to medium | None | MVP |
| Upcoming events in portal | High | Low, reads existing events | None | MVP |
| Session check-in | High: verified attendance | Medium | Low: open a code per session | MVP |
| Event participation record | High | Low, follows from check-in | None | MVP |
| Workshop materials | High after a session | Low: links per event | Low: paste links | MVP |
| Announcements | Low: WhatsApp already does this | Low | Medium: another channel to keep current | No, keep the site announcement bar |
| Hands-on labs (step-by-step, tracked) | High, but costly to author | High | High: lab content goes stale with AWS consoles | Later. Link to labs from materials instead |
| Challenge submissions | High once challenges run | Medium | Medium: reviews | Stage 2 |
| Project showcase from members | High | Medium | Medium: moderation | Stage 2 |
| Achievement records | Medium, if rule-based on verified records | Medium | Low once rules exist | Stage 3 |
| Progress tracking | Medium | Low, comes from records | None | Stage 3, as the record itself |
| Public member profiles | Medium for CVs | Low | Medium: consent and moderation | Stage 3, opt-in |
| Member directory | Low and privacy-sensitive | Low | Medium | No, unless members ask for it |
| XP, levels, streaks, calendars of app opens | Low, rewards frequency | Medium | Medium | No |
| Wallet, points store, perks | Low and risky | High | High: stock, fraud, fairness disputes | No |
| Referral codes | Low | Medium | Medium | No |
| Notifications by email | Medium | Medium (Amazon SES, consent, bounces) | Medium | Later, if WhatsApp proves not enough |

### 5.3 The MVP, concretely

**Onboarding (two steps).**

1. About you: display name (pre-filled from Google), programme, level, department. Nothing else is required.
2. What you want to learn: pick up to five interests from a fixed list (for example cloud foundations, serverless, data, AI and ML on AWS, DevOps, security, Cloud Practitioner prep). Optional GitHub and LinkedIn links. A plain choice: "Show my name on projects and event pages I take part in", off by default.

**Dashboard (`/builder`).** In this order:

1. **Next session:** date, time, venue, `RSVP on Meetup`. On the day, a `Check in` button appears.
2. **From your last session:** slides, repo and lab links.
3. **Your record:** sessions attended, as a pixel participation grid (section 7.4) and a list.
4. Later: open challenges and your submissions.

**Check-in, the verification mechanism.**

- An editor opens check-in for an event from the admin. The server makes a short code (for example six characters) and shows it large on the admin screen for the projector, with a QR code that links to `/builder/check-in?event=<slug>`. The code itself is never put in the URL.
- A member enters the code. The server checks: signed in, onboarded, event published, check-in window open, code matches, one check-in per member per event. It also rate-limits attempts per member.
- The window defaults to the event's start time minus 30 minutes until its end time plus 30 minutes. An editor can close it early.
- Editors can add or remove a check-in by hand, for anyone without a phone or data. Each change records who made it.
- A code can be shared on WhatsApp by someone in the room. The window and the editor's ability to remove entries limit the damage, and no reward is large enough to be worth cheating for. That is a deliberate design choice: **records, not prizes.**

**Materials.** Per event, a list of links with a label and kind (slides, repo, lab guide, recording). Public by default, so non-members benefit too. Members-only as an option per link.

### 5.4 Later stages

- **Stage 2: submissions and projects.** A member submits a project or a challenge entry: title, summary, repo URL, live URL, architecture image, team members (who must accept). A technical lead reviews it: approve, ask for changes, or decline, with a note. Approved projects whose members all consent appear on `/projects`.
- **Stage 3: achievements.** Awarded by the server from records only, never by hand or by activity. Examples: "First build session", "Five sessions", "Shipped a project", "Reviewed a peer's project". Each badge shows its rule and the records that earned it. These are our group's records, not AWS credentials. They never use AWS marks or imply AWS issued them.
- **Not planned:** XP, levels, streaks, leaderboards outside a specific timed challenge, points, a store or a wallet.

### 5.5 Meetup stays

RSVPs stay on Meetup (COMPLIANCE rule 17). The portal never takes RSVPs. Check-in records who was in the room, which Meetup does not record reliably. Event pages keep `RSVP on Meetup` and the AWS Event Terms line.

## 6. Admin implications

| Screen | Change |
|---|---|
| `/admin` | Add: check-ins today, submissions waiting for review (stage 2), members who joined this week |
| `/admin/events/[id]` | Add a Materials list and an Attendance tab: open and close check-in, show the code, list checked-in members, add or remove by hand |
| `/admin/members` (new) | List and search members, see a member's record, suspend, and handle a deletion request. EDITOR can view; only ADMIN can suspend or delete |
| `/admin/projects` (new) | Curate projects now. In stage 2 it becomes the review queue for submissions |
| `/admin/users` | Unchanged. Admin access stays a separate allowlist |
| `/admin/audit` (new) | Read-only log of sensitive actions (section 9.4) |

`Event.attendance` today is a hand-entered number. Proposal: keep it for events before check-in existed, and show the check-in count for events that used check-in. Decision Q8.

## 7. Revised visual direction

### 7.1 What stays

- Dark first, one token set in `@theme`, no UI kit, hand-built components.
- Restraint with accents: colour carries meaning.
- The pixel map as the hero signature, in the hero only.
- Real photos or nothing.
- The 4px and 8px radii, hairline borders, small motion.
- The SBG chip on 404 and admin sign-in, subject to W7.

### 7.2 What evolves

**Typography roles.** Keep two families (Geist and Geist Mono, or Ember if cleared), but change who does what:

| Role | Now | Proposed |
|---|---|---|
| Hero headline | Mono | Mono, unchanged: it is the signature line |
| Section headlines | Mono 28 / 44px | **Sans**, semibold, tight tracking (-0.02em), 28 / 40px |
| Dates, times, venues, counts, codes, labels | Mixed | **Mono**, always. Mono means "a recorded fact" |
| Eyebrows | Sans uppercase | Mono, uppercase, small, muted |
| Body | Sans | Sans, unchanged, max 68ch |

This keeps the built, technical feel where it belongs, on data, and makes headings faster to read. It changes the DESIGN.md typography table.

**Layout.** A 12-column grid on desktop with asymmetric splits (for example 5 and 7) instead of equal card grids. More vertical space between sections, less inside them. Lists and rows for things with dates. Cards only for things that are objects (a project, a person).

**Photography.** Real event photos, full-bleed or in a strict 3:2 grid, with a mono caption under each (`LT5 · SAT 17 OCT 2026`). Photos are never tinted with accent colours. Strip location data and blur faces of anyone who has not agreed (section 9.5).

**Hover and focus.** Rows get a background step to `--color-card` and an arrow shifts 2px. Cards change border only, as now. Focus keeps the cyan ring everywhere.

**Empty states.** Every list has one, written once: a mono label, one plain line, and the next useful action. Example for team: `TEAM · Being updated` and "Meet us at the next session." with the Meetup button.

### 7.3 The pixel map, made more visible

- Hero sizing: on desktop, cap the map's height so the marker sits above the fold at 1280 by 720. On phones, show the map at about 60% of the width, or use a southern crop that keeps the coast and marker in the first screen. Mock both before choosing.
- The first view should end on the marker: rows fade in, then the lit cell flashes, as now. The label stays in mono.
- The map is the one large pixel element on the public site. Nothing else on the public site becomes pixel art.

### 7.4 One new grid: the participation grid

A small pixel grid on each member's portal dashboard: one cell per session the group has run, in date order, lit in lime when that member checked in. It echoes the lit Cape Coast cell ("you were there"), it is built from verified records, and it rewards showing up to a session, not opening an app.

- It is the same `<PixelGrid />` renderer, so it costs little to build.
- It appears only in the portal, and only on a member's own dashboard and opt-in public profile.
- It breaks the CLAUDE.md rule "three grids, each in one place only". If you like the idea, the rule becomes "each grid in one named place". If not, the record shows as a plain list.

### 7.5 One system, three densities

| Surface | Density | Shell |
|---|---|---|
| Public | Spacious, editorial, 96px section rhythm | Top nav, footer |
| Portal | Medium, 48px rhythm, cards and lists | Top bar with the same lockup; on phones a bottom bar with 4 items (Home, Sessions, Record, Profile) |
| Admin | Dense, tables and forms | Left sidebar, as now |

Same tokens, same type, same buttons and fields. No light theme in v1. Because every component reads tokens, a light theme stays possible later without a rewrite.

### 7.6 Forms (portal and admin)

Visible labels tied to inputs with `for` and `id`. Help text tied with `aria-describedby`. Errors shown inline and announced. Buttons with text. One column, 640px maximum. On desktop onboarding, the step list sits on the left with one line of why for each step, and the fields sit on the right.

### 7.7 Motion

Unchanged rules: 150ms hovers, 250ms reveals, the house easing, everything off under reduced motion. Additions: a 150ms fade between portal views, and a single lime flash on the participation grid when a check-in succeeds. No loaders longer than the request, no splash screen, no rotating words, no floating icons.

### 7.8 Not doing

Purple gradients beyond the one hero line, blurred blobs, glassmorphism, emoji, centred hero with a pill, icon card grids, testimonials, invented stats, AWS icons or orange, GEU's palette, layouts or wording.

## 8. Proposed information architecture

One Next.js app, three route groups. Separate apps would double deploys, auth and design maintenance for a team of six to ten. Nothing here needs that.

### Public (indexed unless noted)

| Route | Notes |
|---|---|
| `/` | Editorial home |
| `/events`, `/events/[slug]` | Before and after, with recap, photos and materials |
| `/projects`, `/projects/[slug]` | New. Curated, then member-submitted |
| `/team` | |
| `/partners` | |
| `/blog`, `/blog/[slug]` | |
| `/scd` | Behind its switch |
| `/privacy`, `/code-of-conduct` | New, with the portal |
| `/builders/[handle]` | Stage 3, opt-in public profile. **`noindex` by default**; the member can allow indexing |

The candidate `/about` stays a home section unless the home page gets too long.

### Member, `/builder` (signed in, `noindex`, outside the sitemap)

| Route | Contents |
|---|---|
| `/sign-in` | One sign-in page for everyone; it sends admins and members to the right place |
| `/builder/welcome` | Two-step onboarding. Shown until it is finished |
| `/builder` | Dashboard |
| `/builder/sessions` | Upcoming sessions, past sessions you attended, materials |
| `/builder/check-in` | Enter a code |
| `/builder/profile` | Edit details, interests, links, visibility, download my data, delete my account |
| `/builder/projects` | Stage 2: your submissions |
| `/builder/record` | Stage 3: achievements with their rules, or merged into the dashboard |

Compared with the candidate list: `/builder/onboarding` becomes `/builder/welcome` (shorter, friendlier). `/builder/events` becomes `/builder/sessions`, because a member thinks in sessions. `/builder/learning` folds into sessions, because materials belong to the session that taught them. `/builder/challenges` waits until we run one. `/builder/achievements` becomes the record.

### Admin, `/admin` (signed in, AdminUser only, `noindex`)

Keep the existing routes. Add `/admin/members`, `/admin/projects` and `/admin/audit`, and an Attendance tab on events. I would not merge team, partners and posts into one `/admin/content`: the current screens work and are tested.

### Permission boundaries

| Area | Anonymous | Member | EDITOR | ADMIN |
|---|---|---|---|---|
| Public pages | Read | Read | Read | Read |
| Own profile and record | | Read, edit, export, delete | | |
| Check in | | Own, within the window | Add or remove for anyone | Same |
| Submit a project | | Own | | |
| Review projects | | | Yes | Yes |
| Member list | | | Read | Read, suspend, delete |
| Content screens | | | Yes | Yes |
| Settings, admin users, audit log | | | | Yes |

A member is never an admin by virtue of a member field. Admin rights come only from the `AdminUser` table, as now.

## 9. Architecture, auth and data model implications

### 9.1 Auth today

`src/lib/auth.ts` rejects any Google account that is not in `AdminUser`, both when the `user` row is created and when a session is created. So today "has a session" means "is an admin", and `requireRole()` adds the role check.

### 9.2 Auth after the change (proposal, not to build yet)

1. **Let any Google account with a verified email sign up.** Remove the AdminUser check from the `user.create` and `session.create` hooks. Decide whether to restrict sign-up to a UCC student email domain (Q2).
2. **Admin access stays a separate allowlist.** `requireRole('ADMIN' | 'EDITOR')` already looks up `AdminUser` by verified email on every call. It becomes the only gate for `/admin`, so every admin page and action must keep calling it. Today's sign-in hook is a second lock, and removing it means relying on that one line. Mitigation: a test that signs in as a plain member and calls **every** admin server action and page, expecting a refusal. Make it a required check.
3. **Add `requireMember()`** for portal pages and actions: a session, a verified email, a member profile that is not suspended, and onboarding finished (except on `/builder/welcome`).
4. **No role fields on the Better Auth `user` table** that the client could write. If we add user fields, mark them `input: false`.
5. **Suspension takes effect at once:** `requireMember()` reads the profile on each request, as `requireRole()` does today.
6. **Sign-in page:** one `/sign-in`. `/admin/sign-in` redirects to it. After sign-in, admins go to `/admin` and members to `/builder`.
7. **Rate limits** on sign-in, check-in and submission, using Better Auth's limiter where it applies, and a database counter for check-in.

### 9.3 Data model sketch (for discussion, not a migration)

All additive. No existing table changes shape, except new optional fields on `Event`.

```prisma
enum MemberStatus { ACTIVE SUSPENDED }
enum CheckInMethod { CODE EDITOR }
enum ResourceKind { SLIDES REPO LAB RECORDING OTHER }
enum Visibility { PUBLIC MEMBERS }

model MemberProfile {
  userId         String       @id            // Better Auth user.id
  handle         String       @unique
  displayName    String
  programme      String?
  level          String?
  department     String?
  interests      String[]                    // from a fixed list in code
  githubUrl      String?
  linkedinUrl    String?
  showPublicly   Boolean      @default(false) // consent to appear on public pages
  allowIndexing  Boolean      @default(false)
  status         MemberStatus @default(ACTIVE)
  onboardedAt    DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model CheckIn {
  id         String        @id @default(cuid())
  eventId    String
  userId     String
  method     CheckInMethod
  recordedBy String?       // editor email when method is EDITOR
  createdAt  DateTime      @default(now())
  @@unique([eventId, userId])
}

model EventResource {
  id         String       @id @default(cuid())
  eventId    String
  label      String
  url        String
  kind       ResourceKind
  visibility Visibility   @default(PUBLIC)
  order      Int          @default(0)
}

model AuditLog {
  id         String   @id @default(cuid())
  actorEmail String
  action     String   // e.g. checkin.remove, member.suspend, member.delete
  entityType String
  entityId   String
  createdAt  DateTime @default(now())
}

// On Event, all optional:
//   checkInCodeHash  String?
//   checkInOpensAt   DateTime?
//   checkInClosesAt  DateTime?
```

Stage 2 adds `Project`, `ProjectMember` (with an `accepted` flag) and a review status on `Project`. Stage 3 adds `Achievement` and `MemberAchievement` (with the record ids that earned it).

### 9.4 Audit trail

ADMIN.md says a full audit log is not needed in v1. With member data it is: suspensions, deletions, manual check-in changes, project reviews and admin user changes should each write one `AuditLog` row. Content edits can keep `updatedBy`.

### 9.5 Privacy and consent

- **Data minimisation.** No phone numbers, student ID numbers, dates of birth, home addresses or uploaded profile photos in the MVP. Initials instead of photos. The Google profile image is not stored.
- **Consent.** Nothing about a member appears publicly unless `showPublicly` is on. A project shows a member's name only if that member accepted being listed.
- **Rights.** Self-service export (JSON) and account deletion from `/builder/profile`. Deletion removes the profile and check-ins, and replaces the name on projects with "Former member".
- **Law.** Ghana's Data Protection Act, 2012 (Act 843) applies to personal data we hold. Check with UCC's legal or data protection office whether the group must register with the Data Protection Commission, or whether UCC covers it, before the portal opens. I am not giving legal advice here, only flagging the question.
- **Photos.** Strip EXIF and GPS data before publishing. Get consent for close-up photos, and remove a photo when someone asks.
- **Students under 18.** Some first-year students may be 17. If sign-up is open, add an age confirmation or ask UCC how other student groups handle it (Q11).

### 9.6 Rendering and caching

Public pages stay static with the 60-second refresh. Portal and admin pages are dynamic and per user, rendered on request on Amplify's compute. Nothing user-specific is ever cached in a shared cache. A member's dashboard must never be served to another member.

## 10. Cost and operational concerns

### Cost risks (estimates; confirm against real metrics after deploy)

| Item | Public and admin only | With portal | Risk |
|---|---|---|---|
| Amplify SSR compute | Low: most pages static, rebuilt every 60s at most | Higher: every portal view is a request | Spikes during check-in at a busy session are short |
| Neon | Low: free tier, scales to zero | More compute time as members sign in through the week | The free tier limits may be reached. Check the current Neon limits before launch |
| S3 | Cents a month | The same: no member uploads in the MVP | Member uploads in stage 2 (project images) add storage and moderation |
| Email | None | None in the MVP | Amazon SES later adds cost and bounce handling |
| Domain | One purchase | The same | |

I have not put figures on these because I have not checked current pricing for this account. Phase 7 should record the real monthly cost once traffic exists.

### Operational load per week, with the MVP

- Open check-in at each session: 1 minute.
- Paste materials links after each session: 5 minutes.
- Fix check-in problems: a few minutes per session.
- Stage 2 reviews: about 10 minutes per submission. This is the step most likely to stall, so it needs a named owner (the Technical Lead).

### Maintenance risks

- **Handover.** Write a one-page runbook per surface before the portal opens.
- **Upgrades.** Next.js 15 pinned for Amplify (W1), Better Auth and Prisma 7 updates. Member auth makes security updates urgent, not optional.
- **Security surface.** Opening sign-up to any Google account multiplies who can reach server actions. The per-action role checks and their tests are what keep this safe.

## 11. Revised roadmap

### Original

0 Plan, 1 Design system, 2 Public pages, 3 Database, 4 Admin, 5 Uploads, 6 Polish, 7 Deploy. Later: SCD, landmark pixel art.

### Revised

| Tier | Phase | Contents | Complexity | Blocks |
|---|---|---|---|---|
| **1. Essential public site** | 5 close | Commit Phase 5 as is | Small | Your OK to commit |
| | 6A Design revision | Approve the direction (section 7), then update DESIGN.md and CONTENT.md, then rebuild home, event detail (recap and photos) and empty states. Hero map sizing | Medium | Photos from past sessions; your approval |
| | 6B Polish | The original Phase 6: accessibility, performance, copy scan, DEPLOY.md | Small | |
| | 7 Deploy | The original Phase 7. **Launch the public site and admin before any portal work** | Medium | Domain, Google OAuth credentials |
| **2. Core admin** | 7+ | Event gallery upload (the deferred D5), partner descriptions, `/admin/projects` (curated), `/projects` public page | Small to medium | Project content |
| **3. Portal MVP** | 8 Member auth | Open sign-up, `requireMember()`, member-versus-admin tests, `/sign-in`, onboarding, profile, export and delete, `/privacy`, AuditLog | Medium, high care | Q1, Q2, Q11, the data protection check |
| | 9 Sessions | Portal dashboard, sessions, materials, check-in and the Attendance tab, `/admin/members` | Medium | Q3 |
| **4. Community features** | 10 Projects | Member submissions, team acceptance, review queue, `/code-of-conduct` | Medium | A named reviewer |
| **5. Optional** | 11 Record | Rule-based achievements, opt-in public profiles, the participation grid on profiles | Medium | Q4, Q6 |
| | Later | Timed challenges with a challenge-only leaderboard, email notifications, SCD | Varies | Real demand |

**The next real date:** From Code to Cloud is on Sat 14 Nov 2026, nine days from today, and nothing is deployed. If you want the site live for it, the fastest route is to skip 6A, do 6B and 7 now, and do 6A straight after. That is your call (Q5).

### Do any foundations need to change now?

No rewrite is needed. Three things to keep in mind so we do not build ourselves into a corner:

1. **Do not add more code that assumes "a signed-in user is an admin".** Admin code should always go through `requireRole()` or `currentAdmin()`, which it already does.
2. **Event check-in and resources are additive fields and tables.** No change to the Event model is needed now.
3. **`Event.photos` already exists**, so the gallery work in tier 2 needs no schema change.

## 12. Feature matrix

| # | Feature | Surface | Tier | Value | Complexity | Burden |
|---|---|---|---|---|---|---|
| 1 | Editorial home with next session first | Public | 1 | High | Medium | Low |
| 2 | Hero map sizing so the marker is visible | Public | 1 | High | Small | None |
| 3 | Empty states on every list | Public | 1 | High | Small | None |
| 4 | Event recap with photos and attendance | Public | 1 or 2 | High | Medium | Low |
| 5 | Typography role change | All | 1 | Medium | Small | None |
| 6 | Event gallery upload | Admin | 2 | High | Small | Low |
| 7 | Curated projects page | Public and admin | 2 | Medium | Medium | Low |
| 8 | Partner descriptions on tiles | Public | 2 | Low | Small | None |
| 9 | Member Google sign-in and onboarding | Portal | 3 | High | Medium | Low |
| 10 | Dashboard, next session first | Portal | 3 | High | Medium | None |
| 11 | Session check-in with a code | Portal and admin | 3 | High | Medium | Low |
| 12 | Materials per event | All | 3 | High | Small | Low |
| 13 | Member management and audit log | Admin | 3 | Needed | Medium | Low |
| 14 | Privacy page, export, delete | Public and portal | 3 | Needed | Small | Low |
| 15 | Project submissions and review | Portal and admin | 4 | High | Medium | Medium |
| 16 | Code of conduct | Public | 4 | Needed | Small | Low |
| 17 | Rule-based achievements | Portal | 5 | Medium | Medium | Low |
| 18 | Opt-in public profiles | Public | 5 | Medium | Small | Medium |
| 19 | Participation grid | Portal | 3 or 5 | Medium | Small | None |
| 20 | Timed challenges | Portal and admin | 5 | Medium | High | Medium |
| | XP, streaks, wallet, store, referrals, member directory | | Not planned | | | |

## 13. Changes this would make to the authoritative docs

None of these are made yet. Each needs your approval.

| File | Change |
|---|---|
| CLAUDE.md | "Two surfaces" becomes three; the stack table notes member auth; "three grids, each in one place only" becomes "each grid in one named place" (only if the participation grid is approved) |
| DESIGN.md | Typography roles (7.2), home layout principles, photography rules, empty state pattern, portal shell, hero map sizing, participation grid |
| CONTENT.md | Home order (4.1), empty state copy, event recap block, projects page copy, portal copy |
| ADMIN.md | "Member accounts" leaves the out-of-scope list; new screens; audit log needed; data model additions |
| COMPLIANCE.md | Nothing changes. Add a short note that member achievements are group records, never AWS credentials, if you agree |
| BUILD_PROMPT.md | Phases 6A to 11 as in section 11 |

## 14. Questions for your decision

1. **Q1. Portal.** Add the builder portal as a third surface, staged as in section 11?
2. **Q2. Who can sign up.** Any Google account with a verified email, or only a UCC student email domain? If UCC, which domain do student accounts use, and are they Google accounts?
3. **Q3. Check-in method.** A code at the venue plus editor corrections (my recommendation), editors marking from the Meetup list only, or both?
4. **Q4. Public profiles.** Allowed at all, and only opt-in (my recommendation)?
5. **Q5. Sequence.** Deploy the current public site and admin first, possibly before Sat 14 Nov, then do the design revision? Or the design revision first?
6. **Q6. Design.** Approve the typography role change, the editorial home and the participation grid (which changes the CLAUDE.md grid rule)?
7. **Q7. Projects now.** Build the curated `/projects` page in tier 2, before members can submit?
8. **Q8. Attendance numbers.** For events that used check-in, show the check-in count instead of the hand-entered number?
9. **Q9. Theme.** Confirm one dark theme across all three surfaces in v1?
10. **Q10. Ownership.** Who owns member data requests, and who reviews submissions? Both need a named person and a stand-in.
11. **Q11. Under-18 members and data protection.** May I add a task to ask UCC about Act 843 registration and about members under 18 before Phase 8?
12. **Q12. Research screenshots.** The GEU screenshots in `docs/research/geu/` show GEU's artwork. Keep them out of git (add `docs/research/` to `.gitignore`), or delete them after review?
13. **Q13. Photos.** Do you have photos from the August to October sessions, with the consent of the people in them? Tier 1 depends on them.
14. **Q14. Your portal screenshots.** They did not reach me. Share them as files in the repo if you want the portal audit to cover the signed-in features.
