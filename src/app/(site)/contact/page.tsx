import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { ContactForm, CopyEmailButton } from '@/components/site/ContactForm';
import { Link } from '@/components/site/motion/TransitionLink';
import { PageIntro } from '@/components/site/PageIntro';
import { SocialIcon, type SocialKind } from '@/components/site/SocialIcons';
import { Container } from '@/components/ui/Container';
import { getSiteSettings } from '@/lib/content/queries';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the AWS Student Builder Group at University of Cape Coast about partnerships, speaking, sponsorships or general enquiries.',
};

const PARTNER_WAYS = [
  { tone: 'mint', title: 'Campus associations and clubs', text: 'Co-hosting introductory cloud sessions, bootcamps and labs for students in your department or club.' },
  { tone: 'blue', title: 'Companies and industry teams', text: 'Sharing practical cloud experience through guest talks, technical workshops and student build days.' },
  { tone: 'purple', title: 'Sponsors and supporters', text: 'Supporting bootcamps, build sessions, swag or Student Community Day at the University of Cape Coast.' },
] as const;

export default async function ContactPage() {
  const s = await getSiteSettings();
  const rawChannels: { kind: SocialKind; label: string; note: string; href: string | null }[] = [
    { kind: 'meetup', label: 'Meetup', note: 'Event announcements and RSVPs', href: s.meetupUrl },
    { kind: 'whatsapp', label: 'WhatsApp community', note: 'Campus updates and reminders', href: s.whatsappUrl },
    { kind: 'linkedin', label: 'LinkedIn', note: 'Recaps and community news', href: s.linkedinUrl },
    { kind: 'instagram', label: 'Instagram', note: 'Event photos and updates', href: s.instagramUrl },
    { kind: 'x', label: 'X', note: 'Announcements', href: s.xUrl },
  ];
  const channels = rawChannels.filter((c): c is { kind: SocialKind; label: string; note: string; href: string } => !!c.href);

  return (
    <>
      <section className="band band-top">
        <Container>
          <PageIntro
            label="Get in touch"
            title="Contact"
            intro="Reach the core team about partnerships, speaking at a session, sponsoring an event or general enquiries."
          />

          <div className="contact-layout">
            <ContactForm fallbackEmail={s.email} />

            <aside className="contact-sidebar" aria-label="Direct contact details">
              <div className="contact-info-box">
                <div className="contact-info-cell">
                  <p className="type-label text-text-muted">Direct email</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <a href={`mailto:${s.email}`} className="font-display text-lg break-all text-text-strong underline underline-offset-4">
                      {s.email}
                    </a>
                    <CopyEmailButton email={s.email} />
                  </div>
                </div>
                <div className="contact-info-cell">
                  <p className="type-label text-text-muted">Location</p>
                  <p className="mt-2 text-text-strong">University of Cape Coast, Ghana</p>
                  <p className="mt-1 font-display text-xs text-text-muted">5.10 N  1.25 W</p>
                </div>
              </div>

              <div className="contact-card">
                <p className="type-label text-lime">Call for partners</p>
                <h2 className="contact-side-title">Partner with us</h2>
                <p>
                  We are inviting campus associations, tech companies and external organisations to collaborate with our student community at UCC.
                </p>
                <ul className="contact-partner-list">
                  {PARTNER_WAYS.map((item) => (
                    <li key={item.title}>
                      <span className={`swatch swatch-${item.tone}`} aria-hidden="true" />
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {channels.length > 0 && (
                <div className="contact-channels">
                  <p className="type-label text-text-muted">Other channels</p>
                  <ul>
                    {channels.map((c) => (
                      <li key={c.label}>
                        <a href={c.href} {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                          <span className="flex items-center gap-3.5">
                            <span className="text-text-muted">
                              <SocialIcon kind={c.kind} size={18} />
                            </span>
                            <span>
                              <span className="block font-medium text-text-strong">{c.label}</span>
                              <span className="block text-sm text-text-muted">{c.note}</span>
                            </span>
                          </span>
                          <ArrowUpRight size={18} aria-hidden className="shrink-0 text-text-muted" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-text-muted">
                Looking for quick answers about membership, laptops or bootcamp vouchers?{' '}
                <Link href="/about#faq" className="text-text-strong underline underline-offset-4">
                  Read our FAQs
                </Link>
                .
              </p>

              <p className="text-sm text-text-muted">
                An independent, student-led community in the AWS Student Builder Groups program. For questions about AWS products, billing or account access, please contact AWS Support directly.
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
