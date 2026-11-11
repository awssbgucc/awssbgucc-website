import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { PageIntro } from '@/components/site/PageIntro';
import { PartnerTile } from '@/components/site/PartnerTile';
import { SectionHead } from '@/components/site/SectionHead';
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
      <section className="band band-top">
        <Container>
          <PageIntro label="Working together" title="Partners" intro="Campus associations and organisations that work with us to bring practical tech skills to more students." />
          {GROUPS.map(({ type, title }) => {
            const group = partners.filter((partner) => partner.type === type);
            if (group.length === 0) return null;
            return (
              <div key={type} className="mt-12 first:mt-0">
                <h2 className="type-label text-text-muted">{title}</h2>
                <div className="partner-row mt-4">
                  {group.map((partner) => <PartnerTile key={partner.id} partner={partner} />)}
                </div>
              </div>
            );
          })}
        </Container>
      </section>
      <section className="band band-alt" aria-labelledby="work-title">
        <Container>
          <SectionHead label="Associations, clubs and organisations" title="Work with us" id="work-title" action={<Cta href={`mailto:${email}`} variant="line">Email the team</Cta>}>
            We work with departmental associations, clubs and organisations that want their members building with AWS. Email us and we will set up a call.
          </SectionHead>
        </Container>
      </section>
    </>
  );
}
