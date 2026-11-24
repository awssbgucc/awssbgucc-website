# Motion system

How the public site, the Builder Portal and special event pages move, and why. Written 13 Nov 2026 from the reference study in `docs/research/MOTION_REFERENCE_AUDIT.md`.

- CSS lives in `src/styles/motion.css` (public), plus the portal block in `src/styles/globals.css`.
- Components live in `src/components/site/motion/`.

## Identity: built cell by cell

The official SBG kit is a hairline grid with solid cells stepping upward. Our motion treats that cell as the unit of everything: individual blocks connect and build into something bigger. Three ideas follow from it:

1. **Things are built, not faded.** Cells, blocks and traces appear in short `steps()` timings, the way a pixel grid fills. Only things that move from place to place (pages, photos, panels) use a smooth ease.
2. **The mint cell means "here and now".** One square carries that meaning everywhere:
   - the cursor after the hero headline;
   - the marker under the current page in the navigation;
   - the top step of the staircase (the next session);
   - the Cape Coast pixel on the map;
   - the live session in an event agenda;
   - the participation cell after a check-in.

   It is the thread that ties the page together. Updata does this with a 3D object (audit U4); we do it with one square.
3. **Motion only confirms something real.**
   - A trace runs to a session that happened.
   - A photo resolves into the people who were there.
   - A portal reward counts up only after the server has recorded it.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--dur-tap` | 120 ms | Press feedback |
| `--dur-hover` | 200 ms | Colour and border changes |
| `--dur-move` | 420 ms | Page and panel movement |
| `--dur-build` | 560 ms | A block building |
| `--dur-scene` | 900 ms | Whole-section entrances |
| `--ease-brand` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Anything moving place |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Anything leaving |
| `--build` | `steps(6, end)` | Anything being built |

## Hero concepts

All three were built in the hero slot with real content, on the dev-only page `/styleguide/motion`.

| | A. Connected builders | B. From Cape Coast | C. Real builders in motion |
|---|---|---|---|
| Idea | The technology board: area blocks wired to real sessions | The Ghana map assembles and Cape Coast lights, beside the list of sessions held there | Photographs resolve out of brand-coloured pixels, while the grid answers the pointer |
| Strength | Explains the breadth of the group | Strong sense of place | Real people first, and the brand literally becomes them |
| Weakness | Too much to read for a first screen; on phones it is a long list before any people | Says "where" but not "who". The map already closes the page, so it would appear twice. | Needs real photos (we have 13 approved) |
| Still frame | Works | Works | Works: the finished mosaic is the existing hero |
| Cost | Client component and measurement | SVG and CSS | CSS for the reveal, one small canvas |

**Chosen: C.** It keeps the successful 11 Nov hero composition and puts the community's own people at the centre. It also gives the brand a reason to move. A and B are not dropped. Each moved to the place where it carries meaning:

- **A** became the technology board in "What you can build here".
- **B** became the map assembly in the closing, "Come build with us".

So the home page tells one story: **who** (the hero), **what we have run** (the staircase), **what you can build** (the board) and **where** (the map).

## Signature effects

Each entry gives the purpose, trigger, timing, behaviour on desktop and phone, the reduced-motion fallback, cost and accessibility notes.

### S1. Pixel to picture (hero photographs)

- **Purpose:** the official SBG colours resolve into the real members. Brand and people become one image.
- **Trigger:** first paint. It is pure CSS, so it runs before JavaScript loads.
- **Timing:** each photo uses its cell's build delay (260 ms plus 85 ms per cell):
  - brand-colour cells until about 520 ms;
  - 8 cells across until about 760 ms;
  - 16 across until about 980 ms;
  - then the photograph.
  - Every change is a hard cut (`steps(1)`).
- **Desktop and phone:** the same on both. Phones show one photo.
- **Reduced motion, failed CSS or no animation support:** the pixel layers are `opacity: 0` by default and only an animation shows them, so the photo is shown at once.
- **Cost:**
  - three PNG data URLs of about 2 KB per photo, inlined (about 6 KB for the hero);
  - no requests, no JavaScript;
  - the files come from `scripts/pixel-previews.py`, which reads only the published derivatives;
  - the tiny upscaled images count as low-entropy, so Chrome does not treat them as LCP candidates.
- **Accessibility:** the layers are `aria-hidden`. The photograph keeps its alt text.

### S2. Build field (hero grid)

- **Purpose:** the visitor places blocks, joining in on the grid the site is built on.
- **Trigger:** pointer movement over the hero with a mouse or pen. On touch screens a tap lights a three-step stair.
- **Timing:** each lit cell steps down through 34%, 20% and 8% opacity over 900 ms. Colours cycle purple, blue, magenta, mint, the order of the official backgrounds.
- **Reduced motion:** off entirely.
- **Cost:**
  - one canvas sized to the hero, at most 2x device pixels;
  - it draws only while cells are lit and stops when the hero is off screen or the tab is hidden;
  - listeners are removed on unmount.
- **Accessibility:** decorative, `aria-hidden`, `pointer-events: none`. It answers input and never loops, so no pause control is needed (WCAG 2.2.2).

### S3. Mint cursor

- **Purpose:** the "here and now" cell, introduced at the first moment.
- **Timing:** 1.3 s after load it blinks three times (1060 ms per blink, hard steps), then stays on. It never loops.
- **Reduced motion:** a static mint block.

### S4. Staircase: progress climbing to now

- **Purpose:** the session timeline reads as progress, with each step completing in turn and the last one mint.
- **Trigger:** scroll-linked (`view-timeline`). Step *i* completes between 18% plus 7% times *i* and 24% plus 7% times *i* of the staircase crossing the screen.
- **Phone and tablet:** below 1024 px the staircase is a column of rows, so every event shows without sideways scrolling. Each step is a bar on the left that widens towards now, and its line runs down the edge beside the card.
- **Unsupported browsers and reduced motion:** every step is shown completed.
- **Cost:** the compositor only (a transform on a pseudo-element). No JavaScript.

### S5. Technology board

- **Purpose:** shows at a glance how far the group has got with each area:
  - solid block: covered;
  - half-filled block: on the calendar;
  - outlined block: announced;
  - dashed block: open.

  It also shows which real sessions and stories back each claim.
- **Trigger:** choosing an area (click, tap, arrow keys, or `#explore-<id>` in the address). The first routes draw when the board scrolls into view.
- **Timing:** routes draw in 10 steps over 620 ms. The selected block's fill widens in steps.
- **Phone:** blocks in two columns; the rail is a horizontal list. Traces are hidden and the connected records light up instead.
- **Reduced motion:** routes appear complete.
- **Cost:** route geometry is measured once per selection and on resize. Paths are keyed by selection, so resizing never replays the drawing.
- **Accessibility:**
  - a normal tab list (arrows, Home, End);
  - the panel and the rail state the same facts in text;
  - routes are `aria-hidden`;
  - areas with no records claim nothing.

### S6. Cape Coast assembly (closing map)

- **Purpose:** the place, built row by row.
- **Trigger:** the map entering view (`FadeOnView`).
- **Timing:** north to south over 900 ms. Rows slide in from alternating sides in four steps. Then the marker flashes and pulses three times, never more.
- **Reduced motion:** the finished map, with a static ring.

## Supporting transitions

| Effect | Purpose | Trigger and timing | Reduced motion | Notes |
|---|---|---|---|---|
| Route change | Moving between pages feels continuous | Internal public links run as view transitions. The old page fades in 160 ms, the new one rises 14 px over 420 ms, and the header stays put. | Plain navigation | `TransitionLink` wraps `next/link`: prefetching is unchanged and the click still ends in `router.push`. Back and forward stay instant. The old page stays frozen at most 1.6 s while the next route loads. |
| Card to page | An event, post or project card becomes its page | Elements marked `data-vt` inside the clicked card morph into `data-vt-dest` on the next page over 520 ms: the flyer or cover, and the date block. The title does not morph (two sizes of the same text overlapping read as a glitch in testing); it rises in with the page. | Plain navigation | Names are only given after the old page is captured, so they never clash |
| Into the portal | The click visibly registers while the server checks the session | The link fills in steps until the portal loads | No fill animation | No frozen transition here, because the wait can be long |
| Archive tabs and type filters | The list changes without fuss | Unchanged from 11 Nov: the new list rises in once over 360 ms | Instant | Search typing stays instant. See "Tried and removed". |
| Photo viewer | Photos open full screen from their thumbnail | View transition, 520 ms. Arrows and swipe step between photos. Without view transition support it opens at once. | Opens instantly | Native modal dialog: focus stays inside, Escape closes, focus returns to the thumbnail |
| Filmstrip | Every approved photo, in order, as one strip | It drifts sideways as the page scrolls past (`view-timeline`), on phones as well as desktops | A normal horizontal scroller | Focusing a photo stops the drift so it can scroll into view |
| Hero depth | The mosaic gains depth as it leaves | Photos drift up at three rates while the hero exits (scroll-linked) | None | 1024 px and wider only |
| Nav marker | Where you are, and where you are pointing | The mint cell slides to the hovered or focused link, then back to the current page (320 ms) | Jumps without sliding | Without JavaScript the static marker remains |
| Mobile menu | A sheet that builds | Existing stepped sheet, plus the current page's mint cell and the colour strip building in sequence | Opens at once | Focus trap and Escape unchanged |
| Footer | The stepped strip grows as the footer arrives | Scroll-linked | Static | |
| Project cards | The stack reads left to right on hover | Chips light in sequence, 60 ms apart | Instant | The empty state's numbered slots mark themselves in turn |
| Section entrances | Each kind enters its own way | Text rises once; images open with a stepped mask; lists step; the board draws; the staircase climbs | Everything visible | Nothing hides unless `motion-ready` is set by the observer |

### Tried and removed

- **View transitions for list filters** (events archive, projects, agenda rooms). Rows that leave were drawn at their old positions while the content below the list had already moved, so titles overlapped for a moment. In testing, cross-fading the page made it worse. With three or four events, sliding rows added little. The filters keep the 11 Nov behaviour: an instant swap with one short rise.
- **Pausing an entrance animation while a view transition runs.** Removing the pause when the transition ends replays the animation, so the list or viewer entered twice. No rule may switch an entrance off on `html[data-vt]`.
- **A floating flyer preview** beside the events archive, following the pointer, was built and recorded. At 1280 to 1440 px it could only sit over the row titles. It also duplicated the card-to-page morph, which already opens the full flyer. It was removed rather than re-wrap the archive layout.

## Event editions

Following Heapcon's pattern, special events share one skeleton and change only their theme. The configuration is in `src/lib/editions.ts`; the components are in `src/components/site/edition/`.

- **Theme:**
  - an accent and a second colour from the SBG palette;
  - a motif (the stairs are the default);
  - official artwork, only once it is supplied and cleared under COMPLIANCE.md.
- **Skeleton:**
  - hero and facts;
  - agenda;
  - speakers;
  - sponsors (only partners published as sponsors);
  - venue and questions;
  - past editions.
- **Empty sections render nothing.** Past editions stay empty until a real one exists. A `TODO(joel)` marks where to add it.
- **Agenda:**
  - a room filter appears only when there is more than one room;
  - on the day, the live session gets the mint cell and "Now", and finished ones dim;
  - the state is worked out in the browser each minute, so the page stays static;
  - without JavaScript the full agenda shows.
- **Gating:** Community Day remains behind `scdPageEnabled`. A new edition is a new entry in `EDITIONS` plus a gated route.
- **Preview:** the layout can be checked with labelled sample rows on `/styleguide/motion` (dev only).

## Builder Portal

Calmer than the public site. Every effect follows a state the server has already confirmed:

- **Check-in success:** after the server action returns, the participation cell builds in four steps and XP and credits count up over 700 ms. The status text carries the final numbers for screen readers.
- **Reward redemption:** the "Redeemed" stamp builds only after the action returns `ok`.
- **Progress bars:** they fill from the left on arrival.
- **Earned achievements:** they get a lime corner cell.
- **Onboarding steps:** each step fades up as it opens.
- **Admin:** no new motion in the admin dashboard.

## Technology choices

| Option | Decision | Why |
|---|---|---|
| CSS animations, transitions, `steps()` | Used for most effects | Zero JavaScript. They run before hydration and are stopped globally under reduced motion. |
| CSS scroll-driven animations (`view()`, named view timelines) | Used for the staircase, filmstrip, hero depth and footer | Run on the compositor and need no scroll listeners. Supported in Chrome, Edge and Safari 26. Elsewhere the static state shows. |
| View Transitions API | Used for routes, filters and the photo viewer | Native layout and shared-element morphs. Supported in Chrome, Edge, Safari 18 and Firefox 144. Without it, changes are instant. |
| Canvas 2D | Used for the build field only | Animates many small cells with no extra page elements. Runs only while active. |
| Web Animations API | Not needed | CSS covered every timeline |
| Motion for React | Not added | About 30 KB or more. View transitions cover the layout morphs. |
| GSAP and ScrollTrigger | Not added | Free licence, but about 40 KB or more for what native scroll timelines now do |
| Three.js or WebGL | Not added | No signature here needs real-time 3D. It would cost phones battery and data. |
| Smooth-scroll libraries | Not added | They replace native scrolling and the reference showed one ignoring reduced motion (audit G4) |

**No dependencies were added.**

## Appearance switching (17 Nov 2026)

- **Purpose:** choosing Light or Dark should feel like the page changing ink, not flashing.
- **Trigger:** a choice in the appearance selector, or the device switching while System is chosen.
- **Timing:** colour, background colour, border colour, fill and stroke ease linearly over 150ms. They ease only while `data-theme-switching` sits on `<html>` (200ms). Transforms, opacity and every existing animation are untouched. The first paint never animates, because the head script sets the theme before it.
- **Reduced motion:** the switch is instant.
- **Cost:** one attribute and a CSS rule; no JavaScript animation.
- **In both themes:** every effect above runs unchanged. On light, small mint marks (the nav marker, live dots, the board's traces and outlines) use deep mint, so they stay visible on paper. The blocks keep official Mint. See `docs/DESIGN.md`, Appearance.

## Rules for new motion

1. Content is in the server HTML and readable with no CSS animation and no JavaScript.
2. Every hiding rule sits behind `prefers-reduced-motion: no-preference`. `globals.css` also stops every animation under reduced motion.
3. Animate `transform`, `opacity` and `clip-path`. Never animate layout properties continuously.
4. Nothing loops more than three times, so no pause control is needed. No audio.
5. Only server-confirmed states get celebration.
6. Every listener, observer, timer and animation frame is cleaned up on unmount. Canvases stop off screen and in hidden tabs.
7. A new effect needs a row in this document: its purpose, trigger, timing, reduced-motion state and cost.
