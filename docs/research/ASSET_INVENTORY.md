# Asset inventory, 11 Nov 2026

Covers the official creative ZIP, `Event-banners/` and `IMG/`. Originals are untouched. Web copies are made by `python scripts/prepare-media.py` from `content/media-manifest.json`, re-encoded from pixels so no EXIF, GPS or XMP data survives (checked by `src/lib/content/sources.test.ts`). Contact sheets are in `review/redesign2/` (git-ignored): `brand-icons-contact.jpg`, `pptx-media-contact.jpg`, `icon-shapes.png`, `photos-a.jpg`. The earlier sheets in `review/redesign/` cover all 24 photos and all 5 flyers.

Joel confirmed permission to use the SBG creative assets in chat on 11 Nov 2026, subject to the brand rules. Photo publication permission was confirmed on 10 Nov 2026.

## 1. Official creative ZIP

341 entries, extracted to `review/redesign/brand-kit/` with path checks. There is no written guideline, licence or README in the archive.

### Palette, read from the SVG fills

| Name | Hex | Use on our site |
|---|---|---|
| Grey 850 | #161D26 | The site background, unchanged since Phase 1. The official wordmark panels use the same colour, so the mark sits on the page exactly as designed |
| Purple | #AD5CFF | Programme identity: chip, bootcamp, page accents. Text on the page background only (4.65:1); never small text on cards (4.19:1) |
| Mint | #00E582 | Now and next: the next-session block, the Cape Coast cell, the current page, check-in. Replaces the old lime token |
| Blue | #42B4FF | Talks and learning material |
| Magenta | #FF57E9 | Build sessions and projects |
| Amber | #FF9900 | Not used. COMPLIANCE rule 10 bars the AWS orange accent. See conflicts |
| White | #FFFFFF | Text, primary button |

On blocks, text is Grey 850, as on the official brandmark panels: 10.1:1 on Mint, 7.4:1 on Blue, 6.3:1 on Magenta, 4.65:1 on Purple.

### Files, and where each is used

| Asset | What it is | Decision | Where used |
|---|---|---|---|
| Brandmark SVG, file named Mint (also Magenta) | "AWS Student Builder Group" set in Ember Mono outlines, white on a Grey 850 panel, 3000 x 750 | Used. The panel rectangle is dropped and the view box trimmed to the lettering plus clear space of half the letter height. The letter outlines are copied byte for byte. The virtual backgrounds show the same wordmark at a tighter ratio inside its panel, so the panel padding is not fixed clear space | `public/brand/sbg-wordmark-white.svg`: header, footer, mobile menu, portal rail, admin rail, member sign-in |
| Brandmark SVGs and PNGs in other colours | Same mark, coloured panels with dark text | Not used. A coloured panel would read as a button in our layout | |
| Brandmark PDF | Same mark | Not used | |
| Programme icon (chip) SVG, six colours | The crenellated chip | Used in Purple (`sbg-chip-purple.svg`); Mint, Blue and Magenta copies kept for later | Header lockup, hero grid, footer, 404, admin sign-in, About |
| Additional icons, 11 shapes in 7 colours | Pixel icons: bolt, clock, single and double bracket smile, drop, key, ladder, speaker, teams, trophy, wrench | Used. Every shape ships in every palette colour, so each is stored once as a cell grid (`assets/pixel-art/sbg-icons.json`, traced on the kit's 430 px cell) and drawn in one of the official colours. That picks a supplied variant; it is not a recolour | Discipline explorer, staircase and archive rows (events without a flyer), closing "ways in" |
| Virtual backgrounds, Amber and Purple | Hairline grid on Grey 850, solid cells stepping upward, chip beside a wordmark panel, standalone AWS logo bottom left | Not used as files (standalone AWS logo, Amber). Their grammar is the basis of the whole design: see CREATIVE_DIRECTION.md | |
| Slide template (22 slides, 40 SVGs) | Grid corners, corner squares in accent colours, pixel icons in grid cells, chip, a checker mosaic of Amber, Purple and Magenta, AWS logo | Not used as files. Confirms the same grid system | |
| Amazon Ember Display, Mono, Duospace (14 TTF) | Embedded name tables carry a Dalton Maag copyright, a no-modification clause and an EULA link | Not used. Nothing in the archive grants web redistribution. Geist and Geist Mono (SIL OFL) remain | |
| `Brandmarks/Alternate (Without AWS)/P-IMG-20231231-WA0025(1).jpg` | A personal photograph, misfiled | Not used | |

Several file names do not match their contents. For example, `Program Icon_White.svg` is Purple, and `Icons_Trophy_Mint.png` is a wrench. Every decision above was made by looking at the artwork, not the file name.

### Conflicts with COMPLIANCE.md, reserved for Joel

Status, 11 Nov 2026: Joel approved items 2 (for our own flyers) and 3, and the flyer week count; the notes are in COMPLIANCE.md.

1. **Amber (#FF9900).** The kit uses it as a lead colour; rule 10 bars "orange AWS accent". Kept out of the site.
2. **Standalone AWS logo.** The virtual backgrounds and the slide template place the AWS logo on its own; rule 2 bars the standalone smile. Not used, and it is the reason the Freshers flyer is withheld.
3. **Trimming the wordmark panel.** Rule 1 says never crop. We trimmed the empty panel around the lettering, and the lettering itself is untouched. If you read rule 1 as covering the panel, the alternative is the full 4:1 panel, where the lettering would be about 6 px tall in the header.
4. **Campus lockup.** The handbook describes the campus name under the official logo. The kit has no ready-made campus lockup, so the header sets "University of Cape Coast" in Geist Mono under the wordmark. A Brand Asset Generator lockup, if the programme provides one, should replace it.
5. **The pixel chip** (`assets/pixel-art/sbg-chip.json`, rule 4) is now unused. The 404 and admin sign-in show the official chip SVG instead, which resolves W7.

## 2. Event flyers

| File | Size | Event, by source evidence | Decision | Display |
|---|---|---|---|---|
| `Laucnh and evet 1.png` | 1600 x 901 | Launch, 22 Aug 2026 (S6, S7, S11) | Published as `media/events/launch.webp` | Whole on the event page; cropped detail on the speaker in archive rows and the staircase |
| `Building Your AWS Career ... .png` | 1600 x 901 | Career talk, 26 Sep 2026 (S4, S5, S9) | Published as `career.webp` | As above, crop on the speaker portrait |
| `Event4.jpeg` | 3600 x 2028 | From Code to Cloud, 14 Nov 2026 (S9, S11, S14) | Published as `code-to-cloud.webp` at 1600 px. Joel confirmed the flyer's details on 11 Nov 2026: 9:30 AM to 1:00 PM, Computer Lab, New Science Annex | Whole beside the next-session feature on home and Events, and on its event page |
| `EVENT3.png` | 1200 x 627 | Freshers onboarding, 10 Oct 2026 (S3, S10) | Published as `freshers.webp` on Joel's approval, 11 Nov 2026 (rule 2 note) | Whole on the event page; crop in lists |
| `Z2C.jpg` | 7200 x 4056 | Zero to Cloud Practitioner, from 17 Oct 2026 (S2) | Published as `zero-to-cloud.webp` on Joel's approval, 11 Nov 2026 (rule 21 note). The bootcamp is a programme, not an event record | Whole beside the bootcamp section on the Events page |

Every flyer keeps its facts in HTML next to it. No flyer is the only place a date, time or room appears.

## 3. Photographs

All 24 carry the photographer credit "shotby e'z" and a "ZERO TO CLOUD PRACTITIONER" watermark. That places every one at the bootcamp. File names give the capture date: five from Sat 24 Oct 2026 (week 2, topic unknown), 19 from Sat 31 Oct 2026. The 31 Oct set includes a Kahoot screen titled "AWS Cloud Computing & Security Basics" and three prize handovers, matching the week 3 recap (S1). Captions state the date and the bootcamp, and name no one.

| Web copy | Source | Used in | Why this photo |
|---|---|---|---|
| classroom | 20261031_185639 (the only horizontal frame) | Home hero, main cell | Depth from the back row to the facilitators and screen; shows the room as a whole |
| student-smiling | 20261031_185341 | Home hero, portrait cell | A participant clearly enjoying the work |
| code-on-screen | 20261031_184530 | Home hero, detail cell | Code on screen, facilitator in the background |
| facilitators | 20261031_184704 | Bootcamp story beat 1; About lead | Concepts being explained |
| website-on-screen | 20261031_184512 | Bootcamp story beat 2; projects empty state; S3 recap cover | A website visible on the laptop, matching the lab |
| student-focus | 20261031_185359 | Bootcamp story beat 3 | Concentration, phone and laptop: troubleshooting |
| kahoot | 20261031_190300 | Bootcamp story beat 4 | The quiz the recap describes |
| room-working, helping, smile-portrait, prize, front-of-room, concentrating | 31 Oct and 24 Oct | About photo wall only | Participation and the wider room; no repeats of the home set |

Not published: near-duplicates (184732, 185230 against the selected room shots; 190406 and 190424 against the selected prize photo); 184629 and 184649 (portraits with no activity); 184433 (mixed focus); 184819 (1) and 185536 (alternates). Each photo appears in one place, except website-on-screen, which serves as the recap cover too.

## 4. Fonts

Geist and Geist Mono stay, self-hosted from `public/fonts/` under the SIL OFL. Amazon Ember is out until its web licence is confirmed. The wordmark itself is outlined in the SVG, so the official letterforms still appear in every header without shipping the font.
