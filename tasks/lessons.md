# Lessons

Patterns from Joel's corrections, each with a rule that stops the mistake happening again. Read this at the start of every session. Add to it after every correction.

Format:

```
## Short name of the mistake
What happened: one line.
Rule: one line, written as an instruction.
```

## Writing tells

What happened: nothing yet; these are standing rules from the start of the project.
Rule: no em dashes, no en dashes, no emojis, none of the banned phrases in CLAUDE.md. Run `pnpm check:copy` before saying a task is done.

## Invented content

What happened: nothing yet; standing rule.
Rule: if a fact is missing, leave TODO(joel) and render nothing. Never fill the gap with plausible copy or numbers.

## Reporting compiled work as finished

What happened: the platform build was reported as complete while the Playwright flows and the production build had not run; Joel had to say it was not verified.
Rule: say "done" only for what a test or a browser check exercised; list everything else as implemented but not verified, with the reason.

## Recaps written before the run sheet

What happened: the From Code to Cloud recap was first written from the photos alone, with the advertised times. Joel then supplied the run sheet, the check-in count and the real times (into the lab at 10:00 AM, closed at 2:00 PM) (16 Nov 2026).
Rule: before writing a recap, ask for the run sheet, the check-in count and the actual start and end. Photos show what happened, not when or what was planned.

## A reveal that hides the thing it watches

What happened: the mask reveal set `clip-path: inset(0 0 100% 0)` on the observed element. Chrome's IntersectionObserver counts the element's own clip-path, so it reported zero intersection and anything that started below the fold stayed hidden (16 Nov 2026).
Rule: never hide an observed element with its own clip-path. Clip its children, and check a reveal below the fold, not only in the first screen.

## Test infrastructure on a low-memory laptop

What happened: next dev restarted itself on memory, and the local PGlite server rejected connections over its limit and stopped on a dropped client, so tests failed for reasons that were not in the app.
Rule: read the server logs before changing a test; run one Next server at a time, flows against `next start`, PGlite with 100 connections.


## Holding back supplied assets

What happened: the 10 Nov redesign kept the official SBG kit, three of five flyers and most photos off the site on cautious readings, so Joel had to ask a second time for a redesign that used them.
Rule: use every supplied asset the rules allow; for each one held back, name the exact rule it conflicts with. A doubt about one file never removes the whole set.
Repeated 17 Nov 2026: Joel approved every From Code to Cloud photo, but 21 of 75 went up after an editor's cut. Approval of a set means publish the set; curate only the order, and offer a shorter selection where space demands it (a home strip), never in place of the full set.

## Content prepared but never loaded

What happened: verified events sat in a JSON file and a local preview database, so the Events page Joel looked at stayed empty.
Rule: when content is ready, finish the path to the database the site reads, or hand Joel the exact command, and check the page against that database.
Repeated 16 Nov 2026: the From Code to Cloud work was checked on a local database only, while Neon had no published events, so Joel saw a 404 and a home page without the build day section. Before calling content work done, say plainly whether Neon has it, and if not, put the import and publish steps first in the reply.

## Narrow positioning

What happened: the copy read like a Cloud Practitioner course, although Student Builder Groups cover software, AI, data, security and more.
Rule: position the group around building with technology. Separate what we have run (with sources) from areas open to explore, and never claim the second as the first.
Repeated 24 Nov 2026: the editorial pass made the hero and footer narrower ("people working in cloud", "a Saturday bootcamp", "build sessions where you put a project online"). Student Builder Groups grew out of AWS Cloud Clubs precisely to go beyond cloud. When tightening copy, describe formats generally (talks with people in the industry, training bootcamps, hands-on sessions on campus) and keep cloud, software development and AI named together; put one programme's specifics (Saturdays, LT5) only where that programme is described.

## Tightening copy that was written that way on purpose

What happened: the bootcamp steps on the home page describe what happens at every session; the editorial pass anchored them to week 3, and Joel had to restore them (24 Nov 2026).
Rule: before narrowing a general description to one dated instance, check whether the general version is the point. "Is this claim true of every session?" is a question for Joel, not a reason to rewrite.

## Measuring LCP after a scripted scroll

What happened: the first motion baseline reported a 4 s home LCP; the script had scrolled the page first, and a script's scroll does not end LCP, so photos further down became late candidates.
Rule: read LCP at rest before any scripted scrolling, and confirm a surprising vitals number with a waterfall before acting on it.

## Internal rules written as public copy

What happened: the site told visitors where dates came from, that RSVPs are not attendance, that photos had permission and that projects are reviewed; Joel had to ask for a full editorial pass (15 Nov 2026).
Rule: apply content rules silently. Public copy says what happened and what to do next; a rule appears only when the reader needs it to act or the law requires it. Check with `docs/CONTENT_VOICE_GUIDE.md`.

## Event copy that outlives the date

What happened: From Code to Cloud still read as upcoming the day after it ran, and the board still had AI "on the calendar".
Rule: when an event passes, change its body to the past tense, label the plan "On the agenda", and update any status that depended on the date.

## Overflow hidden by overflow-x: clip

What happened: the technology board grew to 944 px on phones, but `.public-site { overflow-x: clip }` cut it off, so the page-width check passed while half the board was unreachable.
Rule: in grids that hold horizontal scrollers, use minmax(0, 1fr) tracks; check element widths, not only document scroll width.

## A route-level loading file changes more than the spinner

What happened: a `loading.tsx` in the portal and dashboard made `notFound()` answer 200 (streaming had started) and stopped pages refreshing after some server actions; four e2e flows failed (20 Nov 2026).
Rule: add loading feedback with `<Suspense>` around a slow section or a pending button state, not a route `loading.tsx`, and run the member and admin flow specs in e2e/dev before calling it done.
