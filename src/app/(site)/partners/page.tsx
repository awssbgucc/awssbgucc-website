import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { PageIntro } from '@/components/site/PageIntro';
import { PartnerTile } from '@/components/site/PartnerTile';
import { SectionHead } from '@/components/site/SectionHead';
import { getPartners } from '@/lib/content/queries';
import type { PartnerType } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Partners', description: 'The student associations and organisations the AWS Student Builder Group at University of Cape Coast works with.' };

const GROUPS: { type: PartnerType; title: string }[] = [
  { type: 'CAMPUS', title: 'Campus partners' },
  { type: 'SPONSOR', title: 'Sponsors' },
  { type: 'COMMUNITY', title: 'Community partners' },
];

export default async function PartnersPage() {
  const partners = await getPartners();
  return (
    <>
      <section className="band band-top">
        <Container>
          <PageIntro label="Working together" title="Partners" intro="The student associations, companies and organisations we collaborate with to support student builders at the University of Cape Coast." />
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
          <SectionHead label="Associations, companies and organisations" title="Work with us" id="work-title" action={<Cta href="/contact?topic=partnership" variant="mint">Contact the team</Cta>}>
            We collaborate with campus associations, tech companies and external organisations that want to support students learning AWS and cloud
            computing. Send us a message to discuss a joint session, sponsorship or partnership.
          </SectionHead>
        </Container>
      </section>
    </>
  );
}
