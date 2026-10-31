# Content

The copy and seed data for v1. Use the copy as written. Anything marked `TODO(joel)` is a gap: render nothing for it and leave the TODO in the seed file. Do not invent replacements.

Editable items are flagged **[admin]**. They live in the database and are seeded from this file, so the team can change them later without a deploy.

## Global

| Item | Value |
|---|---|
| Group name | AWS Student Builder Group at University of Cape Coast |
| Short name | AWS SBG UCC |
| Email **[admin]** | awssbgucc@gmail.com. TODO(joel): confirm this over the older awsbuildergroup.ucc@gmail.com |
| Meetup **[admin]** | https://www.meetup.com/aws-sbg-at-university-of-cape-coast |
| WhatsApp community link **[admin]** | TODO(joel) |
| Builder Center tracked link **[admin]** | https://bit.ly/4pNTKvI |
| LinkedIn **[admin]** | TODO(joel) |
| Instagram **[admin]** | TODO(joel) |
| X **[admin]** | TODO(joel) |
| AWS Event Terms | https://aws.amazon.com/events/terms/ |

## Page title and meta

- Title: `AWS Student Builder Group at University of Cape Coast`
- Description: `Student-led cloud group at the University of Cape Coast. Bootcamps, build sessions and talks on AWS, open to every department.`

## Home

### Hero

- Line 1: `Build from`
- Line 2 (brand gradient): `Cape Coast.`
- Paragraph: `We are UCC's AWS Student Builder Group. Students from any department learn cloud computing by building real projects on AWS, together, every week.`
- Primary button: `Join on Meetup` linking to the Meetup URL
- Secondary button: `Join the WhatsApp community` linking to the WhatsApp URL
- Text link under the buttons: `New to AWS? Create your free Builder Center profile` linking to the tracked Builder Center link
- Visual: `<PixelMap />` with the Cape Coast label

### Stats row **[admin]**

Render only the blocks that have a value.

| Label | Value | Source |
|---|---|---|
| Members on Meetup | TODO(joel) | Entered by hand in Site Settings |
| Events run | Computed | Count of published events with an end date in the past |
| Departments represented | TODO(joel) | Entered by hand |
| Partner associations | Computed | Count of active partners of type Campus |

### About

- Eyebrow: `About the group`
- Headline: `A place to learn cloud by doing it.`
- Paragraph 1: `The AWS Student Builder Group at University of Cape Coast is a student-led group in the AWS Student Builder Groups program. We are the first one on campus.`
- Paragraph 2: `We run bootcamps, hands-on build sessions and career talks, all built around AWS. Sessions are free and open to students from every department and level. You do not need to be a computer science student, and you do not need any experience.`
- Three short points, each on one line with a small accent marker:
  - `Free and open to every department and level`
  - `Free AWS Skill Builder courses for every member`
  - `Certification support for members who put in the work`
- Visual: the pixel UCC crest, only when `uccCrestApproved` is on. Otherwise no visual.

### What we run

- Eyebrow: `What we run`
- Headline: `Programmes and events`
- Four cards. Each is a programme, not a single event:

| Tag | Title | Copy |
|---|---|---|
| Bootcamp | Zero to Cloud Practitioner | `A weekly bootcamp with CITSA that takes you from no cloud knowledge to ready for the AWS Certified Cloud Practitioner exam. Participants who score 70% or more on the official practice exam can qualify for an exam voucher.` |
| Build session | From Code to Cloud | `In-person sessions in the computer lab where you deploy a real project on AWS. Bring a laptop. We bring the steps.` |
| Talk | Cloud and career talks | `Sessions with people who work in cloud, on what the job looks like and which certifications matter.` |
| Community Day | Student Community Day | `Our biggest day of the year: talks, workshops and the wider Ghana cloud community in one room.` Show this card only when the SCD page is switched on. |

- Under the cards: `See all events` (primary) and `Follow us on Instagram` (secondary)

### Next event

A single featured card for the soonest upcoming published event. If there is none, show: `No event scheduled right now. Join on Meetup to hear about the next one first.` with the Meetup button.

### Team preview

- Eyebrow: `The team`
- Headline: `Run by students, for students.`
- Show the Group Leader and core team from the database, in display order. Link `Meet the team` to `/team`.

### Partners strip

- Eyebrow: `Campus partners`
- Logos of active Campus partners. Hidden if there are none.

### Member benefits

- Eyebrow: `For every member`
- Headline: `What you get`

| Title | Copy |
|---|---|
| AWS Skill Builder | `Free access to hundreds of AWS courses and learning paths, with badges you can show on your CV.` |
| AWS Builder Center profile | `A public profile that records the badges you earn and the articles you publish.` |
| Hands-on sessions | `Build sessions where you deploy something real, not just watch slides.` |
| Certification support | `Study support for AWS certifications, and a route to exam vouchers for committed members.` |

TODO(joel): confirm every benefit against the current program terms before launch. Remove any that no longer apply.

### Closing call to action

- Headline: `Your first build starts here.`
- Paragraph: `Join on Meetup to get every event in your inbox, and join the WhatsApp community for updates on campus.`
- Buttons: `Join on Meetup` (primary), `Join the WhatsApp community` (secondary)

## Events page

- Headline: `Events`
- Intro: `Every event is free and listed on Meetup. RSVP there so we can plan seats and count you in.`
- Tabs: `Upcoming` and `Past`. Past events show attendance where recorded and a link to the recap post if there is one.
- Each event detail page shows: tag, title, date and time in Africa/Accra, venue or "Online", body text, cover image, a `RSVP on Meetup` button, and the line `By registering, you agree to the AWS Event Terms and Conditions.` with the terms link.

## Team page

- Headline: `The team`
- Intro: `The people who plan the sessions, book the rooms and keep the group running.`
- Sections: Group Leader, then Core team. Each card: photo, role label, name, programme and level, optional LinkedIn link.

## Partners page

- Headline: `Partners`
- Intro: `Campus associations and organisations that work with us to bring cloud skills to more students.`
- Groups: Campus partners, Sponsors (hidden if empty), Community partners (hidden if empty).
- Closing block: headline `Want to work with us?`, copy `We work with departmental associations, clubs and organisations that want their members building on AWS. Email us and we will set up a call.`, button `Email the team` (mailto).

## Blog page

- Headline: `Writing`
- Intro: `Event recaps, build guides and notes from the group.`
- A post can live on the site, or link out to where it was published (LinkedIn, AWS Builder Center). External posts show the destination as a small label.

## Student Community Day page (`/scd`)

Behind the `scdPageEnabled` setting, off by default. Do not switch it on until the event is confirmed.

- Title: `AWS Student Builder Groups Student Community Day Cape Coast`
- Blocks in order: When / Where / Who row, agenda, speakers, sponsors, venue with a map link, FAQ.
- All content comes from the admin dashboard. Nothing in this page is hard-coded.

## 404 page

- Visual: the SBG pixel chip, large and centred
- Headline: `Page not found`
- Paragraph: `This page does not exist, or it moved.`
- Button: `Back to the home page`

## Footer

- SBG logo lockup
- Columns: Group (About, Events, Team, Partners, Blog), Connect (Meetup, WhatsApp, LinkedIn, Instagram, X, Email), AWS learning (AWS Skill Builder https://skillbuilder.aws, AWS Builder Center tracked link, AWS Certification paths https://aws.amazon.com/certification/)
- Compliance line, exactly: `A student-led group in the AWS Student Builder Groups program. Run by students at the University of Cape Coast, not by Amazon Web Services.`
- `AWS Event Terms and Conditions` link
- Copyright: `© 2026 AWS Student Builder Group at University of Cape Coast`

## Seed data

Use these in `prisma/seed.ts`. Every record is seeded as Draft unless marked Published, so the team can review before anything goes live.

### Team

Photos, programmes and levels are TODO(joel). Seed `photoUrl` as null; the card shows initials on `--color-card-raised` until a photo is uploaded.

| Order | Name | Role | Role group |
|---|---|---|---|
| 1 | Joel Anarba Amuni | Group Leader | leader |
| 2 | Emmanuel Nttey | Technical Lead | technical |
| 3 | Opoku Kelvin Boateng | Events Director | events |
| 4 | Opoku Evans | Marketing and Communications Lead | community |
| 5 | Mohammed Bonah Adu | Community and Partnerships Lead | community |
| 6 | Rhoda Korantemaa | Operations and Documentation Lead | events |

Joel: BSc Computer Science, Level 300.

### Partners

| Name | Type | Status |
|---|---|---|
| CITSA | Campus | Published |
| AmaliTech Coding Club | Campus | Published |
| CANSSAG | Campus | Draft. TODO(joel): full name and logo |

### Events

TODO(joel): verify every title, date and venue before publishing. Attendance numbers are TODO and must come from the attendance records, not estimates.

| Status | Tag | Title | When | Where |
|---|---|---|---|---|
| Draft | Talk | Group launch session with Isaac Tandoh | Aug 2026, TODO(joel): exact date | Online, Google Meet |
| Draft | Talk | AWS certifications and student opportunities | Sep 2026, TODO(joel): exact date | Online |
| Draft | Build session | First in-person build session | Oct 2026, TODO(joel): exact date | TODO(joel) |
| Draft | Talk | Freshers Onboarding: Introduction to AWS and Cloud Computing | Sat 10 Oct 2026 | Online |
| Draft | Bootcamp | Zero to Cloud Practitioner: kickoff | Sat 17 Oct 2026, 4:30 PM to 6:00 PM | LT5, with CITSA |
| Draft | Build session | From Code to Cloud: Build and Deploy Your First Project on AWS | Sat 14 Nov 2026, 9:30 AM to 1:00 PM | Computer Lab, Science Annex |

Every event's `meetupUrl` is TODO(joel) until the listing link is pasted in.

### Site settings

Seed from the Global table above. `scdPageEnabled` is false.
