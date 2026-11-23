import type { Metadata } from 'next';
import { CertificationBrowser, type PublicCertificationItem } from '@/components/site/CertificationBrowser';
import { Cta } from '@/components/site/Cta';
import { PageIntro } from '@/components/site/PageIntro';
import { SectionHead } from '@/components/site/SectionHead';
import { Container } from '@/components/ui/Container';
import { getCertifications } from '@/lib/content/queries';
import { formatMonthYear } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Certifications',
  description: 'UCC students in our community who hold verified AWS certifications.',
};

export default async function CertificationsPage() {
  const rows = await getCertifications();
  const items: PublicCertificationItem[] = rows.map((row) => ({
    id: row.id,
    memberName: row.memberName,
    programme: row.programme,
    levelOfStudy: row.levelOfStudy,
    certName: row.certName,
    certCode: row.certCode,
    certLevel: row.certLevel,
    pathway: row.pathway,
    credlyUrl: row.credlyUrl,
    earnedMonth: row.earnedAt ? formatMonthYear(row.earnedAt) : null,
  }));

  const memberCount = new Set(items.map((item) => item.memberName.trim().toLowerCase())).size;

  return (
    <>
      <section className="band band-top">
        <Container>
          <PageIntro
            label="Community milestones"
            title="Certifications"
            intro="UCC students in our community who hold verified AWS certifications, whether earned through our bootcamp, partner training or independent study. Every entry links to its verified Credly badge."
          >
            {items.length > 0 && (
              <dl className="intro-stats">
                <div>
                  <dt>Certified members</dt>
                  <dd>{memberCount}</dd>
                </div>
                <div>
                  <dt>Certifications</dt>
                  <dd>{items.length}</dd>
                </div>
              </dl>
            )}
          </PageIntro>

          {items.length === 0 ? (
            <div className="cert-empty" data-reveal="rise">
              <p className="type-label text-text-muted">Growing directory</p>
              <h2 className="section-title">No verified listings yet</h2>
              <p>
                We are building this directory as certified UCC members share their verified Credly badges with consent. If you are a member of the
                group and hold an AWS certification, send us your badge link to be listed.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Cta href="/contact?topic=general" variant="mint">Share your certification</Cta>
                <Cta href="/resources" variant="line">Exam prep resources</Cta>
              </div>
            </div>
          ) : (
            <CertificationBrowser items={items} />
          )}
        </Container>
      </section>

      <section className="band band-alt" aria-labelledby="cert-submit-title">
        <Container>
          <SectionHead
            label="Get listed"
            title="Earned an AWS certification?"
            id="cert-submit-title"
            action={<Cta href="/contact?topic=general" variant="mint">Submit your Credly link</Cta>}
          >
            Any active UCC AWS SBG member with a current AWS certification can be listed here, whether you prepared through our bootcamp, AmaliTech
            training, or self-study. Listings are added only with your consent and a public Credly verification link.
          </SectionHead>
        </Container>
      </section>
    </>
  );
}
