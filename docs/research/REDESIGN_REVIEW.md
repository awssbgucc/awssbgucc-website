# Redesign review, 11 Nov 2026

Everything here was checked on Joel's laptop against a disposable local database (PGlite, port 5434) holding the reviewed content. Nothing was committed, pushed, deployed or written to Neon. Screenshots, recordings and comparison images are in `review/redesign2/` (git-ignored).

## What changed

The public site now uses the official SBG creative system rather than a text identity:

- **Grid.** A hairline cell grid on Grey 850.
- **Blocks.** Solid blocks in the programme palette that step upward, like the official backgrounds.
- **Brand.** The official chip and wordmark, and the official pixel icons.
- **Place.** Cape Coast is the lit Mint cell on the Ghana map, which is the same grid at a smaller scale.

Direction and alternatives: `CREATIVE_DIRECTION.md`. Asset decisions and conflicts: `ASSET_INVENTORY.md`.

| Area | Before (10 Nov) | Now |
|---|---|---|
| Identity | Text wordmark | Official chip and wordmark, campus line, official palette and icons |
| Positioning | Cloud courses and certification | "A campus of builders": software, cloud and AI. Eight areas labelled covered, on the calendar, announced or open to explore, each with sources |
| Hero | Two columns, one photo | Grid of real photos, the chip, palette blocks and a live next-session cell with countdown |
| Events | Empty on Neon | 4 published sessions and 3 recaps in the local preview; staircase timeline; archive with flyer crops; detail pages with the full flyer, facts strip and previous and next links |
| Photographs | 3 in a row | 13 web copies: hero grid, a four-beat week 3 story, About photo wall. No photo repeats across pages, apart from the recap cover |
| Flyers | 1, local only | 3 published (launch, career, From Code to Cloud). 2 withheld, with the rule each conflicts with |
| Projects | Empty state filling the page | A short invitation with what a project page shows and a real bootcamp story. The populated layout was checked with 3 labelled local fixtures, since removed |
| New page | | `/about`: story, staircase, how membership works, photo wall, programme note, map |
| Motion | Fade-ins | Hero line rise and stepped grid build; stepped image masks; staircase growth; widening photo panels; explorer rebuild; stepped mobile sheet; header that compacts on scroll; map pulse that stops after three. CSS and one IntersectionObserver, no library |
| Portal and admin | Text brand | Official brand mark, a four-colour strip on the rail, Mint for live states. No logic changes |

## Files to look at

- `review/redesign2/compare-home-1440.jpg`, `compare-home-375.jpg`, `compare-events-1440.jpg`: previous against new.
- `review/redesign2/shots/`: every public page at 375 and 1440, the main pages at 768 and 1280, each with a `-fold` capture of the first screen; `home-*-reduced.png` under reduced motion; `auth-*`: portal and admin at four widths (fixture users).
- `review/redesign2/motion/`:
  - `home-desktop.webm`: hero entrance, staircase, photo panels, explorer.
  - `menu-mobile.webm`: open, Escape, open, navigate.
  - `events-desktop.webm`: tabs, filters, row hover.
- `review/redesign2/brand-icons-contact.jpg`, `pptx-media-contact.jpg`, `icon-shapes.png`: the brand kit, seen.

## Checks

| Check | Result |
|---|---|
| TypeScript | Passed |
| ESLint and copy rules | Passed: 0 errors, 5 warnings. All warnings are the launch event's real title, "Your Cloud Journey Starts Here", kept verbatim |
| Unit tests | 206 passed, including new tests that tie the explorer, content file and media manifest to their sources |
| Production build | Passed. Home first load 114 kB |
| Playwright on the production build, one worker: site, redesign, admin, boundaries, journeys | 77 passed, 0 failed, 15 skipped by design (one-viewport tests), after Joel's decisions. Includes a new test: an admin adds a team member, who appears on /team after the 60 second refresh, then edits and hides them |
| Production route checks (`e2e/prod`) | 4 passed |
| Dev-only styleguide tests | 4 passed on `next dev` |
| Axe, WCAG 2.1 A and AA, 18 public routes at 375 and 1440, rechecked on the changed pages and a populated team page | 0 violations. The first run found two, both fixed and rechecked: a scrollable photo strip with no keyboard access, and a link inside a definition list |
| Visual sweep | No horizontal overflow, console errors or broken images, and one h1 per page, at every width captured |
| Throttled phone (slow 4G, 4x CPU) | LCP 1.1 to 1.5 s with motion; CLS 0 to 0.0013; main-thread blocking above 50 ms: 315 to 508 ms with motion, 236 to 361 ms without. Transfer 319 to 426 kB |

An earlier full run under `next dev` failed for reasons outside the code: I edited files mid-run, which triggered reloads, and another dev server shared the `.next` folder. The suite was rerun on a production build. On that build, "a rejected submission pays nothing" timed out once on a cold first page load (120 s), then passed alone in 16 s and passed again in the final full run. Logged as cold-start slowness on this laptop, not a code fault.

Reduced-motion LCP reads 3.4 to 3.9 s on home and About. Nothing loads more slowly, and transfer is identical: without the entrance clipping, the hero photo becomes the measured element instead of the headline. If that number matters, the hero photo could be served smaller on phones.

Not done: Lighthouse, real phones, a screen reader, Safari and Firefox. The header compaction needs scroll-driven animation support (Chromium today); other browsers get a fixed header, which is the intended fallback.

## Decisions, 11 Nov 2026

Joel decided:

- From Code to Cloud runs 9:30 AM to 1:00 PM in the Computer Lab, New Science Annex. The site now says so. **The Meetup listing still says noon and the lecture theatre, so update it there too.**
- The Zero to Cloud Practitioner bootcamp is a 12-week programme with certification vouchers at the end for eligible participants. It needs no event listing, so the kickoff record is removed. The bootcamp appears as a programme with its flyer, length and voucher terms.
- Publish everything: the Freshers and Zero to Cloud flyers are now on the site.
- Trimming the wordmark panel and adding the campus line is approved.
- The team is added later through the admin. A browser test now covers adding, showing, editing and hiding a member.

These are recorded as dated notes under COMPLIANCE.md rules 1, 2 and 21.

Still open:

1. Launch end time, and the platform used for freshers onboarding.
2. Whether week 4 (Amazon EC2 and AWS Lambda) took place.
3. Amazon Ember web licence (Geist stays until then); Amber stays out under rule 10.
4. Run the drafts-only import on Neon (`CONTENT_PIPELINE.md`), then publish each record in the admin. Team photos need the live S3 bucket, which cannot be tested locally.

## How it differs from GEU

GEU builds its identity from volume: a violet glow, floating AWS service icons, AWS orange, stat chips and a splash loader. Ours comes from the official SBG grid and from place: Grey 850 flat surfaces, steps that each stand for a real session, the Cape Coast cell, LT5 and the Science Annex, and Saturday photographs with dated captions. No orange, no glow, no counts that are not real, and every claim about a topic says whether it has actually happened.
