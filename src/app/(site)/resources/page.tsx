import type { Metadata } from 'next';
import { Cta } from '@/components/site/Cta';
import { PageIntro } from '@/components/site/PageIntro';
import { ResourceBrowser } from '@/components/site/ResourceBrowser';
import { SectionHead } from '@/components/site/SectionHead';
import { Container } from '@/components/ui/Container';
import { getAllPublicResources, getSiteSettings } from '@/lib/content/queries';
import { curatedResources, type PublicResourceItem } from '@/lib/content/resources';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Official AWS study guides, hands-on workshops and public session links from the AWS Student Builder Group at University of Cape Coast.',
};

export default async function ResourcesPage() {
  const [settings, publicSessionResources] = await Promise.all([getSiteSettings(), getAllPublicResources()]);

  const sessionItems: PublicResourceItem[] = publicSessionResources.map((r) => {
    const shortEvent = r.event.title.split(':')[0];
    return {
      id: `session-${r.id}`,
      title: r.label,
      description: `${r.kind.toLowerCase()} from ${shortEvent} (${formatDate(r.event.startsAt)}).`,
      url: r.url,
      category: 'Session materials',
      source: shortEvent,
      tone: 'mint',
      eventHref: `/events/${r.event.slug}`,
    };
  });

  const items = [...sessionItems, ...curatedResources(settings.builderCenterUrl)];

  return (
    <>
      <section className="band band-top">
        <Container>
          <PageIntro
            label="Learn and practise"
            title="Resources"
            intro="Official AWS guides, hands-on workshops and public links from our sessions. Everything listed here is free to access."
          >
            <dl className="intro-stats">
              <div>
                <dt>Resources</dt>
                <dd>{items.length}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>Free</dd>
              </div>
            </dl>
          </PageIntro>

          <ResourceBrowser items={items} />
        </Container>
      </section>

      <section className="band band-alt" aria-labelledby="portal-materials-title">
        <Container>
          <SectionHead
            label="Builder Portal"
            title="Session slides and study packs"
            id="portal-materials-title"
            action={
              <div className="flex flex-wrap items-center gap-4">
                <Cta href="/builder/sessions" variant="mint">Open the Builder Portal</Cta>
                <Cta href="/certifications" variant="arrow">See certified members</Cta>
              </div>
            }
          >
            Slides, bootcamp study packs, starter repositories and shared exam prep notes from our sessions are kept inside the Builder Portal for
            members. Sign in with Google to access materials from sessions you attend.
          </SectionHead>
        </Container>
      </section>
    </>
  );
}
