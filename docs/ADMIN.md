# Admin dashboard

The dashboard lets the core team keep the site current without code. It is a small internal tool for six to ten people, so it favours plain, reliable screens over features.

## Scope for v1

| Area | Can do |
|---|---|
| Events | Create, edit, publish, unpublish, delete. Add cover image and a photo gallery. Record attendance after the event. |
| Team | Add, edit, reorder, deactivate members. Upload photos. |
| Partners | Add, edit, reorder, deactivate. Upload logos. |
| Posts | Write in Markdown with live preview, or link to an external article. Publish and unpublish. |
| Site settings | Links (Meetup, WhatsApp, Builder Center, socials, email), manual stats, announcement bar, UCC crest switch. The SCD page switch comes with the SCD content, in a later phase. |
| Admin users | Admins only: add or remove people, set their role. |

Out of scope for v1: comments, member accounts, RSVPs, newsletters, analytics dashboards, multi-language.

## Access

- Sign in with Google through Better Auth. Only emails in the `AdminUser` table can sign in; everyone else sees "This account does not have access" and nothing else.
- Two roles:
  - **ADMIN**: everything, including Admin users and Site settings.
  - **EDITOR**: Events, Team, Partners, Posts. Cannot change Site settings or users.
- Seed one ADMIN: anarbajoel@gmail.com.
- Every server action calls `requireRole()` before it does anything. Never trust a hidden field or the client for the role.
- The `/admin` tree is excluded from the sitemap and has `noindex`.

## Data model

Write this as `prisma/schema.prisma`. Timestamps are UTC.

```prisma
enum Role { ADMIN EDITOR }
enum Status { DRAFT PUBLISHED }
enum EventTag { BOOTCAMP BUILD TALK NETWORKING COMMUNITY_DAY }
enum EventFormat { IN_PERSON ONLINE }
enum RoleGroup { LEADER TECHNICAL EVENTS COMMUNITY }
enum PartnerType { CAMPUS SPONSOR COMMUNITY }

model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(EDITOR)
  createdAt DateTime @default(now())
}

model Event {
  id          String      @id @default(cuid())
  slug        String      @unique
  title       String
  tag         EventTag
  format      EventFormat
  startsAt    DateTime
  endsAt      DateTime
  venue       String?     // required when format is IN_PERSON
  summary     String      // max 200 chars, shown on cards
  body        String      // Markdown
  meetupUrl   String?     // required before status can be PUBLISHED
  coverImage  String?
  photos      String[]    // gallery, added after the event
  attendance  Int?        // entered after the event, from the attendance sheet
  recapPostId String?
  status      Status      @default(DRAFT)
  updatedBy   String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model TeamMember {
  id         String    @id @default(cuid())
  name       String
  role       String
  roleGroup  RoleGroup
  programme  String?
  level      String?
  photoUrl   String?
  linkedin   String?
  order      Int       @default(0)
  active     Boolean   @default(true)
  updatedAt  DateTime  @updatedAt
}

model Partner {
  id          String      @id @default(cuid())
  name        String
  type        PartnerType
  logoUrl     String?
  url         String?
  description String?     // one line, what they do with us
  order       Int         @default(0)
  status      Status      @default(DRAFT)
  updatedAt   DateTime    @updatedAt
}

model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String
  body        String?   // Markdown; null when externalUrl is set
  externalUrl String?   // LinkedIn or Builder Center article
  coverImage  String?
  author      String
  publishedAt DateTime?
  status      Status    @default(DRAFT)
  updatedBy   String?
  updatedAt   DateTime  @updatedAt
}

model SiteSettings {
  id                 Int      @id @default(1) // single row
  email              String
  meetupUrl          String
  whatsappUrl        String?
  builderCenterUrl   String
  linkedinUrl        String?
  instagramUrl       String?
  xUrl               String?
  membersCount       Int?
  departmentsCount   Int?
  announcementText   String?
  announcementUrl    String?
  announcementActive Boolean  @default(false)
  scdPageEnabled     Boolean  @default(false)
  uccCrestApproved   Boolean  @default(false) // switch on only after UCC gives written approval
  updatedBy          String?
  updatedAt          DateTime @updatedAt
}
```

SCD content (agenda, speakers, sponsors, FAQ) is a later phase. Leave the models out of v1 and note it in `tasks/todo.md`.

## Validation

Shared zod schemas in `src/lib/validation/`. On top of the field rules:

- Every free-text field runs through `lib/copy-rules.ts`. If it contains an em dash, an en dash or an emoji, the save is rejected with: `Remove the dash or emoji in this field. Use a comma, colon or full stop instead.` Same rule as the codebase, so the live site stays clean too.
- An event cannot be published without `meetupUrl`, and in-person events cannot be published without `venue`.
- `endsAt` must be after `startsAt`.
- Slugs are generated from the title, lowercase, hyphenated, and editable. Reject duplicates with a clear message.
- URLs must be https.

## Uploads

- The browser asks a server action for a presigned PUT URL, then uploads straight to S3. The server never streams file bytes.
- Allowed: JPEG, PNG, WebP, SVG (logos only). Max 5 MB.
- Keys: `events/<eventId>/<random>.<ext>`, `team/<memberId>/<random>.<ext>`, `partners/<partnerId>/<random>.<ext>`, `posts/<postId>/<random>.<ext>`.
- SVG uploads are sanitised before they are saved; strip scripts and event handlers.
- Images render through `next/image` with the bucket's domain in `remotePatterns`.
- The IAM user can only `PutObject` and `DeleteObject` on this one bucket.

## Publishing

- Public pages stay static and refresh on a 60-second timer, so changes show within about a minute. Amplify Hosting does not support on-demand revalidation.
- Draft content is never visible on the public site. An editor can open a draft with a preview link that only works while signed in.

## Screens

| Route | Contents |
|---|---|
| `/admin` | Counts of drafts and published items, next three upcoming events, events in the last 14 days with no attendance recorded (prompt to fill in) |
| `/admin/events` | Table: title, tag, date, status. Filter by status and upcoming or past. |
| `/admin/events/new`, `/admin/events/[id]` | Form, Markdown editor with preview, image uploads, publish switch |
| `/admin/team` | List with move up and move down buttons, active switch |
| `/admin/partners` | Same pattern as team |
| `/admin/posts` | Table plus editor |
| `/admin/settings` | Admins only |
| `/admin/users` | Admins only |

## Audit

Every write sets `updatedBy` to the signed-in email. A full audit log is not needed in v1.
