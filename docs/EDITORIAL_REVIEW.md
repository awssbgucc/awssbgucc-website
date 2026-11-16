# Editorial review, 15 Nov 2026

A pass over every public word on the site: what was wrong, what changed, what was removed, and what still needs a fact from Joel. The writing rules for future edits are in `CONTENT_VOICE_GUIDE.md`.

Scope: home, about, events, every event page, projects, team, partners, writing, contact, footer, navigation, 404, member sign-in, empty states, captions, metadata. Legal text was checked and kept: the footer compliance line, the AWS Event Terms lines, the privacy notice, the code of conduct and the achievements disclaimer on member profiles. Layout, motion, data model and auth are unchanged.

## What was wrong

1. **Internal rules written as public copy.** The biggest problem. The site explained our own processes to visitors: where dates come from, why RSVP totals are not attendance, that photos were shared with permission, that projects are reviewed and builders consent to be named, that team profiles wait for approval, that blog posts are reviewed. The rules still apply. They now apply silently.
2. **Source notes on the page.** "Told from the group's recap", "every approved photo in the order it was taken", "the group reports every participant deployed". These read like research notes. Where the fact comes from our own recap, we now state it as ours.
3. **Slogans standing in for headings.** "Every session, a step up.", "Made here. Out in the world.", "Saturdays, in pictures." The heading now says what the section holds.
4. **Awkward or padded sentences.** "The bootcamp and build sessions happen on campus, with laptops open." "AWS connects all of them." "Learning by building, together."
5. **A past event written as upcoming.** From Code to Cloud ran on Sat 14 Nov 2026, but its page still said "Our first in-person build session takes...", "Bring a laptop", and the technology board still filed AI under "On the calendar".
6. **Small inventions.** The career talk said Nathaniel's closing line is one "the group still repeats". The week 3 photo copy said facilitators explained things "before anyone touched a console". Neither is in a source. Both are gone.
7. **Claims wider than the record.** The hero said members "learn software, cloud and AI by building real projects". We have not run an AI session. The new hero names what we run and says what the group is for, without claiming the second as the first.
8. **Empty states that pointed at the gap.** "Coming up: 0" on the events page, "Profiles in preparation" on the team page, "No projects are public yet" on projects.

## Before and after

| Where | Before | After |
|---|---|---|
| Events, archive heading | "Every session so far." plus "Dates, rooms and speakers come from our Meetup listings. RSVP totals are not attendance records, so we only show attendance taken on the day." | "Every event so far." No paragraph. |
| About, how it works, step 2 | "Talks run online. The bootcamp and build sessions happen on campus, with laptops open." | "Talks are online in the evening. The bootcamp and build sessions are on campus, so bring a laptop." |
| About, gallery | "Saturdays, in pictures." plus "Photographs from the bootcamp, shared with the permission of the group." | "Weeks 2 and 3 of the bootcamp." No paragraph. |
| About, how it works, step 4 | "Build in the open: Approved projects appear on this site, and builders are named only if they agree." | "Share what you build: Projects you build at our sessions or on your own can go up on this site." |
| Home, hero | "...where we learn software, cloud and AI by building real projects together on AWS. You do not need any experience to start." | "We run online talks, a Saturday cloud bootcamp and hands-on build sessions for students who want to build software, from websites to cloud infrastructure and AI. You can start with no experience." |
| Home, projects (empty) | "Member projects appear after the technical team has reviewed them and the builders have agreed to be named." | "If you have built something on AWS, at one of our sessions or on your own, share it through the Builder Portal and it can go up here." |
| Home, bootcamp | "Saturdays at LT5, laptops open." and "Concepts first, then a lab where everyone builds and deploys." | Heading "Zero to Cloud Practitioner". "Sessions mix exam topics with practical work on AWS services." (from the kickoff post) |
| Home, closing | "Bring a project to a build session and leave with it deployed." | "Come to a build session and put a project of your own online." |
| Event page, past | "New sessions go up on Meetup first, and the archive here keeps the record." | "New events go up on Meetup first." |
| Event page, attendance | Figure plus "From the attendance taken on the day." | Figure only. |
| Projects, empty | "The technical team reviews it and confirms everyone named has agreed, then it appears here..." | "...share it through the Builder Portal with a screenshot, the AWS services you used and a link to the code." |
| Team, empty | "Profiles in preparation" and "Team profiles are added here once each person has approved their details and photo." | "You will meet the team at the next session. Every event is listed on Meetup, and you can also reach us through the contact page." |
| Footer | "Students at the University of Cape Coast, learning by building, together." | "A student-led group at the University of Cape Coast. Talks, a Saturday bootcamp and build sessions, free for every student." |
| Sign-in | "Ship projects: Approved projects appear on the public showcase, with your consent." | "Share projects: Put what you build on the public projects page." |

## Removed entirely

- Events: the Meetup and RSVP paragraph above the archive
- Events: the "Coming up" figure when nothing is coming up
- Home: "The record so far, from our Meetup listings and the group's own recaps."
- Home: "Told from the group's recap." under the week 3 photos
- About: the photo permission line
- Event page: "From the attendance taken on the day."
- Team: the "Profiles in preparation" label and the approval sentence
- 404: "The sessions and projects are still where they were."
- Career talk: "a line the group still repeats"
- Launch: "Live questions and answers" in the list of what happened (announced, not in the recap)

## Home page

- Hero paragraph rewritten around what we actually run; button "See our events"; the area list labelled "Areas to explore" instead of "Members explore"
- Events staircase: "What we've run so far.", no source paragraph, action "All events"
- Bootcamp: label "Bootcamp, with CITSA", heading "Zero to Cloud Practitioner", CITSA's full name, CLF-C02, voucher terms as published; the four photo captions follow the week 3 recap line by line; "Read the week 3 recap"
- Photo strip label: "Bootcamp weeks 2 and 3, Sat 24 and Sat 31 Oct 2026"
- Technology board intro: says plainly that most sessions so far were cloud foundations and websites, and the rest are open
- Board areas: websites now names From Code to Cloud in the past tense; AI moved from "On the calendar" to "Announced" with an honest line; security and data lines tidied; compute line no longer says "rent by the second"
- Projects: "Member projects" when there are some; the invitation when there are none
- Closing: the three ways in rewritten so none promises an outcome

## Other pages

- **About**: second paragraph says what the work has been (cloud foundations, careers, websites) and what is open (backends, data, security, AI); "events" instead of "sessions" in the count; staircase heading matches the home page; four steps rewritten; gallery heading and captions
- **Events**: intro says what the events are and that they are free; stats read "Events run" and "First event"; bootcamp band gets CITSA, a sentence on week 3 and "Read the week 3 recap"; flyer captions "Event flyer" and "Bootcamp flyer"
- **Event page**: aside copy, "Recap" instead of "Session story", "Photos from the day"
- **Projects**: intro, empty state, "What to include", the week 3 story caption, stat "Projects"
- **Team, Partners, Contact**: descriptions added to metadata; partner intro; CITSA tile names the association
- **Writing**: intro and empty state
- **Member profiles**: stat "Challenges completed" instead of "Approved builds"
- **Metadata**: site description, events, projects, team, partners and contact descriptions

## Events incorporated

All four events with a Meetup listing are in the archive. Bootcamp weeks have no Meetup listings, so under COMPLIANCE rule 17 and Joel's decision of 11 Nov 2026 they stay in the bootcamp band on the events page, which now names week 3 and links its recap.

| Event | Date | What the page now says | Sources |
|---|---|---|---|
| AWS Student Builder Group UCC Launch: Your Cloud Journey Starts Here | Sat 22 Aug 2026, 8:00 PM, Google Meet | What happened, from the recap: introduction, plans, cloud fundamentals, Isaac Tandoh on cloud, AWS and DevOps, Matthew Ntsiful's contribution | S6 recap, S7 announcement, S11 listing |
| Building Your AWS Career: Certifications, Career Paths & Opportunities | Sat 26 Sep 2026, 8:00 to 9:30 PM, Google Meet | What the session was built around (listing), what we talked about and the point that stood out (recap), Nathaniel's line | S4 recap, S5 announcement, S9 listing |
| AWS SBG UCC Freshers Onboarding: Introduction to AWS & Cloud Computing | Sat 10 Oct 2026, 7:00 to 8:30 PM, online | What happened (recap) kept apart from "On the agenda" (listing), so the advertised demo is not claimed as done | S3 recap, S10 listing |
| From Code to Cloud: Build and Deploy Your First Project on AWS | Sat 14 Nov 2026, 10:00 AM to 2:00 PM (advertised 9:30 AM to 1:00 PM), Computer Lab, New Science Annex | Past tense. What it was about and "What we did", from the run sheet Joel confirmed. 76 check-ins. Cover photo, flyer and a 20-photo gallery (16 Nov update below) | S14 listing, flyer, S17 photos, S18 run sheet, Joel 11, 15 and 16 Nov 2026 |

Posts: the week 3 recap now states the result as ours ("every participant had the website live", from S1) instead of "the group reported", and its link no longer claims to open the original post. The launch post's "what came next" names From Code to Cloud.

## Source evidence

- LinkedIn and Meetup text supplied by Joel on 11 and 15 Nov 2026, archived as S1 to S16 in `research/COMMUNITY_SOURCE_ARCHIVE.md`. The 15 Nov paste repeats the same posts and listings; it adds no new event.
- Photographs: `content/media-manifest.json`. Dates come from camera file names and the bootcamp watermark. Captions name only what the photo and the recap support.
- Conflicts and how they were settled:
  - From Code to Cloud room and end time: Joel's confirmation and the flyer (Computer Lab, 1:00 PM) over the Meetup listing (lecture theatre, noon). The 15 Nov paste still showed the lecture theatre on Meetup.
  - Nathaniel Agbenyenu's title: the Meetup listing's full title over the flyer's shorter one.
  - RSVP counts (launch 54, career 61 and 63, freshers 0 and 51) and member counts (286 on Meetup, 223 LinkedIn followers) are snapshots, not attendance, and are not shown anywhere.

## Waiting on Joel

- [x] From Code to Cloud photographs (16 Nov 2026)
- [x] From Code to Cloud: check-in count (76), run sheet and actual times (16 Nov 2026)
- [x] Kelvin's full name: Kelvin Opoku Boateng (16 Nov 2026)
- [x] Meetup listing room: left as it is, the event is over (Joel, 16 Nov 2026). The site uses the Computer Lab
- [ ] Bootcamp weeks 4 onward: what ran on each Saturday since 31 Oct (Amazon EC2 and AWS Lambda were announced for 7 Nov). One line per week is enough for the bootcamp band
- [ ] Whether bootcamp weeks should become event pages. That needs a Meetup listing per week or a change to COMPLIANCE rule 17
- [ ] Confirm the Writing empty state line (W9)
- [ ] If the drafts-only import already ran on Neon, run it again with `--refresh` (see `research/CONTENT_PIPELINE.md`). Records already saved or published in the admin keep their old text and need the new text pasted in by hand from `content/community-history.json`

## 16 Nov 2026: From Code to Cloud photographs

- **Event page.** After an event, its first photo now leads the page as a wide cover, and the flyer moves into the side column. Events without photos (all the online ones) keep the flyer at the top, as before. The gallery keeps upright photos whole: one column each, wide ones across two, on a grid whose rows are one and a half columns tall. Every photo has its own alt text and opens in the existing viewer.
- **Recap.** First written from the photos alone. Joel then confirmed the run sheet (S18): everything on it happened except the Patron's welcome, there were 76 check-ins, and the session ran 10:00 AM to 2:00 PM because the group got into the lab late. "What we did" now follows the run sheet: Joel's talks and Builder Center sign-up, Kelvin's two labs (a portfolio on Amazon S3, then an Amazon EC2 server behind it), the Access Denied exercise, the Wayground quiz and the group photo. The Patron's slot is left out, and so is the listing's AI tools demonstration, which was not on the run sheet. The "On the agenda" list is gone, since what ran is now known.
- **Technology board.** Compute and serverless, and Security, move to "Covered in a session" on the strength of Lab 2 and the bucket policy exercise; each line says a dedicated session has not run yet where that is true. AI no longer points at From Code to Cloud.
- **Home.** The hero's main and upright cells now use From Code to Cloud photos (caption: Computer Lab, New Science Annex). A new section after "What we've run so far" shows the event title, date, summary and three photos, with "See the event". The bootcamp section and photo strip are unchanged.
- **Fix found on the way.** The mask reveal clipped the element itself to nothing, and Chrome then never reports it as on screen, so any mask-revealed image that started below the fold stayed hidden (the bootcamp flyer on the events page, for one). The clip now sits on the element's children.
- **Pipeline.** Event records in `content/community-history.json` carry `photos`; the import creates them and `--refresh` updates them on records nobody has saved in the admin. Selection and the venue discrepancy are in `ASSET_CONTENT_INVENTORY.md`.

## Remaining issues

- The event titles are the published Meetup titles and stay as they are, including "Your Cloud Journey Starts Here", which trips the copy checker's "journey" warning
- "Covered in a session" for DevOps rests on the launch talk alone. It is accurate but thin until a hands-on DevOps session runs
- The member portal's own dashboard still says "Approved builds"; it is behind sign-in and out of this pass
- `docs/CONTENT.md` describes the October site. It now points to where the current copy lives instead of being rewritten line by line
