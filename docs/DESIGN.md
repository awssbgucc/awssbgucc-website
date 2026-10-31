# Design system

References: the AWS Student Builder Group at Georgia Tech site (awssbggatech.com) for structure and restraint, and AWS Builder Center for tone. We take their discipline, not their assets. Read `docs/COMPLIANCE.md` before changing anything here.

## Principles

1. **One idea per section.** A headline, one supporting paragraph, one action. If a section needs two ideas, it is two sections.
2. **Color means something.** Accents mark roles, tags, the live state and the Cape Coast pixel. Everything else is slate and white.
3. **Real or nothing.** Real photos of our people and our sessions. No stock images, no illustrations of people, no placeholder avatars. An empty slot shows an honest "Open role" card, not a fake person.
4. **Built, not generated.** Hard edges, a visible grid, monospace headings. It should feel like a terminal that learnt good manners.

## Tokens

Put these in `src/styles/globals.css` inside Tailwind's `@theme` block. Components reference tokens only, never raw hex.

```css
@theme {
  /* Surfaces */
  --color-bg: #161d26;
  --color-bg-alt: #1a222d;
  --color-card: #1d2630;
  --color-card-raised: #232e3c;
  --color-border: rgb(255 255 255 / 0.07);
  --color-border-strong: rgb(255 255 255 / 0.14);

  /* Text */
  --color-text: #e8ecf2;
  --color-text-muted: #9aa5b4;
  --color-text-faint: #6b7685;

  /* Accents */
  --color-purple: #b460ef;
  --color-lavender: #c4b5fd;
  --color-sky: #8ab8f8;
  --color-cyan: #38d9f5;
  --color-lime: #b8ff3e;

  /* Type */
  --font-display: var(--font-mono-face), ui-monospace, monospace;
  --font-sans: var(--font-sans-face), system-ui, sans-serif;

  /* Radius: small, consistent */
  --radius-sm: 4px;
  --radius-md: 8px;
}
```

The accent values follow the AWS Student Builder Groups visual identity as seen on other groups' sites. **TODO(joel):** confirm the exact hex values against the brand kit in the Leader's Library on Box, and replace them here if they differ. The rest of the system does not change.

### Gradient

One gradient, used in one place: the second line of the hero headline. The pixel map has its own fill, described in its section.

```css
--grad-brand: linear-gradient(90deg, var(--color-purple) 0%, var(--color-sky) 55%, var(--color-cyan) 100%);
```

Never on buttons, cards, borders or body text.

### Accent assignments

| Use | Token |
|---|---|
| Group Leader role label | `--color-purple` |
| Technical roles | `--color-cyan` |
| Events and operations roles | `--color-lime` |
| Community and marketing roles | `--color-lavender` |
| Tag: Bootcamp | `--color-purple` |
| Tag: Build session | `--color-cyan` |
| Tag: Talk | `--color-lavender` |
| Tag: Networking | `--color-lime` |
| Tag: Community Day | `--color-sky` |
| Cape Coast pixel, "Live now" dot | `--color-lime` |
| Focus ring | `--color-cyan` at 2px, 2px offset |

## Typography

| Role | Family | Size (mobile / desktop) | Weight | Notes |
|---|---|---|---|---|
| Hero headline | display | 44 / 80px | 500 | Two lines, tight tracking (-0.02em) |
| Section headline | display | 28 / 44px | 500 | |
| Eyebrow | sans | 12px | 600 | Uppercase, 0.12em tracking, `--color-text-muted` |
| Card title | sans | 18px | 600 | |
| Body | sans | 16 / 17px | 400 | Line height 1.6, max width 62ch |
| Small and meta | sans | 14px | 500 | `--color-text-muted` |
| Code and data | display | 14px | 400 | |

### Font faces

Order of preference:

1. **Amazon Ember Display and Amazon Ember Mono**, self-hosted from the files in the Leader's Library on Box. The SCD Playbook states the program's logos and fonts are provided there and that the primary font is Amazon Ember. Use only the files from Box, never a download from a font site. **TODO(joel):** check the Box folder for licence or usage notes on web embedding. If they allow it, load with `next/font/local`.
2. **Fallback if Ember is not cleared for web:** Geist Mono for display and Geist for body, via `next/font/google`. Both are SIL Open Font Licence.

Either way the faces are exposed as `--font-mono-face` and `--font-sans-face`, so switching is a one-line change.

## Layout

- Container: max 1200px, 24px side padding on mobile, 40px on desktop.
- Section rhythm: 96px vertical padding on desktop, 64px on mobile. Alternate `--color-bg` and `--color-bg-alt` between sections.
- Background grid: a faint 32px square grid (`--color-border` lines) behind the hero only. It ties into the pixel map.
- Breakpoints: design at 375px first, then 768px and 1280px. No horizontal scroll at any width.
- Mobile matters most. Most of our members will open the site from a WhatsApp link on a phone.

## Components

### Navigation

- Sticky, `--color-bg` at 85% opacity with a 1px bottom border. Logo lockup on the left: the SBG logo plus "University of Cape Coast" set underneath, as the program's branding guidance asks.
- Links: About, Events, Team, Partners, Blog. "Community Day" appears only when the SCD page is switched on.
- Right side: a solid white "Join on Meetup" button, plus an outlined "WhatsApp" button.
- Mobile: a full-height sheet with the same links stacked, buttons at the bottom.

### Buttons

| Variant | Look | Use |
|---|---|---|
| Primary | White fill, `--color-bg` text, 4px radius, arrow icon right | One per section, the main action |
| Secondary | Transparent, 1px `--color-border-strong`, white text | Second action |
| Text | Underline on hover, `--color-text-muted` | Inline links |

Height 44px minimum (touch target). Hover: primary goes to 90% white; secondary border goes to `--color-text-muted`. No glows, no scale, no gradient.

### Tag pill

Rounded full, 12px text, 1px border in the tag's accent at 40% opacity, text in the accent, background at 8% opacity. Optional 12px icon on the left.

### Event card

`--color-card`, 1px border, 8px radius, 24px padding. Top row: tag pill and date in small meta text. Then title, two-line summary, and a meta line (venue or "Online", time). Past events show attendance ("41 attended") when it is recorded. Hover: border goes to `--color-border-strong`. Nothing else moves.

### Team card

Square photo (1:1, `object-cover`, 8px radius, greyscale at 15% that clears on hover), then the role label in its accent color, name in white, programme and level in muted text. An unfilled role renders as a dashed-border card with a plus icon, the role name and "Open role".

### Stat block

Large display-font number, small muted label under it. Used in a row of three or four on the home page. Only real numbers; if a value is missing, the block does not render.

### Partner logo

Logos sit in a row on `--color-card` tiles, rendered in white at 70% opacity, full color on hover. Each links to the partner. Uploads are normalised to SVG or transparent PNG.

## The pixel map (signature element)

A pixel rendering of Ghana with Cape Coast lit up. The grid is pre-generated in `assets/pixel-map/ghana.json` (24 columns by 35 rows, `#` for land, `.` for empty). `capeCoast` gives the lit cell. Regenerate with `scripts/generate-pixel-map.mjs` if the density changes. `assets/pixel-map/ghana-preview.png` shows the raw output.

### Rendering

- An inline SVG component `<PixelMap />`, server-rendered from the JSON. No canvas, no client JS needed for the static state.
- Each land cell is a square with a 2px gap. Cell size is set by the container width.
- Fill: interpolate per row from `--color-purple` in the north, through `--color-lavender`, to `--color-sky` on the coast. **Not cyan.** Cyan sits too close to lime, and the coast is exactly where the lime marker lives, so the marker disappears against it. There must be no visible banding between rows.
- Land cells render at 70% opacity. Texture: roughly 1 in 9 land cells at 50%, chosen by a fixed seeded hash of the row and column, so it looks the same on every load and on server and client.
- `assets/pixel-map/ghana-preview.png` and `ghana-preview-small.png` show the target look at desktop and mobile size. Match them.

### Cape Coast marker

The marker must be obvious at a glance on a phone. It is built from pixels, not blur, so it stays crisp and fits the style.

1. **The cell:** `--color-lime` at full opacity.
2. **Halo:** the 8 neighbouring cells, land cells only, drawn in `--color-lime` at 40% instead of their gradient colour. Never draw halo cells over the sea.
3. **Pulse ring:** a 2px `--color-lime` square outline centred on the cell. It grows from the 3 by 3 block to the 5 by 5 block while fading from 70% to 0, over 1.8s, repeating every 3s.
4. **Leader line and label:** a 2px lime line from the ring's right edge, out past the map's right edge, to a label in the display font. Line 1 `CAPE COAST` in lime, bold. Line 2 `5.10 N  1.25 W` in `--color-text-muted`. On screens under 480px wide, the label sits under the map, centred, and the leader line is dropped.

### Motion

- On first view, cells fade in row by row from north to south over about 900ms. Then the marker cell flashes once and the pulse ring starts.
- Under `prefers-reduced-motion: reduce`: no fade-in and no pulse. The ring shows static at its 5 by 5 size, 70% opacity.

### Placement

- Hero only: right column on desktop, below the buttons on mobile at 80% width.

## Pixel art: UCC crest and SBG chip

Two more grids share the same renderer (`<PixelGrid />`, the general version of `<PixelMap />`). Both JSON files have a `palette` map from cell letter to colour, and a `grid` of strings.

| Asset | File | Size | Colours |
|---|---|---|---|
| UCC crest | `assets/pixel-art/ucc-crest.json` | 37 by 44 | The crest's own red, blue, yellow and white. Never recolour it into the site palette. |
| SBG chip | `assets/pixel-art/sbg-chip.json` | 9 by 9 | The logo's purple only |

Previews: `ucc-crest-preview.png` and `sbg-chip-preview.png` in the same folder.

### UCC crest

- Placement: the About section, beside the copy, at roughly 240px wide on desktop and 160px on mobile. Caption under it in small muted text: `University of Cape Coast`.
- Motion: cells fade in top to bottom once on first view, like the map. Nothing loops.
- Alt text: "University of Cape Coast crest in pixel art".
- **Gate:** render it only when the `uccCrestApproved` setting is on, which defaults to off. Until then, About shows the copy alone. See `docs/COMPLIANCE.md`.

### SBG chip

- This grid is a cell-for-cell trace of the official logo, which is already pixel art. It is a decorative motif, not a replacement for the logo. The nav and footer lockups still use the official file from Box.
- Placement: the 404 page (large, centred, with `Page not found` under it) and the admin sign-in screen. Nowhere else, so it stays special.
- Rendered static, in the logo purple, at its exact shape and proportions, with the same 2px gap as the other grids. Never recoloured, animated, stretched, or combined with other shapes.

### Later additions (not in v1)

- A pixel take on a UCC landmark, such as the Sam Jonah Library. Generate it with `scripts/pixelate-image.py` from a photo the group owns, then hand-tidy the grid.

## Motion in general

- Durations: 150ms for hover states, 250ms for reveals.
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Section content may fade up 8px once on first view. No parallax, no scroll-jacking, no marquee text.
- Everything respects `prefers-reduced-motion`.

## Accessibility

- Text contrast at least 4.5:1 against its background. Muted text on `--color-card` must still pass. Check it.
- Every interactive element is reachable by keyboard and shows the cyan focus ring.
- Every pixel grid has `role="img"` and an `aria-label`. The map's label is "Map of Ghana with Cape Coast highlighted".
- Team photos have alt text with the person's name and role.
- Respect `prefers-reduced-motion` everywhere.

## Admin dashboard look

The dashboard uses the same tokens but no signature elements. It is a work tool:

- Left sidebar navigation, content area on `--color-bg-alt`.
- Tables for lists, with status pills (Draft in muted, Published in lime).
- Forms in a single column, 640px max width, labels above fields, help text under them.
- Destructive actions are red text buttons (`#f87171`) behind a confirm step built in the page, never a browser `confirm()` dialog.
