import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/PageIntro';
import { PartnerTile } from '@/components/site/PartnerTile';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { getPartners, getSiteSettings } from '@/lib/content/queries';
import type { PartnerType } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Partners' };

const GROUPS: { type: PartnerType; title: string }[] = [
  { type: 'CAMPUS', title: 'Campus partners' },
  { type: 'SPONSOR', title: 'Sponsors' },
  { type: 'COMMUNITY', title: 'Community partners' },
];

export default async function PartnersPage() {
  const [partners, { email }] = await Promise.all([getPartners(), getSiteSettings()]);
  return (
    <>
      <Section>
        <PageIntro
          title="Partners"
          intro="Campus associations and organisations that work with us to bring cloud skills to more students."
        />
        {GROUPS.map(({ type, title }) => {
          const group = partners.filter((partner) => partner.type === type);
          if (group.length === 0) return null;
          return (
            <div key={type} className="mt-10 first:mt-0">
              <h2 className="text-lg font-semibold">{title}</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {group.map((partner) => (
                  <PartnerTile key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          );
        })}
      </Section>
      <Section alt>
        <h2 className="type-section">Work with us</h2>
        <p className="mt-4 max-w-[62ch]">
          We work with departmental associations, clubs and organisations that want their members building on AWS. Email us
          and we will set up a call.
        </p>
        <Button href={`mailto:${email}`} className="mt-8">
          Email the team
        </Button>
      </Section>
    </>
  );
}
