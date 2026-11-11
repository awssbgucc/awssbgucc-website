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

## Test infrastructure on a low-memory laptop

What happened: next dev restarted itself on memory, and the local PGlite server rejected connections over its limit and stopped on a dropped client, so tests failed for reasons that were not in the app.
Rule: read the server logs before changing a test; run one Next server at a time, flows against `next start`, PGlite with 100 connections.


## Holding back supplied assets

What happened: the 10 Nov redesign kept the official SBG kit, three of five flyers and most photos off the site on cautious readings, so Joel had to ask a second time for a redesign that used them.
Rule: use every supplied asset the rules allow; for each one held back, name the exact rule it conflicts with. A doubt about one file never removes the whole set.

## Content prepared but never loaded

What happened: verified events sat in a JSON file and a local preview database, so the Events page Joel looked at stayed empty.
Rule: when content is ready, finish the path to the database the site reads, or hand Joel the exact command, and check the page against that database.

## Narrow positioning

What happened: the copy read like a Cloud Practitioner course, although Student Builder Groups cover software, AI, data, security and more.
Rule: position the group around building with technology. Separate what we have run (with sources) from areas open to explore, and never claim the second as the first.
