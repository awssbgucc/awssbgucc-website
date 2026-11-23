import type { Metadata } from 'next';
import { Cta } from '@/components/site/Cta';
import { PageIntro } from '@/components/site/PageIntro';
import { UnsubscribePanel } from '@/components/site/UnsubscribePanel';
import { Container } from '@/components/ui/Container';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Newsletter preferences',
  robots: { index: false, follow: false },
};

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0] ?? '*'}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export default async function NewsletterUnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  const subscriber = token ? await db.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } }) : null;

  return (
    <section className="band band-top">
      <Container>
        <PageIntro
          label="Mailing list"
          title="Newsletter"
          intro="Manage email updates from the AWS Student Builder Group at University of Cape Coast."
        />
        {!subscriber ? (
          <div className="cert-empty">
            <p className="type-label text-text-muted">Invalid link</p>
            <h2 className="section-title">Subscription link not found</h2>
            <p>This unsubscribe link is incomplete or no longer active. If you still want us to remove your email, send us a message.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Cta href="/contact" variant="mint">
                Contact the team
              </Cta>
              <Cta href="/" variant="line">
                Back to home
              </Cta>
            </div>
          </div>
        ) : (
          <UnsubscribePanel token={subscriber.unsubscribeToken} maskedEmail={maskEmail(subscriber.email)} initialStatus={subscriber.status} />
        )}
      </Container>
    </section>
  );
}
