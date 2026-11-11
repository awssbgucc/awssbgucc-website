import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/PageIntro';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { getSiteSettings } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Contact' };

export default async function ContactPage() {
  const s = await getSiteSettings();
  const channels = [
    { label: 'Meetup', note: 'Every event, and the RSVP for it', href: s.meetupUrl },
    { label: 'WhatsApp community', note: 'Updates on campus', href: s.whatsappUrl },
    { label: 'LinkedIn', note: null, href: s.linkedinUrl },
    { label: 'Instagram', note: null, href: s.instagramUrl },
    { label: 'X', note: null, href: s.xUrl },
  ].filter((c): c is { label: string; note: string | null; href: string } => !!c.href);

  return (
    <section className="band band-top">
      <Container>
      <PageIntro label="Get in touch" title="Contact" intro="The quickest way to reach the core team is email. For events and RSVPs, use Meetup." />
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="type-label text-text-muted">Email</p>
          <a href={`mailto:${s.email}`} className="mt-2 inline-flex min-h-11 items-center font-display text-xl break-all text-white underline underline-offset-4">
            {s.email}
          </a>
          <ul className="mt-10 border-t border-border">
            {channels.map((c) => (
              <li key={c.label} className="border-b border-border">
                <a href={c.href} className="flex min-h-14 items-center justify-between gap-4 py-3 underline-offset-4 hover:underline">
                  <span className="font-medium text-white">{c.label}</span>
                  {c.note && <span className="text-right text-sm text-text-muted">{c.note}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="contact-card">
            <h2 className="section-title">Work with us</h2>
            <p className="mt-3 text-text-muted">
              We work with departmental associations, clubs and organisations that want their members building with AWS. Email us and we will set up a call.
            </p>
            <Button href={`mailto:${s.email}`} className="mt-6">
              Email the team
            </Button>
          </div>
          <p className="mt-6 text-sm text-text-muted">
            A student-led group in the AWS Student Builder Groups program. For questions about AWS products or accounts, contact AWS directly; we cannot help with billing or account access.
          </p>
        </div>
      </div>
      </Container>
    </section>
  );
}
