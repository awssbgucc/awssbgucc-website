# Motion review, 13 Nov 2026

The result of the motion brief, checked on Joel's laptop against the local review database (PGlite, port 5434). The dev fixture events were set to draft while recording and measuring, then restored. Nothing was committed, pushed, deployed or written to Neon or AWS.

- **Design:** `docs/MOTION_SYSTEM.md`.
- **Reference study:** `docs/research/MOTION_REFERENCE_AUDIT.md`.
- **Recordings and screenshots:** `review/motion/` (git-ignored).

## What changed, in one paragraph

The site keeps the 11 Nov redesign and now moves as one system, "built cell by cell":

- **Hero:** the photographs resolve out of pixels in the official SBG colours, the hairline grid lights cells under the pointer, and a mint cursor marks "here and now".
- **Staircase:** a line completes along each step as you scroll.
- **Technology board:** each area shows how far the group has got with it, and draws traces to the real sessions and stories that back it.
- **Photos:** every approved photo runs in a scroll-linked filmstrip and opens full screen.
- **Map:** the closing map of Ghana assembles row by row.
- **Moving around:** pages change with view transitions, and event cards grow into their pages.
- **Events:** special events get an edition framework, after Heapcon.
- **Builder Portal:** it celebrates only states the server has confirmed.

## Recordings

| Shows | File (in `review/motion/`) |
|---|---|
| Hero load, desktop, with pointer | `rec-after/home-load-1440.mp4` |
| Hero load, phone, with tap | `rec-after/home-load-375.mp4` |
| Home scroll, desktop and phone | `rec-after/home-scroll-1440.mp4`, `rec-after/home-scroll-375.mp4` |
| Technology board, mouse and keyboard | `rec-after/tech-board-1440.mp4` |
| Technology board, phone taps | `rec-after/tech-board-375.mp4` |
| Events: archive browsing, tab and type changes | `rec-after/events-1440.mp4` |
| Event card to event page, then back | `rec-after/event-detail-1440.mp4` |
| Photo wall to viewer, arrows, Escape | `rec-after/gallery-1440.mp4` |
| Mobile menu and route change | `rec-after/menu-375.mp4` |
| Nav marker, route changes, back and forward | `rec-after/nav-1440.mp4` |
| Projects empty state | `rec-after/projects-1440.mp4` |
| Before and after, side by side | `compare/*-before-after.mp4` (hero at both widths, events, detail, menu) |
| Hero concepts A, B and C, edition preview | `rec-dev/concepts-1440.mp4` |

Screenshots:

- **Four widths:** `shots/` has full-page and first-screen images at 375, 768, 1280 and 1440 px of home, events, an event page, about, projects and blog.
- **Hero entrance in frames:** `frames/hero-sheet.jpg`.
- **Contact sheets of the recordings:** `sheets/`.

## Dependencies and bundle

- **No dependencies added.** Everything uses CSS, the View Transitions API, CSS scroll-driven animations and one canvas.

| Route | First load JS before | After |
|---|---|---|
| / | 114 kB | 120 kB |
| /about | 112 kB | 116 kB |
| /events | 116 kB | 117 kB |
| /events/[slug] | 114 kB | 116 kB |
| /projects | 114 kB | 115 kB |
| /scd | 112 kB | 114 kB |
| Shared by all | 102 kB | 102 kB |
| Portal check-in | 109 kB | 109 kB |

- **CSS:** a new `motion.css` adds 19.4 kB raw, 4.7 kB gzipped. The other stylesheets are unchanged in size.
- **Hero pixel layers:** about 6 kB of inline image data in the home HTML.

## Measured performance

**Setup:**

- production build (`next start`);
- Chromium emulating a phone at 390 by 844, two times device pixels;
- 150 ms latency, 1.6 Mbps down, CPU slowed four times;
- two runs per page, with motion on and with reduced motion;
- script: `review/motion/vitals.mjs`; data: `vitals-baseline.json` and `vitals-after.json`.

**Baseline:** built from the last commit in a separate worktree and measured the same way, with the same database and fixtures hidden.

**A correction to the first baseline.** It reported home LCP at 4.0 to 4.4 s. That was wrong. The script scrolled the page before reading LCP, and a script's scroll is not input, so the large photos further down became late LCP candidates. LCP is now read at rest, before any scrolling.

| Page | | LCP before | LCP after | CLS before | CLS after | Main-thread long-task time before | After |
|---|---|---|---|---|---|---|---|
| Home | motion | 1.43 to 1.78 s | 1.56 to 1.73 s | 0 | 0.0002 | 395 to 413 ms | 725 to 757 ms |
| Home | reduced | 1.55 to 1.68 s | 1.65 to 1.72 s | 0 | 0.0002 | 314 to 414 ms | 381 to 568 ms |
| Events | motion | 1.09 to 1.22 s | 1.21 to 1.29 s | 0.0015 | 0.0015 | 329 to 436 ms | 348 to 417 ms |
| Event page | motion | 1.18 to 1.24 s | 1.08 to 1.18 s | 0.0001 | 0.0001 | 203 to 243 ms | 345 to 365 ms |
| About | motion | 1.22 to 1.28 s | 1.22 to 1.24 s | 0.0013 | 0.0013 | 310 to 370 ms | 316 to 396 ms |

The "after" columns are from the final build, the one the browser suite and recordings ran on.

**Against the targets:**

- **LCP and CLS:** every page meets LCP 2.5 s or less and CLS 0.1 or less, with and without motion.
- **INP:** there is no field data. As a proxy we used the slowest Event Timing entry for a tap that changes state. A tap on the technology board, once the page has settled, took 96 to 136 ms across three runs (`review/motion/inp-probe.mjs`). Those taps broke down as 16 to 29 ms input delay, 19 to 36 ms processing and 44 to 84 ms until the next paint. On the final build the vitals script, which taps straight after a fast scripted scroll while the filmstrip photos are still decoding, measured 168 and 176 ms. An earlier build reached 248 ms in one run under the same conditions. So INP stays within 200 ms in every measured run on the final build. It has the least headroom on the home page, during image decoding on a slow phone.
- **Main-thread time:** the cost of the motion is main-thread work on the home page, which roughly doubles on a slow phone. Two things drive it: hydrating the board, filmstrip and viewer, and decoding 13 more photos as the filmstrip comes into view. Two changes brought it down from 813 to 962 ms to 725 to 757 ms:
  - the board now measures only once seen, after paint, and never on phones;
  - the filmstrip image sizes now match their rendered widths.
- **Transfer:** home transfer after a full scroll rose from 458 kB to about 558 to 580 kB. That is the 13 filmstrip photos, loaded only as the strip approaches.

## Accessibility and reduced motion

- **axe-core, WCAG 2.1 A and AA:** 0 violations on nine public pages at 375 and 1440 px (reduced motion). Also 0 with motion on, for the photo viewer open and for the board with another area chosen.
- **Reduced motion:**
  - every hiding rule sits behind `prefers-reduced-motion: no-preference`, and `globals.css` stops all animation under reduce;
  - tests confirm no reveal stays hidden and the hero pixel layers never cover the photo;
  - the build field does not start; route and filter changes happen instantly.
- **Keyboard:**
  - the board is a tab list: arrows, Home, End;
  - the viewer is a native modal dialog: focus contained, arrows step, Escape closes, focus returns to the thumbnail;
  - focusing a photo in the filmstrip stops the drift so it scrolls into view;
  - the nav marker follows keyboard focus.
- **Touch:**
  - taps on the board work on phones (this found the overflow bug below);
  - the viewer swipes;
  - a tap on the hero lights a three-step stair.
- **Loops:** nothing loops more than three times, and there is no audio.

## Tests

| Check | Result |
|---|---|
| `pnpm typecheck` | Passed |
| `pnpm lint` (ESLint and copy rules) | 0 errors. 6 copy warnings, all the launch event's real title ("Your Cloud Journey Starts Here"), as before. |
| `pnpm test` | 214 passed (was 206). New: 3 board tests, 5 edition tests. |
| Browser suite on the production build, one worker | See "Final browser run" below |
| New browser tests, `e2e/dev/motion.spec.ts` (8) | Pixel layers under reduced motion and after the entrance; board records; route changes with back and forward; photo viewer keyboard and focus; filmstrip keyboard reach; nav marker; no section wider than the screen |
| `/styleguide`, `/styleguide/motion`, `/styleguide/preview`, `/scd` on the production build | 404 (dev only, or gated) |
| Full-page captures at 375, 768, 1280 and 1440 | 0 console errors, 0 broken images, one h1 per page, no horizontal overflow |
| Recordings | 0 page errors or hydration warnings in all 12 scenarios |

### Final browser run

On the final production build (`next start`), with one worker, using `review/motion/playwright.start.config.ts`: the dev suite pointed at the running server, with the readiness check on `/` because `/styleguide` is 404 in production.

- **92 passed.**
- **16 skipped by design:** tests written for one viewport only.
- **2 failed, both expected:** the two viewport runs of "event and post layouts render from sample records". It opens `/styleguide/preview`, which exists only in development. It and `styleguide.spec.ts` were run on a fresh dev server; see "Dev-only checks".

### Dev-only checks

On a fresh `next dev`:

- `styleguide.spec.ts` and "event and post layouts render from sample records": 4 passed.
- `/styleguide/motion` recorded at 1440 px: the three hero concepts and the edition preview.
- In the preview's sample agenda, the session in progress shows "Now" and its mint cell. The finished one dims, with a filled cell. The room filter appears because the samples name two rooms.

## Problems found and fixed during testing

- **The board widened the page on phones.** Its rail (six records side by side) pushed the grid track to about 944 px. The page's `overflow-x: clip` hid the cut-off half, so the earlier page-width check could not see it. Fixed with `minmax(0, …)` tracks. A new test checks section widths directly.
- **The nav marker slid in from the left edge on every page load.** It now places itself instantly on arrival and only slides on hover or focus.
- **Title morph between card and page.** The overlapping text read as a glitch, so the title now rises in with the page instead.
- **Trace drawing ran off screen at load.** It now draws when the board scrolls into view.
- **The dev server crashed mid-run** ("Jest worker encountered 2 child process exceptions"), so every route returned 500. This was memory on this laptop, not the code. All flows were rerun against `next start`, as `tasks/lessons.md` advises.

## Not done, or not verifiable here

- **Real devices:** no real phones, Safari or Firefox. Chromium emulation only.
  - Scroll-driven effects (staircase line, filmstrip drift, hero depth, footer) need Chrome, Edge or Safari 26. Elsewhere they show their finished, static state.
  - View transitions need Chrome, Edge, Safari 18 or Firefox 144. Elsewhere changes are instant.
- **No Lighthouse run and no field INP.** The numbers above are lab measurements.
- **Community Day:** the edition framework renders only with `scdPageEnabled` on, and the local database has no Community Day sessions or speakers. It was checked with labelled sample rows on the dev-only `/styleguide/motion` page. No official Community Day artwork was supplied, so the edition uses the stairs motif.
- **Projects:** there are no approved projects, so the project card hover and filter transitions were exercised only by code and the existing empty state, not with real cards.
- **Portal feedback was not recorded in a signed-in session.** Check-in success, the redeem stamp, progress fills, earned achievements and onboarding steps are CSS on states the server already returns. The journeys suite exercises those flows (check-in, rewards, onboarding) and passed.

## Final review before commit, 13 Nov 2026

Joel asked for one more visual and engineering pass before committing. Findings and changes:

| Area | Found in the recordings or tests | Change |
|---|---|---|
| Hero, phone | Any tap in the hero, including on "Join on Meetup", lit a stair that briefly sat over text | Taps light cells only on the open grid |
| Hero, all widths | The headline briefly shows a fallback font before Geist Mono loads (`display: swap`) | Not changed: it predates the motion work and is a font-loading decision |
| Events archive | The floating flyer preview covered row titles at 1280 to 1440 px and flashed an empty frame while loading | Removed (see `docs/MOTION_SYSTEM.md`, "Tried and removed") |
| Events, projects, agenda filters | View-transition swaps overlapped leaving rows with moved content; turning off the list's entrance during a transition replayed it afterwards | Reverted to the 11 Nov instant swap with one short rise; the replay pattern removed everywhere, including the photo viewer |
| Route transitions | A slow navigation's safety timer could end a later navigation's transition early | Each timer now ends only its own navigation |
| Technology board, 375 px | Checked tile by tile: all 8 tiles 168 by about 150 px, inside the screen; each tap selects, and brings the panel and its heading into view; the rail scrolls sideways (928 px of records in 343 px) and its last record can be reached and opened | No change needed; covered by a new test |
| Research stills | Contact sheets of the reference sites showed identifiable speakers and attendees, and other organisations' artwork | Moved out of `docs/` to the git-ignored `review/motion/research-stills/` |
| Tests | Dev-only styleguide checks were mixed into the shared flows, so the production run failed on them | `e2e/dev-only/` for pages that exist only under `next dev`; the production config runs `e2e/prod` plus the shared flows in `e2e/dev` |

New tests for interference with the browser:

- **Modified clicks:** Ctrl+click opens a new tab and leaves the page and its transitions alone.
- **Keyboard and in-page links:** a link opens with Enter, and the hero's `#explore-…` links still jump to and select their area.
- **Reduced motion:** a client-side navigation never starts a view transition, and Back works.
- **Phone board:** the board is fully usable at 375 px.

### Event caching: expected behaviour, not missing invalidation

The production failure looked like a stale event link. Investigated on 13 Nov 2026:

- **How public pages refresh.** They refresh on a 60-second timer (`revalidate = 60` in `src/app/(site)/layout.tsx`). That is Joel's decision W2 of 31 Oct 2026, recorded in `docs/ADMIN.md`, because Amplify Hosting does not support on-demand revalidation. Admin saves and deletes deliberately do not call `revalidatePath` on public routes. A change therefore reaches the archive and the event page on the first visit after the timer runs out.
- **The record in the failure** was `e2e-event-…`. The journey tests insert it with SQL as published and happening now, then delete it with SQL in cleanup. No application code could invalidate anything there. For up to a minute the cached archive still linked to it, its page answered 404, and Next loaded that 404 as a full page. Any link would do the same.
- **What was wrong was the test.** It clicked whatever row came first, which could belong to another test. A first fix skipped `e2e-` rows; Joel rejected that as possibly hiding a bug. The navigation tests now open one named, lasting record instead: `dev-intro-to-amazon-s3`, from `prisma/dev-fixtures.ts`.
- **The missing coverage, added.** Only create-and-publish had been tested. The new test `an event an admin unpublishes and then deletes leaves the public site within a refresh` (`e2e/dev/journeys.spec.ts`) works through the dashboard:
  1. Publish an event: its page renders and it appears in the archive.
  2. Unpublish it: it leaves the archive and its page answers 404 within a refresh.
  3. Delete it: the record is gone and the page stays 404.

### Final verification, 13 Nov 2026 (evening)

Memory: about 2 GB free throughout, with VS Code, Chrome, Brave, ChatGPT and Granola open; none of those were closed.

How it ran:

- one Next server, one Playwright worker, the local database;
- a memory check before each run;
- a watchdog that stops only this project's Playwright run below 0.6 GB free, with no automatic retries.

| Run | Result |
|---|---|
| Typecheck, ESLint | Pass |
| Copy rules | 0 errors; 8 warnings, all the launch event's real title |
| Unit tests | 214 passed |
| Production config (`playwright.prod.config.ts`): fresh build, `next start`, 128 tests | 109 passed, 18 skipped by design, 1 failed: the new regression test, whose `Save` selector also matched "Save gallery". Fixed to an exact match and rerun on a fresh build: passed. |
| Dev config, group 1: `e2e/dev-only`, `site.spec.ts` | 36 passed |
| Dev config, group 2: `motion.spec.ts`, `redesign.spec.ts` | 32 passed, 2 skipped by design |
| Dev config, group 3: `admin.spec.ts`, `boundaries.spec.ts` | Stopped by the watchdog twice (0.51 and 0.56 GB free) while `next dev` compiled admin routes. 31 tests completed with no failure reported. The 3 desktop boundary tests (suspension, refund, export and delete) did not run under `next dev`. |
| Dev config, group 4: `journeys.spec.ts` | Not run under `next dev`, because of memory. All of it passed on the production build. |

Intentional skips, all `test.skip` with a reason in the test:

- **18 in production:** journeys and boundaries that need one viewport only ("One run is enough"), the phone-only board test, and the desktop-only nav marker test.
- **2 in dev group 2:** the nav marker and phone board tests on the other viewport.

The Events page was recorded again on the final build: `review/motion/rec-final/events-1440.mp4` and `event-detail-1440.mp4`.
