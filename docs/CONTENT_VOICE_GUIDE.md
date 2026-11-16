# Writing for the website

For anyone in the core team who writes or edits copy for this site: event pages, recaps, captions, buttons. Read it once, then use the checklist at the end.

## Who is talking

Students who run the group, writing to other students, and to lecturers, partners and AWS people who want to know if we are real. Write the way you would explain it to a classmate who asked: plain, specific, a bit warm, never selling.

"We" is the group. Contractions are fine. British spelling (programme, organise, practise as a verb). Dates as `Sat 14 Nov 2026`, times as `9:30 AM`, all in GMT.

## Say the actual thing

Name the session, the room, the service, the person.

- Weak: "Regular hands-on sessions on campus."
- Better: "Saturdays, 4:30 to 6:00 PM, LT5."
<!-- check-copy:off -->
- Weak: "Participants explored cutting-edge cloud technologies."
<!-- check-copy:on -->
- Better: "Participants deployed a Hostel Finder website on Amazon S3."

If a fact is missing, leave it out. Do not fill the space with something that sounds right.

## Keep the rules off the page

We have rules about attendance, photos, consent, project review and verification. They decide what goes on the site. They are not what the site is about.

| The rule | What the page does |
|---|---|
| Only show attendance taken on the day | Shows the number, or shows nothing |
| Publish photos only with permission | Shows the photos with useful captions |
| Review projects, name builders only with consent | Shows the projects. The consent line lives in the submission form |
| Meetup is where people RSVP | Says "Register on Meetup" where someone is about to register |

Only explain a rule when the reader needs it to do something (the RSVP line on an event page) or the law requires it (the privacy notice, the AWS Event Terms line, the footer line).

## Turning an event into a page

Work from the original announcement, the Meetup listing and our own recap. Keep three things apart:

1. **What the event was about.** Comes from the announcement or listing. Fine for any event, before or after.
2. **What happened.** Only from a recap, photos or someone who was there. Never from the announcement.
3. **What was on the agenda.** From the listing. On a past event, label it "On the agenda" so nobody reads it as a report.

Before the event, answer: what is it, what will people do, who is it for, when and where. After it, answer: what was it about, what happened, what was covered, where are the slides or photos.

Change the tense when the date passes. "Bring a laptop" on a past event is a mistake.

Length follows the material. One paragraph and an agenda is a complete page if that is all we know. Do not stretch every event into the same three sections.

## Captions and alt text

A caption adds what the photo cannot say: which week, which session, what was happening, the date. "Week 3 at LT5. Sat 31 Oct 2026" is enough. If you have nothing to add, skip the caption.

Alt text describes what is in the picture for someone who cannot see it: "Two facilitators at the front of the room beside a laptop." It never names a person unless they agreed, and never guesses a date or event.

## Headings and buttons

A heading tells the reader what the section holds: "Zero to Cloud Practitioner", "What we've run so far." Avoid slogans and questions. Buttons say what happens: "Register on Meetup", "Read the week 3 recap". Sentence case for both.

## Things that give writing away as filler

<!-- check-copy:off -->
- Words: exciting, passionate, innovative, journey (as a metaphor), unlock, empower, leverage, seamless, cutting-edge, vibrant community. `pnpm check:copy` catches most of them.
<!-- check-copy:on -->
- Three adjectives in a row. Lists of three verbs ("learn, build, connect") on every section.
- Sentences that could sit on any tech group's website.
- Every paragraph the same length and rhythm. Short, dramatic one-line sentences used as decoration.
- Repeating the group's full name in every paragraph. Once per page is usually enough; after that, "we".
- Em dashes, en dashes and emojis. Use a comma, a colon or a new sentence.

## What we can and cannot claim

We can say what we ran, who spoke, what the recap says happened, and what areas the group is open to. We cannot claim a topic we have not covered, an outcome nobody recorded, a number we did not count, a partner we do not have, or that AWS or the university runs or endorses us. Talks and the bootcamp are AWS-focused; the group itself is for anyone who wants to build software, data, security or AI projects. Say both, and keep them apart.

## Before you publish

- [ ] Every fact has a source: a post, a listing, a recap, or someone who was there
- [ ] Past events are in the past tense, and the agenda is labelled as the agenda
- [ ] No sentence explains our internal process to the reader
- [ ] The heading says what the section is
- [ ] Read it aloud. If you would not say it to a classmate, rewrite it
- [ ] `pnpm check:copy` passes
