import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { getSiteSettings } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Privacy notice' };

// TODO(joel): have this checked against Ghana's Data Protection Act, 2012 (Act 843), and ask UCC whether the group
// must register with the Data Protection Commission, before the builder portal opens to members.
// Everything below describes what the code actually stores; change it if the code changes.
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Who we are',
    body: [
      'The AWS Student Builder Group at University of Cape Coast is a student-led group in the AWS Student Builder Groups program. It is run by students, not by Amazon Web Services or the university.',
    ],
  },
  {
    title: 'What we store when you sign in',
    body: [
      'From Google: your name, your email address, whether Google has verified it, your Google account id, the address of your Google profile photo (which the site does not show), and the sign-in tokens Google issues.',
      'From you: the profile you fill in (name, handle, programme, level, department, interests, a short bio, GitHub and LinkedIn links) and your privacy choices.',
      'From your activity: the sessions you check in at, challenge submissions and reviewer feedback, projects you add, XP and credit history, achievements, rewards you redeem and your notifications.',
      'For security: your session, the time it started, and the IP address and browser your sign-in came from.',
    ],
  },
  {
    title: 'What we never collect',
    body: ['Phone numbers, student ID numbers, dates of birth, home addresses or payment details. RSVPs stay on Meetup, under Meetup’s own terms.'],
  },
  {
    title: 'Who can see it',
    body: [
      'Your profile is private unless you change it. Private means only you and the core team can see it.',
      'If you choose members, signed-in members see your name, handle, programme and interests in the member directory. If you choose public, anyone can see your profile page, your approved projects and your achievements. Search engines list it only if you also allow that.',
      'Your name appears on a challenge leaderboard only if you switch that on. Your email is never shown to other members.',
      'The core team sees member records to run sessions, review work and hand over rewards. Every sensitive change they make is recorded in an audit log.',
    ],
  },
  {
    title: 'Where it is kept',
    body: ['In a PostgreSQL database hosted by Neon, and images in an Amazon S3 bucket. The site runs on AWS Amplify Hosting.'],
  },
  {
    title: 'Your choices',
    body: [
      'Change your profile and visibility at any time from the builder portal.',
      'Download your data as a file from your profile page.',
      'Delete your account from your profile page. That removes your profile, check-ins, submissions, projects, XP, credits and redemptions. We keep a note that a deletion happened, with your email address and account id, so we can show the request was handled. The note does not include your profile or records.',
      'To correct something, such as a missed check-in, send a request from your profile page or email us.',
    ],
  },
];

export default async function PrivacyPage() {
  const { email } = await getSiteSettings();
  return (
    <Section>
      <div className="max-w-[68ch]">
        <h1 className="type-section">Privacy notice</h1>
        <p className="mt-4 text-text-muted">For the public site and the builder portal. Questions go to {email}.</p>
        {SECTIONS.map((section) => (
          <section key={section.title} className="mt-10">
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </Section>
  );
}
