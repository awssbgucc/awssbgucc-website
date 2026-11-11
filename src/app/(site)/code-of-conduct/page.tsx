import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { getSiteSettings } from '@/lib/content/queries';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'Code of conduct' };

// TODO(joel): review with the core team before the builder portal opens. It applies to sessions and to the portal.
const RULES = [
  ['Respect people', 'No harassment, insults or discrimination, in the room or online. Disagree with ideas, not with people.'],
  ['Submit your own work', 'Credit anyone who helped and any code you reused. Only name teammates who agreed to be named.'],
  ['Keep secrets out', 'Never put AWS keys, passwords or tokens in a repository, a screenshot or a submission.'],
  ['Check in honestly', 'Check in only at sessions you attend. Sharing the code with people outside the room is cheating, and the record will be removed.'],
  ['Mind the cost', 'Clean up the AWS resources you create in a lab. Nobody should get a surprise bill.'],
  ['Follow the event terms', 'Events follow the AWS Event Terms and Conditions.'],
];

export default async function CodeOfConductPage() {
  const { email } = await getSiteSettings();
  return (
    <Section>
      <div className="max-w-[68ch]">
        <h1 className="type-section">Code of conduct</h1>
        <p className="mt-4 text-text-muted">For everyone at our sessions and in the builder portal.</p>
        <dl className="mt-10 border-t border-border">
          {RULES.map(([title, body]) => (
            <div key={title} className="grid gap-2 border-b border-border py-5 sm:grid-cols-[200px_1fr] sm:gap-8">
              <dt className="font-semibold text-white">{title}</dt>
              <dd className="text-text-muted">
                {body}
                {title === 'Follow the event terms' && (
                  <>
                    {' '}
                    <a href={AWS_EVENT_TERMS_URL} className="underline underline-offset-4">
                      Read them
                    </a>
                    .
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-10 text-lg font-semibold text-white">If something goes wrong</h2>
        <p className="mt-3 text-text-muted">
          Tell any member of the core team, or email {email}. The team can remove submissions, check-ins and rewards, and suspend accounts. Every such action is recorded.
        </p>
      </div>
    </Section>
  );
}
