# Motion reference audit

13 Nov 2026. Three references studied in motion, to find principles for the UCC site. We did not copy any artwork, colours, code or copy.

## How this was done

- **Browser.** Chromium 1248 through Playwright, headed so WebGL ran on the laptop GPU, with JavaScript on. Software rendering made Updata's WebGL scene unusable, so headless runs were dropped.
- **Passes per page.** Each page was recorded three times:
  - desktop at 1440 by 900, with a pointer sweep across the hero, wheel scrolling in steps and hovers at mid-screen;
  - phone at 390 by 844, touch emulated, scrolling, then opening the menu;
  - desktop with `prefers-reduced-motion: reduce` emulated.
- **Updata.** It changes section on each wheel gesture instead of scrolling, so it got a fourth pass: 14 wheel gestures, with a screenshot mid-change and after each one.
- **Captured.** Timed frames at 0.4, 0.9, 1.6, 2.6, 4.2 and 6.5 s after navigation, scroll frames, a page probe and a webm of every pass. The probe recorded which libraries were present, the canvas and video counts, the generator and the number of reduced-motion CSS rules.
- **Where the files are.** Recordings are in `review/motion/research/` (git-ignored, about 250 MB). Contact sheets are in `review/motion/research-stills/`. They stay local, with the recordings, because they show other organisations' artwork and identifiable speakers and attendees.
- **Observed and inferred.** "Observed" means we saw the change happen in the recordings. "Inferred" means we deduced it from still frames or page structure. We did not read or reverse-engineer anyone's source code beyond the probe.

### Limits

- **Updata, phone menu.** The menu button was not visible on the phone, so the phone menu was not opened.
- **Updata, sound toggle.** The sound toggle was not pressed. We avoid audio regardless.
- **Heapcon 2026.** It was recorded after the event had ended, so the closing banner covered the bottom of the screen in most frames.
- **Real phones.** None were used. Phone behaviour is Chromium device emulation, not iOS Safari.
- **Smooth-scroll feel.** Scroll was driven by wheel events. We could not judge the feel of smooth-scroll libraries by hand.

## Reference A: Updata One (updata.one)

Probe: WordPress 7.1.4, one WebGL canvas, no global GSAP or Three.js (bundled in `libs.js` and `app.js`), 0 reduced-motion rules. Page height is fixed at the viewport. Stills (in `review/motion/research-stills/`): `updata-load.jpg`, `updata-sections.jpg`, `updata-reduced.jpg`.

| # | What happens | Observed or inferred |
|---|---|---|
| U1 | Loader: a gradient sphere with a row of dots. The wordmark rises inside it. About 4 s later it bursts into a spiky 3D form behind the headline "We Make Sense of Information". | Observed (0.4 to 6.5 s frames) |
| U2 | The spiky form reacts to the pointer: the spikes lengthen and shift as it passes. | Observed (pointer frame against load frame) |
| U3 | A second depth layer: faint words drift behind the form, some in hairline boxes ("country", "court", "foreign"). | Observed |
| U4 | **One object, many states.** Each wheel gesture changes the same 3D object, never cutting to a new picture:<br>- the camera dives into its surface for About;<br>- it becomes a smooth sphere ringed by word labels, with a "Switch data" toggle;<br>- a wireframe torus with a glowing core and counts;<br>- a sphere inside an orbit ring;<br>- a blob with pinned news labels;<br>- finally a field of shards behind the manifesto. | Observed (section pass) |
| U5 | The page cannot scroll. The wheel moves between sections, so the browser's own scrolling is replaced. | Observed (scrollY stayed 0, page height 900) |
| U6 | A fixed bottom bar: a status line ("providing real data"), a mouse icon that changes from "Discover more" to "Scroll up", and a sound toggle. | Observed |
| U7 | The menu is a full black sheet, a plain list with hairline rules and a "Back to home" label. | Observed (desktop) |
| U8 | Under reduced motion, the loader sphere was still the only thing on screen when the recording ended, about 9 s in. The headline never appeared in that pass. | Observed |

## Reference B: Heapcon (heapcon.io and five editions)

Probe: Astro 7.4.4 for 2026 and 2025. Hugo 0.96 for the 2022 archive. No animation library globals. One canvas on 2026 and 2025, none on 2022. 0 reduced-motion rules on every edition. Stills (in `review/motion/research-stills/`): `heapcon-2022.jpg` to `heapcon-2026.jpg`, `heapcon-2024-hero-frames.jpg`, `heapcon-2026-pointer.jpg`, `heapcon-2026-menu-phone.jpg`.

### The editions have different identities

| Edition | Identity | Signature motion | Observed or inferred |
|---|---|---|---|
| 2026 (home) | Pale grey and lime. A giant word "intelligence" sits under the hero. A dot row like braille runs along the top. Stats in dot-matrix numerals. Inkblot artwork in the footer. | A statue appears only where the pointer, or a touch on phones, has moved. Before that the hero is a plain grey field. | Observed (blank in load frames, statue after the sweep) |
| 2025 | Charcoal with a hairline grid and lime. The three stats sit as blocks stepped at different heights. Heat-map gradients behind tickets and footer. | Mostly static. Sections fade in as they arrive. | Observed static hero; fade inferred from mid-scroll frames |
| 2024 | A yellow, teal and blue gradient. A white spiral covered in pixel tiles with game-like numbers. A marquee in an outlined pixel font. Cards drawn as desktop windows ("heapcon_duration.dat"). An ASCII heart in the footer. | The tiles on the spiral flip and change continuously. The marquee runs. | Observed (2 fps frames) |
| 2023 | Cream, blue and magenta. An organic blob filled with "THINK BEYOND TECH" lettering. Huge condensed numerals. Demographics as circles. | The blob is not in the hero at load. It appears on scroll, then reappears in new places as you move down, beside the stats, behind speakers and over tickets. | Observed (positions differ across scroll frames) |
| 2022 | White, teal and blue. Diagonal yellow and black barrier tapes printed with "TECH UNITES" and the dates. "Sold out" stamps on tickets. | The tapes looked static in the first 10 s. Section bands use the same tape. | Observed static; any marquee not seen |

### The structure stays the same

Every edition has the same skeleton:

- hero with date and venue;
- three stats (days, speakers, attendees);
- speakers, which link to talk detail;
- agenda;
- tickets;
- aftermovie;
- newsletter;
- a footer with the heart mark.

Past editions stay live at `/2025`, `/2024` and so on. On 2026 a "Past Heapcons" link lists them, and the phone menu has a row of years under the main links.

### Other patterns

| # | What happens | Observed or inferred |
|---|---|---|
| H1 | Phone menu: a lime sheet drops from the top over part of the page. It holds large sans links with hairline rules, then "Past conferences" as a row of years. Opening was instant in the recording. | Observed |
| H2 | Speaker cards: greyscale portraits tinted with the edition colour. 2025 adds a corner arrow tile. | Observed |
| H3 | Section labels in code style: `_speakers`, `<event_stats>`, `[ tickets ]`. The style changes per edition. | Observed |

## Reference C: AWS SBG GEU (awssbggeu.com)

Probe: a Vite single-page app (`index-*.js`), Lenis smooth scrolling on desktop (it stays on under reduced motion), no canvas, and one testimonial video that does not autoplay. Three reduced-motion rules. Earlier still captures are in `docs/research/geu/` and `docs/REFERENCE_AUDIT_GEU.md`. New stills, local only: `geu-desktop.jpg`, `geu-first-paint.jpg`.

| # | What happens | Observed or inferred |
|---|---|---|
| G1 | The screen is white for about 5.5 s after navigation. Then the hero renders, because the content waits for the JavaScript bundle. | Observed (2 fps frames) |
| G2 | The headline swaps one word in a tinted box ("BUILD", "SHIP") every couple of seconds. | Observed |
| G3 | Small square icons float at the hero edges. | Observed |
| G4 | Smooth scroll with inertia on desktop, still active with reduced motion emulated. | Observed (probe: `lenis` present in both passes) |
| G5 | Sections fade up as they arrive. The Community Day 2026 block brings in its banner, then its facts and a photo grid. | Observed |
| G6 | A Community Day feature with the official banner, facts, an "Explore recap" call to action and a gallery strip. It links the event to its photos. | Observed |
| G7 | The "Builder Portal" button sits in the hero beside "Join Community", so the portal is one click from the front page. | Observed |

## Patterns worth using

**Fit** means whether the pattern suits a student community in Cape Coast whose identity is the official SBG grid, its blocks and the pixel map.

### P1. One visual thread through the story

- **From:** Updata U4, Heapcon 2023's travelling blob.
- **Why it works:** the visitor follows one object, so the page reads as one story instead of a stack of sections.
- **Fit:** strong, if the thread already means something. Ours is the mint cell. It already marks Cape Coast on the map, the current page in the navigation and the next session in the timeline.
- **Our version:** the mint cell recurs as "here and now":
  - the block cursor at the end of the hero headline;
  - the cell that climbs the staircase to the next session;
  - the Cape Coast pixel in the closing;
  - the marker that slides under the navigation.
- **Cost:** CSS only. Every piece is static and meaningful without motion.

### P2. Pointer response that builds instead of decorating

- **From:** Updata U2, Heapcon 2026's pointer reveal.
- **Why it works:** the page answers the visitor, and the answer is part of the art.
- **Fit:** good, if it uses our grid instead of a particle cloud.
- **Our version:** the hero's hairline grid lights cells under the pointer in the programme colours, which step back out. A tap lights a three-step stair.
- **Cost:** one canvas that draws only while cells are lit and stops off screen. It is not shown on touch-only screens unless tapped, and not at all under reduced motion.

### P3. Real content resolving out of the identity

- **From:** Heapcon 2026's reveal and 2024's pixel tiles.
- **Why it works:** the brand and the content become one picture.
- **Fit:** very strong. The official kit is a grid of solid cells, and we have real photographs.
- **Our version:** **pixel to picture.** Each hero photo starts as a few cells in the official SBG colours, then sharpens through two coarse grids of its own colours into the photograph.
- **Cost:** about 2 KB of inline data per photo and pure CSS, so it plays before JavaScript loads.
- **Accessibility:** the layers hide by default, so reduced motion and failed CSS animations show the photo at once.

### P4. Event editions with their own identity on a shared skeleton

- **From:** Heapcon B.
- **Why it works:** each year feels like its own event, while visitors still know where everything is.
- **Fit:** strong for Student Community Day, hackathons and major programmes.
- **Our version:** an edition theme, made of an accent pair, a motif and the hero artwork, applied to fixed sections:
  - hero and facts;
  - agenda with track and time controls;
  - speakers;
  - venue;
  - photos;
  - sponsors, only where authorised;
  - past editions, only when real ones exist.
- **Cost:** no new routes per edition and no separate app.

### P5. Section entrances that differ by job

- **From:** GEU G5 (the same fade on every section, which is what we avoid) and Heapcon 2023 (each section enters its own way).
- **Fit:** strong. The brief asks for each kind of content to enter differently.
- **Our version:**
  - photos open with a stepped mask;
  - the timeline climbs;
  - the board draws traces;
  - text rises once;
  - nothing staggers just because it can.

### P6. A menu that stays a list

- **From:** Updata U7, Heapcon H1.
- **Why it works:** both make the menu big type with hairline rules, and readable at once.
- **Fit:** already ours. We keep the stepped sheet and add the mint "you are here" cell and the stepped strip.
- **Cost:** CSS only.

### P7. A word that changes in the headline

- **From:** GEU G2.
- **Fit:** weak. A looping swap is motion without information. It needs a pause control, and it reads as a template.
- **Decision:** not used. Our headline gets one cursor block that blinks three times and stops.

### P8. Archive of editions in the menu

- **From:** Heapcon H1.
- **Fit:** good once real past editions exist.
- **Decision:** the edition model supports a past-editions list. It renders nothing until there is a real past edition.

## What we avoid, and why

| Seen in | Pattern | Why not |
|---|---|---|
| Updata U5 | Replacing the browser's scrolling | It breaks keyboard, screen reader, find-in-page and touch expectations. The brief rules out scroll hijacking. |
| Updata U8 | Content behind a loader | With reduced motion the headline never arrived. Our content is in the HTML and readable without any animation. |
| GEU G1 | Client-rendered first paint | Several blank seconds on a fast desktop. Ours stays server-rendered. Motion is layered on top. |
| GEU G4 | Smooth-scroll library | It ignores reduced motion and adds weight. Native scrolling stays. |
| Heapcon 2024, GEU G2 | Endless loops (flipping tiles, rotating words) | They need a pause control under WCAG 2.2.2, and they cost battery on phones. Our only loop is the Cape Coast pulse, which stops after three cycles. |
| Updata U6 | Sound toggle | No audio, ever. |
| All three | 0 to 3 reduced-motion rules | Every effect of ours has a reduced-motion state, written down in docs/MOTION_SYSTEM.md. |

## Takeaways for UCC

1. The signature should come from our own material: the official grid, the programme colours, the pixel map and real photographs. Generic data-viz shapes are out.
2. One thread, the mint cell, ties the page together. Updata does this with a 3D object. We do it with a single square.
3. Motion confirms meaning:
   - a cell lights where something happened;
   - a trace runs to a real session;
   - a photo resolves into the people in it.
4. Special events borrow Heapcon's structure: one skeleton with a per-edition theme, and past editions shown only when they exist.
5. Every effect must be readable as a still and survive reduced motion and failed JavaScript. None of the three references fully does this, and our audience is on phones and mobile data.
