# Community content inventory

Structured facts from `COMMUNITY_SOURCE_ARCHIVE.md` (sources S1 to S16). Reference date for upcoming and completed: Wed 11 Nov 2026. Reviewed 11 Nov 2026.

States used below:

- **Confirmed**: stated by a first-party source (our own LinkedIn post or Meetup listing).
- **Completed**: a recap or the Meetup "Went" listing shows it happened.
- **Announced**: planned or promised in a source, with no evidence yet that it happened.
- **Derived**: worked out from sources (for example a date from "last Saturday"). Needs a quick confirmation before it is published as fact.
- **Conflict**: sources disagree. The website follows the source named in the row and says so where it matters.
- **Missing**: not in any source. The website renders nothing in its place.

How this reaches the website: `content/community-history.json` holds the reviewed records with these states. The import script copies them into a database as drafts, and only publishes records marked `verified` in a local preview database. The admin dashboard is where anything is published for real. See `docs/research/CONTENT_PIPELINE.md`.

## Activities

### A1. Launch: Your Cloud Journey Starts Here

| Field | Value | State | Source |
|---|---|---|---|
| Title | AWS Student Builder Group UCC Launch: Your Cloud Journey Starts Here | Confirmed | S11 |
| Short title on LinkedIn and flyer | AWS SBG UCC Launch: Your Cloud Journey Starts Here | Confirmed | S7, S12 |
| Date and start | Sat 22 Aug 2026, 8:00 PM GMT | Confirmed | S7, S11 |
| End time | Not given anywhere | Missing | |
| Where | Online, Google Meet | Confirmed | S7, S11 |
| Cost | Free | Confirmed | S7, S11 |
| Guest speaker | Isaac Tandoh, AWS Cloud Trainer and DevOps Engineer | Confirmed | S7, S11, flyer |
| Also contributed | Matthew Ntsiful, shared experience and encouragement | Completed | S6 |
| Planned agenda | Welcome; meet the core team; what cloud computing is; cloud and AWS in the real world; starting out; live Q&A; how to get involved | Announced | S11 |
| What the recap confirms | Group introduced; why it exists and what is planned; cloud fundamentals; practical insights on AWS and DevOps; how to start | Completed | S6 |
| Meetup | events/316142878 | Confirmed | S16 |
| RSVPs on Meetup | 54 | Confirmed as RSVPs, not attendance | S11 |
| Flyer | `Laucnh and evet 1.png` | Confirmed | S12 |

Website: published Event record. The end time is unknown, so the record stores the end equal to the start, which the site reads as "no end time published" and shows the start time only. No RSVP figure is shown.

### A2. Building Your AWS Career: Certifications, Career Paths & Opportunities

| Field | Value | State | Source |
|---|---|---|---|
| Date and time | Sat 26 Sep 2026, 8:00 PM to 9:30 PM GMT | Confirmed | S9 |
| Where | Online, Google Meet | Confirmed | S5, S9 |
| Order | "our second official event" | Confirmed | S4, S5, S9 |
| Guest speaker | Nathaniel Agbenyenu | Confirmed | S4, S5, S9 |
| Speaker title | S9: Senior DevOps Engineer, Cloud Security and FinOps Lead at IT Consortium; Co-Lead, AWS User Group Accra. S5 and flyer: Cloud Security Engineer, Co-Lead AWS User Group Accra | Conflict: the site uses S9, the newest and fullest | S5, S9, S12 |
| Planned agenda | Certification pathway from Foundational to Associate, Professional and Specialty; career insights; free learning resources; live Q&A | Announced | S9 |
| What the recap confirms | Certifications, career paths, skills beyond certifications, student opportunities. Certifications are part of the path, not the goal. Closing line from Nathaniel: "We don't give up over here." | Completed | S4 |
| Hosts on Meetup | Opoku Evans, Kelvin Opoku (Event Organizer), Joel Anarba Amuni (Co-organizer) | Confirmed | S9 |
| RSVPs | 63 on the event page, 61 on the group list | Conflict; RSVPs are not attendance, not shown | S9, S11 |
| Meetup | events/316677261 | Confirmed | S16 |
| Flyer | `Building Your AWS Career Certifications, Career Paths & Opportunities.png` | Confirmed | S12 |

### A3. Freshers Onboarding: Introduction to AWS & Cloud Computing

| Field | Value | State | Source |
|---|---|---|---|
| Title | AWS SBG UCC Freshers Onboarding: Introduction to AWS & Cloud Computing | Confirmed | S10 |
| Date and time | Sat 10 Oct 2026, 7:00 PM to 8:30 PM GMT | Confirmed | S10 |
| Where | Online. The page does not name the platform | Confirmed, platform missing | S10 |
| Facilitators | Kelvin Opoku and Evans Opoku, core team | Completed | S3 |
| Planned agenda | What cloud computing is; what AWS is; why cloud skills matter; certifications and careers; a simple live demo; introduction to the group; getting started with AWS Builder Center; what is next; Q&A | Announced | S10 |
| What the recap confirms | New members welcomed; community vision and opportunities introduced; cloud fundamentals explained with analogies and real examples | Completed | S3 |
| Who it was for | Freshers and new members; all UCC students interested in AWS, cloud, AI, software development, DevOps or technology | Confirmed | S10 |
| RSVPs | 0 on the event page snapshot, 51 on the group list | Conflict; not shown | S10, S11 |
| Meetup | events/316888223 | Confirmed | S16 |
| Flyer | `EVENT3.png` | Confirmed; published on Joel's approval, 11 Nov 2026 | S12 |

### A4. Zero to Cloud Practitioner bootcamp

| Field | Value | State | Source |
|---|---|---|---|
| Kickoff | Sat 17 Oct 2026 | Completed | S2, Z2C flyer |
| Collaborator | Computer Science and Information Technology Student Association, UCC (CITSA) | Confirmed | S2 |
| Schedule | Saturdays, 4:30 PM to 6:00 PM, LT5 | Confirmed | S2 |
| Goal | Cloud fundamentals and AWS, preparing for the AWS Certified Cloud Practitioner exam (CLF-C02), with practical sessions | Confirmed | S2 |
| Length | 12 weeks | Confirmed; publishing approved by Joel, 11 Nov 2026 | S2, S12, Joel |
| Voucher terms | Consistent attendance and 70% or higher on the AWS Skill Builder practice exam makes a participant eligible for a voucher at the end | Confirmed by Joel, 11 Nov 2026; on the site | S2, Joel |
| Registration | https://lnkd.in/dQmXU9Qp (not a Meetup listing) | Confirmed | S2 |
| Meetup listing | Not needed | Joel, 11 Nov 2026: the bootcamp is a programme, with no individual event listing | Joel |

Website: a programme on the home, events and about pages, with schedule, length, goal, voucher terms and its flyer. There is no Event record for it.

#### A4.2 Bootcamp, week 2

Only evidence: five photographs whose filenames start `20261024`, Sat 24 Oct 2026 (Derived). No text source. Topic: Missing. Used as general bootcamp photographs, never captioned with a topic.

#### A4.3 Bootcamp, week 3: first website on Amazon S3

| Field | Value | State | Source |
|---|---|---|---|
| Date | Sat 31 Oct 2026: "Last Saturday" in a post read about six days later, and matching photo filenames | Derived | S1, S13 |
| Concepts | Compute and storage, with real-life examples | Completed | S1 |
| Lab | Every participant deployed a Hostel Finder website on Amazon S3 | Completed, as reported by the group | S1 |
| Problems met | Configurations and bucket policies, solved by troubleshooting and helping each other | Completed | S1 |
| Close | Kahoot quiz on the first three weeks; podium finishers received AWS swag | Completed | S1 |
| Photo evidence | Kahoot screen titled "AWS Cloud Computing & Security Basics"; three prize handovers; students at laptops, one with a website on screen | Matches S1 | S13 |

Website: a recap post ("Our first website on Amazon S3") and the "Inside the bootcamp" sequence on the home page, using the 31 Oct photographs. Participant names and the website itself are not shown: none were supplied.

#### A4.4 Bootcamp, week 4: Amazon EC2 and AWS Lambda

"This coming Saturday", so Sat 7 Nov 2026 (Derived). Announced only. Not shown as completed anywhere.

### A5. From Code to Cloud: Build and Deploy Your First Project on AWS

| Field | Value | State | Source |
|---|---|---|---|
| Date and start | Sat 14 Nov 2026, 9:30 AM GMT | Confirmed | S9, S11, S14, flyer |
| End | 1:00 PM (flyer); the Meetup listing showed noon | Confirmed by Joel, 11 Nov 2026 | flyer, Joel |
| Venue | Computer Lab, New Science Annex, UCC (the Meetup listing showed the lecture theatre) | Confirmed by Joel, 11 Nov 2026 | flyer, Joel |
| Plan | Personal portfolio on Amazon S3; reading errors and fixing permissions; AI coding tool demonstration | Announced | S14 |
| Facilitator | Not named | Missing | |
| Meetup | events/317174221 | Confirmed | S16 |
| Status on 11 Nov 2026 | Upcoming, three days away | | |
| Flyer | `Event4.jpeg` | Confirmed; matches the confirmed time and room | S12 |

## Milestones

| Milestone | State | Source |
|---|---|---|
| Group announced, inviting founding members; official membership through Meetup | Completed | S8 |
| Launch, 22 Aug 2026, "Day One" | Completed | S6, S7 |
| Second event, careers, 26 Sep 2026 | Completed | S4 |
| Freshers onboarding, 10 Oct 2026 | Completed | S3 |
| Bootcamp kickoff with CITSA, 17 Oct 2026 | Completed | S2 |
| First website deployment in the bootcamp, 31 Oct 2026 | Completed (date derived) | S1 |
| First in-person build session, 14 Nov 2026 | Announced | S14 |
| Meetup group: 286 members, 4.6 from 9 ratings, one of 2,326 groups | Snapshot, not dated | S11 |
| LinkedIn: 223 followers | Snapshot | archive header |

Counts are not hard-coded anywhere on the site. Member count lives in Site settings and shows only when an admin enters it.

## People

| Person | Role in the sources | Source | On the website |
|---|---|---|---|
| Kelvin Opoku | Core team; Meetup "Event Organizer"; freshers facilitator | S3, S9 | Named as freshers facilitator in event copy. Team card only once an admin adds and activates it |
| Evans Opoku (Meetup: Opoku Evans) | Core team; freshers facilitator | S3, S9 | As above |
| Joel Anarba Amuni | Meetup co-organizer | S9 | Team card only via admin |
| Isaac Tandoh | Launch guest speaker, AWS Cloud Trainer and DevOps Engineer | S6, S7 | Named in launch event copy |
| Matthew Ntsiful | Contributed at the launch | S6 | Named in launch event copy |
| Nathaniel Agbenyenu | Career talk guest speaker | S4, S5, S9 | Named in career event copy |
| Jenna Rosenblum, Lisa Bagley | Tagged in posts | S1 to S8 | Not named: their roles are not stated in the sources |

## Organisations

| Organisation | Relationship | Source |
|---|---|---|
| CITSA, Computer Science and Information Technology Student Association, UCC | Bootcamp collaborator | S2 |
| AWS User Group Accra | Speaker's community (Nathaniel is Co-Lead), not a collaborator | S5, S9 |
| IT Consortium | Speaker's employer, not a collaborator | S9 |
| AWS Developers, Amazon Web Services | Tagged; the group is part of the AWS Student Builder Groups programme. Not a sponsor (COMPLIANCE rule 12) | S1 to S8 |

## Technical subjects

| Subject | Evidence | State |
|---|---|---|
| Cloud computing fundamentals | Launch, freshers, bootcamp | Covered (S2, S3, S6) |
| AWS certifications and cloud careers | Career talk; bootcamp exam preparation | Covered (S2, S4) |
| Compute and storage concepts | Bootcamp week 3 | Covered (S1) |
| Static website hosting on Amazon S3, bucket policies | Bootcamp week 3; From Code to Cloud plan | Covered (S1); planned again (S14) |
| DevOps | Launch insights from Isaac Tandoh | Discussed (S6) |
| Security basics | Kahoot title "AWS Cloud Computing & Security Basics" | Touched on, photo evidence only (S13) |
| Amazon EC2, AWS Lambda | Bootcamp week 4 plan | Announced (S1) |
| AI coding tools | From Code to Cloud plan | Announced (S14) |
| Artificial intelligence, business analytics, digital transformation, software development | Named as interests in the group announcement and event listings | Interest only (S6, S8, S10) |
| Data engineering, mobile, systems architecture, generative AI and agents, hackathons | Not in any source | Interest areas from the AWS SBG programme brief; shown as open to explore, never as run |

## AWS services and tools named

Amazon S3 (S1, S14); Amazon EC2 and AWS Lambda (S1, announced); AWS Skill Builder (S2); AWS Certified Cloud Practitioner, CLF-C02 (S2); AWS Builder Center (S10); AWS certification levels Foundational, Associate, Professional, Specialty (S9); Kahoot (S1, not AWS).

## Links

| Link | Use | Source |
|---|---|---|
| https://www.meetup.com/aws-sbg-at-university-of-cape-coast/ | Official membership and RSVPs | S8, S11 |
| https://linktr.ee/awsucc | All channels | S1 to S8 |
| https://www.linkedin.com/company/aws-ucc/ | LinkedIn page | archive header |
| https://lnkd.in/dfW3PpwF | WhatsApp community (short link, destination not checked) | S7 |
| https://lnkd.in/dQmXU9Qp | Bootcamp registration (short link) | S2 |

## Voice

Phrases the group itself uses, which the site can echo: "Come build with us." "Come learn. Come build. Come connect." "Learn. Build. Connect." "You don't have to know everything before you start." "No prior AWS or cloud experience is required." "Day One is officially in the books. Now, we build!" The tone is warm, direct and encouraging, with no hard sell.

<!-- check-copy:off -->
Phrases from the sources that the copy rules ban, and so are not reused: "next generation of builders", "transforming industries", "cloud journey" used as a metaphor, emojis, and the styled Unicode lettering.
<!-- check-copy:on -->

## Open questions for Joel

Answered on 11 Nov 2026: From Code to Cloud runs 9:30 AM to 1:00 PM in the Computer Lab, New Science Annex; the bootcamp is 12 weeks with vouchers and needs no event listing; everything is published; the team is added later through the admin.

Still open:

1. Launch end time, if Meetup still shows it.
2. Freshers platform: Google Meet or another tool?
3. Did week 4 (Amazon EC2 and AWS Lambda) take place on 7 Nov?
