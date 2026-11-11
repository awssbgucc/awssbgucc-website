# Reference audit: AWS Student Builder Group at Graphic Era University (GEU)

Research only. Nothing in this file changes a decision in CLAUDE.md, DESIGN.md, CONTENT.md, ADMIN.md or COMPLIANCE.md. The companion proposal is `docs/PRODUCT_REDESIGN_PROPOSAL.md`.

Inspected on Thu 5 Nov 2026 in Chrome with JavaScript on, signed out of every GEU property. Desktop viewport 1366 by 633. Phone width was checked by loading the page in a 390px same-origin frame, because the browser window could not be resized. That is close to a phone but not identical: no touch events and no device pixel ratio change.

## 1. How to read this audit

Every finding carries one of four labels.

| Label | Meaning |
|---|---|
| **Verified** | I saw it in the browser, or measured it with a script on the live page |
| **Described** | It comes from your list of portal features. I did not see it |
| **Inferred** | A reasonable design reading of what I saw, not a fact about GEU |
| **Not tested** | Could not be reached without signing in, or was out of scope |

**About the portal screenshots:** your brief says screenshots were supplied in the conversation. None reached my environment, so I have not seen them. Every signed-in portal feature below is therefore **Described**, never **Verified**.

I make no claims about GEU's database, auth provider, hosting or source code. The only technical facts below come from the rendered page: computed fonts and colours, DOM structure, timing entries and stylesheet rules.

## 2. Routes inspected

### Public site, awssbggeu.com

| URL | What it is | Checked |
|---|---|---|
| https://awssbggeu.com/ | Home | Desktop and 390px, light and dark theme, mobile menu, timing |
| https://awssbggeu.com/events | Events and programmes list | Desktop, filters, cards |
| https://awssbggeu.com/cloud-ignite-26 | Event story (inaugural session) | Desktop |
| https://awssbggeu.com/challenges | Challenges list | Desktop |
| https://awssbggeu.com/builder-challenge | 21-day sprint landing page | Desktop |
| https://awssbggeu.com/projects | Project showcase and submission form | Desktop, form fields (not submitted) |
| https://awssbggeu.com/team | Team | Desktop, image loading |
| https://awssbggeu.com/gallery | Photo gallery | Desktop, filters |
| https://awssbggeu.com/blog | Blog list | Desktop, load timing |
| https://awssbggeu.com/blog/building-builders-not-just-learners | Article | Desktop, measure and type size |
| https://awssbggeu.com/about | About | Headings only |
| https://awssbggeu.com/student-community-day | Student Community Day microsite | Desktop, headings |
| https://awssbggeu.com/student-community-day/badge | "Badge Studio" | Rendered blank after 3s |
| https://awssbggeu.com/brand | Brand guidelines | Palette and type sections |
| https://awssbggeu.com/verify | Membership and certificate lookup | Rendered after about 6s; nothing searched |
| https://awssbggeu.com/aws-student-builder-group-geu | "Verified Facts Matrix" entity page | Headings only |
| https://awssbggeu.com/pawan-joshi | Group lead profile | Headings only |

Linked but not opened: `/contact`, `/code-of-conduct`, `/hacktoberfest-hackday-aws`, `/challenges/kiro-build-challenge`, `/challenges/zero-budget-aws`, `/builder-challenge/winners`, and the external KonfHub, Meetup, Discord, YouTube and Linktree pages.

### Member portal, portal.awssbggeu.com

| URL | Result |
|---|---|
| https://portal.awssbggeu.com/ | Splash loader, then redirect to `/login` |
| https://portal.awssbggeu.com/login | Sign-in form. Inspected, nothing submitted |
| https://portal.awssbggeu.com/register | Sign-up form. Inspected, nothing submitted |
| https://portal.awssbggeu.com/dashboard | Redirects to `/login` when signed out |

I did not create an account, sign in, submit any form, or call any portal API.

## 3. Inaccessible areas

Not tested, because they need a signed-in account: onboarding, profile, skills and interests, LinkedIn field, profile photo, referral code use, notification preferences, dashboard, sidebar, XP and levels, challenges and sprints inside the portal, events inside the portal, consistency calendar, streaks, milestone notifications, badges, member profiles, tech stack selection, rewards and wallet, perks store, profile customisation and community features.

If you want those verified, sign in with your own GEU account (if you have one) and share screenshots, or watch while I look at what your account can see. I will not create an account to get in.

## 4. Public site findings

### 4.1 Identity and visual system

- **Verified.** Near-black background (`rgb(9 9 11)`), one violet accent, Plus Jakarta Sans for everything. The brand page publishes the palette: a violet primary, **AWS orange (#FF9900) as the secondary**, a mint green for success and streaks, and a pink for hackathons. It names Amazon Ember and Plus Jakarta Sans as the typefaces.
- **Verified.** The header is a floating rounded bar: logo chip, "Graphic Era Deemed to be University" under the name, nine links including a pulsing `SCD '26 LIVE` pill, a theme toggle and `LOGIN`. A floating "Join WhatsApp" button sits bottom right on every page.
- **Verified.** There is a light theme behind the toggle, stored in `localStorage` under `theme`. In light mode the hero becomes white with a lilac wash.
- **Verified.** The hero has floating AWS service icons (Lambda, S3, a compute icon) and the AWS smile wordmark around the headline, over a violet radial glow and a faint grid.
- **Inferred.** The identity comes from the program purple, AWS imagery and volume. It does not come from anything particular to Dehradun or Graphic Era, apart from one "Himalayan" event poster and a section listing the university's rankings.

Against our COMPLIANCE.md, several of these would break our rules: AWS product icons and the smile logo (rule 2 and rule 10), the orange accent (rule 10), and "Graphic Era's official student builder community" (rule 6, implied university endorsement). This is not a judgement on GEU's own permissions, which I do not know. It does mean we cannot borrow these moves.

### 4.2 Home page

**Verified structure, top to bottom.** 7,713px tall on desktop, about 10,700px at 390px.

1. Centred hero with a pill above the headline (`AWS SCD 2026 · Graphic Era, Dehradun · 31 Oct`), a two-line headline whose middle word rotates between BUILD and SHIP, one line of copy, and two buttons: `BUILDER PORTAL` (primary) and `JOIN COMMUNITY` (Meetup).
2. "Building is Better Together": four numbered pillars, Learn, Build, Ship, Connect.
3. Student Community Day promo: date, venue, six perk tiles (rewards bundle, swag kit, lunch, tracks, credential), and links to the summit, passes and badge.
4. Two milestone cards (inaugural session, 21-day challenge), each with headline numbers and a link to a story page.
5. Testimonials: a phone-framed video reel, three stat tiles, three quote cards with initials avatars, a role chip and a "Verified participants" line.
6. "The community in action": three large real event photos with category chips.
7. "Why build with us?": three feature cards styled like terminal output (`$ AWS LAMBDA DEPLOY`, `STATUS: DEPLOYED V2.4`).
8. Certification course promo (an external course, "Enroll Free").
9. A sponsored learning grant block (DataCamp Donates).
10. A long host university section: rankings, accreditation, campus count, computing clusters.
11. Message from the lead, with a link to the lead's profile page.
12. Footer: about 25 links, two email addresses, socials, Discord, YouTube, Linktree, and AWS Privacy and Terms links.

**What works**

- Photographs of real rooms full of real students are the most convincing thing on the site. The three photo cards in section 6 do more for credibility than every stat on the page.
- Story pages for past events (`/cloud-ignite-26`) turn an event into a record: overview, highlights, attendance, guests, photos. That gives a past event a lasting page.
- The two milestone cards connect the home page to deeper content with one clear link each.

**What does not**

- Twelve sections and three different calls to action compete. The portal, Meetup, WhatsApp (floating), passes and an external course all ask for the click.
- Numbers are everywhere, always rounded up with a `+` (350+, 420+, 200+, 30+, 25+, 700+, 800+, 9+, 100%). Repeated across sections, they read as marketing rather than record.
- I cannot verify the testimonial names or the quotes. The initials avatars and generic names make them look like placeholders, even if they are real. Our rules ban this pattern for exactly that reason.
- Section 10 is about the university, not the group, and is longer than the section about what the group runs.
- The centred hero with a pill above it is the pattern DESIGN.md bans as an AI giveaway.

### 4.3 Events, challenges and event stories

- **Verified.** `/events`: hero with three stat chips, a featured upcoming event, then "All Community Programmes" with five filter chips (All, Upcoming and Active, Flagship Summits, Challenges and Sprints, Technical Workshops) and a count ("Showing 10 programmes").
- **Verified.** Each card has a poster image as its cover, a status badge (`UPCOMING`, `CONCLUDED`), a category badge, date and location on the image, a coloured kicker line, title, three-line summary, outcome chips ("45 Curated Builders", "Winners Announced") and a full-width button.
- **Verified.** Upcoming events link out to Meetup listings and to KonfHub for paid passes. The Student Community Day copy says passes are non-refundable and lists sold-out tiers.
- **Verified.** `/challenges` lists the same challenges with posters. `/builder-challenge` is a long landing page: summary stats, "Hall of Fame", why it exists, a 21-day plan, daily and weekly quizzes, a "gamified leaderboard", rewards and certificates, outcomes, how to take part, FAQ.

**Strengths:** status badges and outcome chips make the past legible. You can see what happened, not only what is coming. The filters are simple and useful once there are more than about eight events.

**Weaknesses:** the covers are promotional posters with their own type, so every card has two competing typographic systems and the poster text is unreadable at card size. The same event appears in several lists with slightly different copy. A conference page with paid, non-refundable tiers is far from a free student group, and our COMPLIANCE rule 17 keeps RSVPs on Meetup.

### 4.4 Projects

- **Verified.** Hero with three stats and two buttons ("Open builder roles", "Submit your project"). An "Active initiatives" section recruits two students per initiative, almost all led by the group lead. Project cards are text only: category, title, one-line description, AWS service chips, a "Live app" or "Architecture" link. Category filter and a search box.
- **Verified.** A public three-step submission form (Builder profile, Project info, Architecture). Step 1 asks for full name, email with a "Verify" step, phone number and university.

**Strengths:** projects get a home, and the stack chips tell a technical reader what was used at a glance. Asking for the architecture as a step is a good prompt for students.

**Weaknesses:** no screenshots or diagrams on the cards, so every project looks the same. Most initiatives list the same lead, which reads as one person's portfolio, not the community's work. A public form that collects phone numbers is more personal data than a showcase needs.

### 4.5 Team

- **Verified.** Photo cards in a four-column grid. The role sits as a chip on the photo, with the name in uppercase under it. Two groups: Executive leads and Chapter associates. 16 photos.
- **Verified.** Photos load lazily. During scrolling, two cards showed a black panel covering most of the photo for about a second.

**Strength:** real faces, clear role labels. **Weakness:** the loading state is a black box, not a reserved, neutral placeholder.

### 4.6 Gallery

- **Verified.** A headline about defining moments, then filter chips per event with photo counts (for example 20 photos for the inaugural session), a three-column grid and "Load more photos". One photo still has a GPS-stamp overlay from the camera app, showing an address and coordinates.

**Strength:** grouping by event is the right model. **Weaknesses:** a separate gallery page splits the photos from the event they belong to. Location stamps on public photos are a small privacy leak worth avoiding.

### 4.7 Blog and articles

- **Verified.** The list page renders its posts about 2s after the rest of the page. Post titles are not headings, so a screen reader user cannot jump between posts.
- **Verified.** An article (1,712 words) uses 18px text at 29px line height, in a column 896px wide. That is roughly 110 characters a line, well past a comfortable measure of 60 to 75.

### 4.8 Student Community Day microsite

- **Verified.** `/student-community-day` swaps in its own nav (Schedule, Speakers, Tickets, RSVP, Sponsors, Team, Venue, Badge Studio) and a "Sold out" button. It is 21,762px tall with 56 images: agenda with ceremony items, speakers, sponsors, venue.
- **Verified.** `/student-community-day/badge` showed only a back link after 3s.

**Inferred.** A separate nav for a one-day event is a sound idea, since it makes the event feel like its own thing. The page length is not. Our CONTENT.md already plans a much tighter `/scd` (when, where, who, agenda, speakers, sponsors, venue, FAQ).

### 4.9 Brand, verification and entity pages

- **Verified.** `/brand` publishes lockups, palette with hex, RGB and HSL values, typefaces, grid templates and guidance for designers. Useful for volunteers making posters.
- **Verified.** `/verify` looks up "membership IDs" and "certificate codes". The empty state describes an "authoritative cryptographic database". I cannot verify that, and it overstates what a lookup is.
- **Verified.** `/aws-student-builder-group-geu` is a facts page, "What is...", milestones and canonical links, written for search engines and AI answers.
- **Inferred.** Certificate verification makes sense only if the group issues certificates. If ours ever does, a plain lookup that shows the name, event and date is enough.

### 4.10 Mobile

- **Verified at 390px.** No horizontal scroll (scroll width 382px). The header collapses to logo, theme toggle and a menu button. The hero keeps the rotating word and both buttons side by side.
- **Verified.** The menu opens as a large panel: a "Builder portal login" button, a featured Community Day card, then a two-column grid of links with an icon on each.
- **Verified.** The menu button has an accessible name ("Toggle menu") but no `aria-expanded`, and the panel has no dialog role.

### 4.11 Accessibility, performance and motion

| Check | Result | Label |
|---|---|---|
| Skip link | None found | Verified |
| `prefers-reduced-motion` | 3 media rules against 30 keyframe animations | Verified |
| Images without alt | 0 of 17 on home | Verified |
| First contentful paint, home, desktop broadband | about 2.2s | Verified, one run |
| Load event, home | about 3.3s | Verified, one run |
| Home HTML size | about 360 KB | Verified |
| Rendering | A single `#root` element is filled in by script. Some pages (`/verify`, `/badge`) are blank for 2 to 6s | Verified |
| Uppercase headings and labels | Used widely, harder to read in long runs | Verified |
| Light theme contrast | Not measured | Not tested |

**Inferred.** On a mid-range Android phone on mobile data in Cape Coast, those blank seconds would feel much longer. Our own pages are server-rendered, which already avoids this.

## 5. Portal findings

### 5.1 What I could verify

- **Splash loader.** A centred SBG chip, the group name, a progress bar and a themed status line ("Routing packets through Route 53..."). It showed for 4 to 8s before the sign-in form.
- **Sign-in.** A light theme (white background, Manrope typeface, violet buttons). It is visibly a different product from the dark public site. "Welcome back", `Continue with Google`, then "or continue with email" with a single email field and `CONTINUE`. A "Create one here" link to sign-up. Footer links back to the main site and to support.
- **Sign-up.** "Create builder account", "Join a global community of student builders on AWS." `Sign up with Google`, or full name, email, password (minimum 8, with a show-password button) and an optional referral code (`SBG-XXXX`). No university email requirement is visible.
- **Route protection.** `/dashboard` redirects to `/login` when signed out.
- **Form accessibility.** In the accessibility tree, the text fields take their names from their placeholders ("Pawan Joshi", "name@example.com"), not from the visible labels above them. Both submit buttons have no accessible name. The Google button did not appear in the tree.

### 5.2 What you described

From your list, and not seen by me: a four-step onboarding (profile, skills and interests, optional LinkedIn, photo, referral code, notification preferences), a dashboard with sidebar navigation, XP points and levels, challenges and sprints, events and workshops, a consistency calendar, daily streaks, milestone notifications, achievement badges, member profiles, tech stack selection, rewards and a wallet, a digital perks store, profile customisation and community features.

### 5.3 Answers to your ten questions

Each answer is **Inferred** from the verified sign-in flow, your feature list and the public site, unless it says otherwise.

1. **Main user flows.** Sign up, onboard, then come back for a sprint or challenge, earn XP and badges, and spend points in the store. A second flow runs from the public site's event and challenge pages into the portal, through the `BUILDER PORTAL` button.
2. **When a new member joins.** Verified: Google or email and password, with an optional referral code. Described: four onboarding steps. Inferred: the referral code is a growth mechanic that feeds the rewards system.
3. **What a returning member sees.** Described: a dashboard led by XP, level, streak and the consistency calendar. Inferred: the first thing a member sees is a score, not the next session.
4. **How events, challenges and rewards connect.** Described: challenges and events award XP, XP raises levels and earns badges, and points buy perks. I cannot see how attendance or a submission is verified before points are given. That is the most important question for a reward system, and the interface I could reach does not answer it.
5. **How progress is shown.** Described: points, levels, streak counters, a calendar heat map and badges. All four measure frequency, and only some measure substance.
6. **How navigation organises the product.** Described: a left sidebar. Inferred: grouped by feature (Challenges, Events, Rewards, Profile) rather than by task.
7. **Genuinely useful.** Google sign-in. A profile with skills and interests, which helps match people to projects and sessions. Events and workshops inside the member view. Challenges with a clear brief and deadline. Badges, if they are tied to verified work.
8. **Cosmetic or overcomplicated.** Daily streaks and a consistency calendar, which reward opening the app. A wallet and perks store, which need stock, rules, fraud checks and someone to run them. Referral codes. Profile customisation beyond a photo and links. A four-step onboarding for what is mostly a name, programme and interests.
9. **What makes it feel like a real application.** A separate subdomain with its own sign-in. A sidebar shell. A branded loader. Persistent identity across visits. Progress that changes over time. Notifications.
10. **Accessibility and UX weaknesses.** Verified: placeholder-only field names, unnamed submit buttons, a 4 to 8s splash before anything usable, and a light theme with a different typeface that breaks continuity with the public site. Inferred: streak mechanics punish members who miss days for exams, travel or power cuts, and points shown without rules invite distrust.

## 6. Critical evaluation

| Criterion | Public site | Portal (verified parts only) |
|---|---|---|
| Visual identity | Strong and consistent, but built from AWS imagery and program purple rather than place | Generic SaaS sign-in; does not share the public site's type or surface |
| Readability | Good body size; long uppercase runs and a very long article measure hurt | Clean, but low-contrast placeholder text in fields |
| Information hierarchy | Too many sections and calls to action; the university outranks the group | Simple sign-in hierarchy |
| Accessibility | No skip link, thin reduced-motion support, menu state not announced | Field and button names missing in the accessibility tree |
| Mobile usability | No horizontal scroll, clear menu, but about 10,700px of home page | Not tested beyond sign-in |
| Navigation clarity | Nine top links plus a live pill; the footer repeats most of it | Not tested |
| Component consistency | Cards, chips and badges are consistent; poster covers clash with them | Not comparable, different system |
| Perceived performance | Blank seconds on client-rendered pages | 4 to 8s splash |
| Motion | Rotating hero word, floating icons, pulsing pill, glow; little reduced-motion care | Loader animation |
| Practical usefulness | Event stories, gallery and projects are useful; much else is promotion | Unknown beyond sign-in |
| Community engagement | Photos and stories engage; stats and quotes do less | Described mechanics push frequency |
| Operational complexity | High: SCD microsite, ticketing, verification, gallery, blog, projects form | High if the store, wallet and referrals are real |
| Maintainability | Many one-off landing pages with hand-written numbers that go stale | Unknown |

### Dark public site, light portal

GEU's split reads as two products: different background, different typeface (Plus Jakarta Sans against Manrope), different header. A member who clicks `BUILDER PORTAL` lands somewhere that does not feel like the site they came from.

My view for UCC: **one design system, one set of tokens, one typeface pair, one header identity.** Surfaces may differ in density, not in brand. The public site is editorial and spacious. The portal and admin are tighter, with tables, forms and a sidebar. If a light surface is ever wanted for long forms or printing, it should be a token theme of the same system, not a second design. CLAUDE.md rules out a light theme in v1, and I see no reason to change that.

### Onboarding on desktop

From the verified sign-up form: a single narrow card centred on a wide white page wastes the desktop. A better desktop layout puts the steps on the left with a short reason for each ("We use your programme to suggest sessions"), and the fields on the right. Better still is fewer steps. For UCC, two short steps cover what we need (see the proposal).

### XP first, or the next session first

A dashboard should answer "what should I do next, and what have I done that counts?" For a group that meets on Saturdays in LT5, that means the next session, the lab or task from the last one, and a record of verified participation. XP can be computed from that record later, but it should not be the headline.

## 7. Patterns worth learning from

1. **Event stories.** Every past event gets a page with what happened, who came (a recorded count), guests and photos.
2. **Photos grouped by event**, shown on the event, with a count.
3. **Status and outcome on event cards.** Upcoming or concluded, plus one or two recorded outcomes.
4. **A project showcase** with the stack visible, a live link, and the architecture as part of the submission.
5. **A distinct sub-navigation for Community Day**, scoped to that page.
6. **A brand page for volunteers**, so posters and slides stay consistent. Ours would document our own tokens and point to the program's Box files for logos.
7. **Google sign-in for members**, with route protection that redirects cleanly.
8. **A member view of events and workshops**, so members see what is next for them.
9. **Filters on lists** once a list is long enough to need them.

## 8. Patterns to avoid

1. AWS service icons, the AWS smile and the AWS orange (our COMPLIANCE rules 2 and 10).
2. Any wording that implies the university runs or endorses the group (rule 6).
3. Centred hero with a pill above it, rotating headline words, floating icons and a radial glow.
4. Rounded-up stats everywhere. Show a number only where it is recorded, once, where it matters.
5. Testimonials we cannot point to a real, consenting person for.
6. Promotional posters as card covers. Use photos, or a plain typographic card.
7. Long landing pages for every programme, with hand-maintained numbers that go stale.
8. Client-rendered pages that are blank for seconds, and branded splash loaders.
9. Placeholder-only form labels and unnamed buttons.
10. Streaks, consistency calendars, wallets, perks stores and referral codes.
11. Collecting phone numbers or more personal data than a feature needs.
12. Public photos with GPS stamps.
13. Claims we cannot back, such as a "cryptographic database", "flagship" or "largest".

## 9. Screenshots

Saved in `docs/research/`. The GEU images are for internal review only. They show GEU's artwork and posters, so they should not be published or reused. Screenshots that show identifiable faces were left out on purpose, apart from the hero area. See question Q12 in the proposal about keeping these out of git.

### GEU

| File | Shows |
|---|---|
| `docs/research/geu/01-home-hero-desktop.jpg` | Centred hero, pill, floating AWS icons, floating header |
| `docs/research/geu/02-events-filters-desktop.jpg` | Featured event and filter chips |
| `docs/research/geu/03-events-cards-desktop.jpg` | Event cards with poster covers, status and outcome chips |
| `docs/research/geu/04-home-hero-mobile.png` | Hero at 390px |
| `docs/research/geu/05-home-light-theme-mobile.png` | The light theme at 390px |
| `docs/research/geu/06-mobile-menu.png` | Mobile menu panel |
| `docs/research/geu/07-portal-splash-loader.jpg` | Portal splash loader |
| `docs/research/geu/08-portal-login.jpg` | Portal sign-in |
| `docs/research/geu/09-portal-register.jpg` | Portal sign-up with referral code |
| `docs/research/geu/10-event-story-cloud-ignite.jpg` | Event story page layout |

### UCC, current build (dev server, Neon data, 5 Nov 2026)

| File | Shows |
|---|---|
| `docs/research/ucc-current/01-home-hero-desktop.jpg` | Hero at 1366 by 633. The Cape Coast marker sits below the fold |
| `docs/research/ucc-current/02-home-hero-mobile.png` | Hero at 375px. The map starts below the buttons |
| `docs/research/ucc-current/03-home-map-stats-mobile.png` | Marker and label at 375px, about one screen below the buttons; a stats row with a single figure |
| `docs/research/ucc-current/04-events-empty-desktop.jpg` | Events page with no published events |
| `docs/research/ucc-current/05-team-empty-desktop.jpg` | Team page with no active members: headline and intro, then the footer |
| `docs/research/ucc-current/06-admin-overview.jpg` | Admin overview |
