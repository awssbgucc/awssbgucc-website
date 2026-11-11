# Public website redesign, 10 Nov 2026

## Direction and baseline

The baseline was opened in real Chromium before implementation, against a fresh local database seeded with the existing content. Full desktop and phone screenshots are in review/redesign/before-desktop.png and before-mobile.png. The map occupied most of the first screen, no photographs appeared, the next session was empty, and About, programmes and benefits repeated text-led compositions. Monospace hero type, thin section hierarchy and repeated membership buttons made it hard to see the group's activity. The mobile menu used aria-modal without containing keyboard focus.

The new direction is a dark editorial publication with actual classroom photography, large sans headings, mono dates and labels, generous but varied spacing, and cyan for the build-session feature. It retains existing colour tokens and Geist fonts. The Ghana map supports the campus story in About. The primary hero action is membership; events are the secondary action. The final invitation connects Meetup and the Builder Portal.

## Implementation

Public layouts are scoped through .public-site and src/styles/public.css. Shared global tokens, authentication, database models, XP, check-in and admin workflows are unchanged by this redesign. Public, portal and admin retain consistent naming and the same self-hosted font families; the portal and admin layouts are preserved. Native dialog with explicit Tab wrapping provides modal keyboard containment and focus restoration on mobile. Approved photography is used on home without assigning undocumented event dates or identities.

Homepage sections: photographic lead, dated next-session feature, campus context and map, a bootcamp panel beside build-session and career-talk treatments, staggered photo grid, optional reviewed recap, past-event archive, published projects and active team when present, campus collaborators, invitation and portal entry. No fabricated stats, projects, portraits or sponsors fill empty slots.

Events use a prominent upcoming feature and searchable archive with actual dates, category and venue. Detail pages combine a large heading, schedule and registration panel, contained artwork, Markdown overview, resources, related recap and gallery. Past events retain their Meetup and AWS terms links. Event status is derived from dates; cancellation is not a model field, so existing unpublish remains the release-safe option.

Projects have larger images, technical stacks, consenting credits and existing GitHub/live links. Empty projects and inactive team receive purposeful explanatory layouts. Team portraits render only when supplied. Partner logos retain their original colours; name-only entries remain until logos are authorised. Blog cards and articles have readable widths, metadata and image support. Contact, privacy, conduct and gated Community Day share the public typography. Community Day remains off.

## Content review and publishing

content/community-history.json is the review payload. scripts/import-community-history.ts is local-only, dry-run by default and create-only. It matches slug, Meetup event ID, title or date/category before inserting. It never changes an existing record or its publication status. The parser does not load .env, requires an explicitly set loopback DATABASE_URL, and rejects every remote database, including Neon.

Commands after starting an isolated local database and applying existing migrations and seed:

```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5434/postgres?sslmode=disable'
pnpm exec tsx scripts/import-community-history.ts
pnpm exec tsx scripts/import-community-history.ts --apply
```

New records are drafts. For a new disposable visual-review database only, --apply --preview creates the three complete event records and two recaps as locally published. The bootcamp remains draft because it lacks an individual Meetup listing. The launch is represented as a second recap article because the Event model requires an end time that the sources do not provide. This avoids inventing model-required data.

To publish later: open the production admin only after authorisation, search existing titles, dates and Meetup IDs, review each payload field against its source, update an existing matching record or create a draft through the existing form, add approved media through the existing upload field, preview, and use the existing publish control. Do not apply the review preview database to production. Review the conflicting 14 Nov room wording before advertising a precise room. Existing records and statuses always take precedence.

The optional career flyer preview requires SBG_LOCAL_MEDIA_PREVIEW=1, a loopback DATABASE_URL and loopback NEXT_PUBLIC_SITE_URL. It is outside public/ and returns 404 when those requirements are absent. Original photographs, ZIP and review output should not be committed. Only the four explicitly consented public WebP derivatives are publication candidates.

## Verification

All checks below ran locally on 10 Nov 2026. Database connections were explicitly directed to the isolated PGlite database on port 5434. No production records or infrastructure were changed. Existing uncommitted platform work was preserved. Nothing was committed, pushed or deployed.

| Check | Final result |
|---|---|
| TypeScript | Passed |
| ESLint and copy rules | Passed; zero copy errors, two warnings for wording retained in the exact historical launch title |
| Unit tests | 197 passed |
| Database integration tests | 9 passed against local PGlite |
| Public Playwright checks | 32 passed, one worker; includes navigation, filters, keyboard containment, reduced motion and media route boundaries |
| Portal/admin Playwright regressions | 36 passed, 14 intentional viewport skips, one worker; includes onboarding, authorisation, check-in, review/reward workflows, privacy and publishing |
| Production route checks | 4 passed: styleguide and preview unavailable, protected admin redirect, sitemap |
| Production build | Passed, 55 generated pages; one build worker |
| Public visual sweep | 16 routes at 375, 768, 1280 and 1440px; no recorded page errors, horizontal overflow, broken images or missing/duplicate h1 |
| Automated accessibility | Zero axe WCAG A/AA violations on those 16 routes at 375 and 1440px |
| Authenticated visual sweep | 9 portal/admin routes at all four widths; no recorded page errors, overflow or unsuccessful responses |
| Import boundaries | Repeated import preserved existing records/statuses; remote URL rejected before database access |
| Media integrity | All 29 original image hashes unchanged; four public derivatives contain no EXIF/GPS metadata |

The final total is 72 relevant Playwright tests passed, 14 intentional skips and no failures. This is the selected regression set, not a claim that every development-only fixture test ran. Authenticated browser checks used disposable local test sessions, not real Google OAuth. Early checks found a menu Tab-wrap defect and development font fetching failures; both were fixed before the final successful runs. The production build and screenshot sweep were repeated after the fixes.

Complete screenshots are in the ignored review/redesign directory:

- home-1440.png and home-375.png: complete redesigned homepage; home-1440-top.png is a readable lead-section preview.
- before-desktop.png and before-mobile.png: baseline comparison.
- events-1440.png and events-375.png: next session and past-event archive.
- events-from-code-to-cloud-1440.png and events-from-code-to-cloud-375.png: upcoming session.
- events-building-your-aws-career-1440.png: completed event and contained local flyer preview.
- IMG-contact.jpg: all 24 original photographs; Event-banners-contact.jpg: all five flyers.
- builder-1440.png, builder-375.png, admin-1440.png and admin-375.png: authenticated regression captures.
- browser-issues.json and auth-browser-issues.json: empty final issue arrays.
- playwright-results.json, portal-admin-tests.json and production-tests.json: final browser test reports.

The full pages were visually reviewed, including the phone gallery, mobile menu, archive, recaps and authenticated contact sheet. The real-content layout has useful empty states for projects and team; those cannot be evaluated with genuine populated records until approved projects and public profiles exist. Community Day remains gated. No physical-device, manual screen-reader, Lighthouse performance, real Google OAuth, S3 upload, Neon or Amplify validation was performed. Automated accessibility checks are evidence for the tested pages, not a complete accessibility certification.

Release content still needs an admin publishing review. The 14 Nov indexed Meetup schedule differs from the flyer in end time and room; the preview follows Meetup, but the exact room should be reconfirmed with the organiser. Career flyer publication, official campus lockup and Ember web redistribution remain unapproved. Missing project records, team portraits, collaborator logos, individual recap permalinks, materials and photo-to-event mapping remain absent. See ASSET_CONTENT_INVENTORY.md for the full source and permission record.

Geist font self-hosting is covered by the upstream SIL OFL licence: https://github.com/vercel/geist-font/blob/main/OFL.txt . The unmodified files and licence accompany the source.
