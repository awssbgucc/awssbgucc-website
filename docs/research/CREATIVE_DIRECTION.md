# Creative direction, 11 Nov 2026

## What the references teach

Sources: the GEU audit in `docs/REFERENCE_AUDIT_GEU.md` (live inspection on 10 Nov, screenshots in `docs/research/geu/`), linear.app and the AWS Student Builder Groups programme page (fetched 11 Nov), and working knowledge of vercel.com and current Awwwards technology and conference sites. GEU's homepage renders on the client, so a plain fetch on 11 Nov returned only its title. The earlier live audit stands.

| Reference | What makes it work | What we take | What we leave |
|---|---|---|---|
| GEU (awssbggeu.com) | Volume of proof: event posters as covers, galleries filtered by event, stats chips, a large events archive, a portal that feels like part of the group | Events as the main proof of life; one page per event with its artwork; photographs grouped by occasion | The violet glow, floating AWS service icons around the headline, AWS orange as an accent, the rotating hero word, the 4 to 8 second portal splash, unverifiable stats and "authoritative" claims |
| Linear | Product mockups instead of illustrations; numbered, captioned figures ("Fig 0.1"); a very calm type scale; each section pairs a short claim with real evidence | Captioned "figures" for photos and flyers; one claim and one piece of evidence per section; restraint in colour | The "New" pill above a centred hero (banned in CLAUDE.md); logo walls |
| Vercel | Grid lines that are part of the layout, not decoration; monospace for technical facts; motion that follows the cursor or the content | Visible hairline grid as structure; mono for dates, venues and counts | Gradients and glow effects |
| Awwwards technology and event sites | Stepped image reveals, oversized type, horizontal timelines, interfaces that respond under the pointer | Masked image reveals in grid steps; a horizontal timeline; hover states that move one thing, not everything | Scroll-jacking, pinned sequences, WebGL, cursor followers, long loaders |
| Official SBG creative kit | Hairline grid on Grey 850; solid cells stepping upward like a staircase; chip icon next to the wordmark panel; pixel icons; the palette Purple, Mint, Blue, Magenta, Amber | The whole visual grammar, made specific to Cape Coast. See below | Amber (COMPLIANCE rule 10, no AWS orange accent); the standalone AWS logo in the backgrounds and template (rule 2) |

The common lesson: the best of these sites look ambitious because every block carries something real, such as a product screen, a poster or a dated record, and the visual system is strict enough to make that material look deliberate. GEU proves activity through sheer quantity. We have five months of history, so we have to prove it through care and specificity instead.

## Three directions

### A. Build grid (chosen)

The official SBG grid becomes the page itself. A hairline grid runs behind every section. Content sits in cells: photographs, flyers, dates and facts. Solid blocks in Purple, Mint, Blue and Magenta step upward across the page, each step standing for something real: a session held, a milestone, the next date. The Ghana pixel map is the same grid at a smaller scale, with Cape Coast as one lit cell. The official pixel icons mark subjects in the discipline explorer. Headlines are set in mono, like the wordmark.

- Originality: high. GEU uses glow and floating icons; nobody else builds the page on the official cell system, and the Cape Coast pixel joins the brand grid to a place.
- Brand fit: the strongest of the three. It uses the official wordmark, chip, icons, palette and grid as designed.
- Real content: it needs few assets to look complete, because empty cells are part of the system. Photos and flyers drop into cells at their own ratios.
- Responsiveness: the grid becomes 4 columns on phones and 12 on desktop, with cells defined in CSS, so nothing is redrawn.
- Performance: CSS gradients for the grid, inline SVG for icons and map, no library.
- Risk: it could read as a spreadsheet. The answer is large photography, generous gutters, and steps used only where they carry meaning.

### B. Field notes

A photojournal: full-bleed photographs, captions in a journal voice, dates down the margin, flyers pinned like documents. The pacing would come from long scrolls of photos between short essays.

- Strong on people, which is what the site most needs to show.
- Weak on brand: the official kit has no editorial or photojournal language, and the site would look like any student magazine.
- Fragile: it leans on 24 photos from two sessions, so it would repeat itself quickly, and it collapses if photo consent changes.

### C. Signal from the coast

The Ghana map as the main stage: Cape Coast pulsing, lines reaching out to the wider world, coordinates and latency-style labels, with the interface built as a network diagram.

- Memorable at first sight, and it uses the map we already have.
- Leans towards the generic "futuristic tech dashboard" the brief rules out, and towards claims of reach we cannot show.
- Heavy motion by nature, and the map's shape forces a tall hero on phones.

### Comparison

| | A. Build grid | B. Field notes | C. Signal |
|---|---|---|---|
| Originality | High | Medium | Medium |
| Visual quality with our real assets | High | High in places, repetitive | Medium |
| Responsiveness | High | High | Low on phones |
| Brand compatibility | Uses the official system | Ignores it | Partial |
| Performance | Light | Image-heavy | Motion-heavy |
| Fits real, modest content | Yes, empty cells look intended | Needs many photos | Implies reach we cannot show |

A wins. It also takes the best of B (photography as the main evidence, real captions) and keeps C's Cape Coast pixel as the one point where place and grid meet.

## The system in practice

- **Concept line:** a campus of builders. Cape Coast is the cell where we meet; what members build reaches further.
- **Surfaces:** Grey 850 (#161D26), the official background, so the official wordmark sits on it exactly as supplied. Cards one step lighter. A 1px grid at 7% white, with cells of 64px on desktop and 48px on phones.
- **Blocks:** official Purple, Mint, Blue and Magenta, with Grey 850 text on them. Each colour has one meaning across the public site, portal and admin: Mint means now or next (the live session, the Cape Coast cell, check-in open). Purple is the programme identity (chip, bootcamp). Blue means learning material and talks. Magenta means build sessions and projects. Amber is not used.
- **Type:** Geist Mono for headings and facts, echoing the mono wordmark; Geist for reading. Amazon Ember stays out because its EULA does not grant web redistribution.
- **Logo:** chip in Purple plus the white wordmark, with "University of Cape Coast" in mono beneath, following the handbook's campus lockup description.
- **Motion:**
  - Cells fill in short steps, as if being built: the hero mosaic and the timeline staircase.
  - Images reveal through a stepped mask, not a fade.
  - Headline lines rise once on load.
  - The discipline explorer and event filters cross-fade their content.
  - The Ghana map keeps its row fade and the single Cape Coast pulse.
  - The mobile menu opens as cells stacking from the top.
  - Everything is CSS plus one small IntersectionObserver helper. Under reduced motion, everything appears already finished.
- **Photography:** large, in cells at the photo's own ratio, with a mono caption that says what is known: "Zero to Cloud Practitioner bootcamp. Sat 31 Oct 2026." Photos that show the same scene are never used twice.
- **Flyers:** shown whole, at their own ratio, on event pages and the next-session feature. In lists, a cropped detail (the speaker, the headline) sits beside the event's details in HTML, so the flyer is never the only place the facts appear.

## How this differs from GEU

| GEU | UCC |
|---|---|
| Violet glow, floating AWS service icons | Flat Grey 850, the official cell grid, no glow |
| Uses AWS orange | Uses no orange at all |
| Plus Jakarta Sans throughout | Mono headings echoing the official wordmark |
| Stats chips everywhere | Counts appear only when real and entered by an admin |
| Poster cards as covers | Flyers whole on event pages, cropped details in lists, facts always in HTML |
| Splash loader in the portal | No loader; the portal shares the grid and wordmark |
| Identity from volume | Identity from place: Cape Coast as the lit cell, LT5, the Science Annex, real Saturday photos |
