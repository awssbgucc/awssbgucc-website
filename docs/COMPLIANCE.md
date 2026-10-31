# Compliance

These rules come from the AWS Student Builder Group Leader Handbook, the AWS Student Community Day Playbook, and the public AWS Trademark Guidelines (updated 17 July 2026). Do not change anything here without Joel's sign-off.

## What the program allows

- The handbook says leaders may create social media accounts and websites for their group.
- Use the official Student Builder Group logo from the Leader's Library on Box. A custom group logo is the official logo with the campus name at the bottom: "University of Cape Coast".
- Do not present the group as an AWS employee group.
- The SCD Playbook says logos and fonts are provided in Box, logos must not be recoloured or stretched, and the primary font is Amazon Ember.

## Rules for this codebase

### Logos

1. Use only the logo files from Box, placed in `public/brand/`. Never redraw, recolour, stretch, crop, add effects to, or animate them. The one exception is the pixel chip in rule 4.
2. Never use the standalone AWS smile logo or the "Powered by AWS" logo. We have no licence for them.
3. The SBG logo appears in the nav lockup and the footer. It is never larger than the content around it and never used as a background pattern.
4. The pixel chip in `assets/pixel-art/sbg-chip.json` traces the official logo cell for cell. It may appear only on the 404 and admin sign-in pages, in the logo purple, at its exact proportions, static. It never stands in for the logo in the nav, footer, metadata or social images.

### UCC crest

5. The University of Cape Coast crest belongs to the university. The pixel version is a modified form of it, so it needs the university's approval before it goes live.
   - **TODO(joel):** ask UCC (the Directorate of Public Affairs or whichever office manages the university's identity) in writing. Show them `assets/pixel-art/ucc-crest-preview.png`.
   - The crest renders only when the `uccCrestApproved` setting is on. It ships off.
6. The crest only ever signals where the group is based. Never place it next to sponsor logos, and never write anything that implies the university runs or endorses the group, unless that becomes true.

### Naming

7. The group's name is "AWS Student Builder Group at University of Cape Coast". Short form in running text: "AWS SBG UCC". Do not invent other variants.
8. The Community Day is "AWS Student Builder Groups Student Community Day Cape Coast", capitalised exactly like that, as the Playbook requires. Short form after first mention: "Student Community Day".
9. AWS product names are written in full and correctly: Amazon S3, AWS Lambda, AWS Builder Center, AWS Skill Builder. Never "Builder Centre", never "S3 bucket service".

### Look and feel

10. The AWS Trademark Guidelines forbid imitating the look and feel of any AWS website, including its branding, colour combinations, fonts and graphic designs. So: no copy of the AWS or Builder Center header, nav, footer or page chrome; no AWS product icons; no orange AWS accent. Our own layout using the SBG program identity is fine.

### Affiliation wording

11. Footer line, exactly: "A student-led group in the AWS Student Builder Groups program. Run by students at the University of Cape Coast, not by Amazon Web Services."
12. Never write "official AWS website", "powered by AWS", "sponsored by AWS", "endorsed by AWS", or "AWS partner". Never list AWS as a sponsor, unless AWS formally sponsors a specific event and that is confirmed in writing.
13. When describing what AWS provides, state the fact plainly: "Members get free access to AWS Skill Builder courses."

### Domain

14. The trademark guidelines say no domain name containing an AWS mark, and no AWS mark in a subdomain. So not `awssbgucc.com` and not `aws.something.com`.
    - Options without the mark: `sbgucc.com`, `uccbuilders.com`, or a page under a UCC domain if the department will host one.
    - Some groups use "aws" in their domain anyway. **TODO(joel):** ask the program team whether SBG sites have an exception before buying anything.
15. AWS marks may appear in URL paths for AWS-related content, for example `/events/intro-to-amazon-s3`.

### Events and links

16. Every public event page links to the AWS Event Terms: https://aws.amazon.com/events/terms/
17. Every event links to its Meetup listing. The site never takes RSVPs itself, because events must be on Meetup to count.
18. The Builder Center sign-up button always uses the group leader's tracked link, stored in Site Settings, never a bare builder.aws.com link.

### Content boundaries

19. No selling of products or services, and no competitor cloud content on any page, matching the handbook's event rules.
20. Sponsors appear as logos with a link and a short line about what they provided. Never tie a sponsor to students opening accounts or buying products.
21. Public bootcamp copy states the schedule and the goal only. Do not publish total week counts or planned breaks.

### Social sharing images

22. Social media posts about the program must be made with the Brand Asset Generator. That rule covers social posts, not the website. Open Graph images for the site are generated from our own tokens and must not imitate the generator's templates.

## Program documents to check against

- AWS Student Builder Group Leader Handbook (Branding Guidelines section)
- AWS Student Community Day Playbook (Branding and Design, Event Website and Promotions)
- AWS Trademark Guidelines: https://aws.amazon.com/trademark-guidelines/
- Questions on trademark use: trademarks@amazon.com, or the group's AWS program contact first
