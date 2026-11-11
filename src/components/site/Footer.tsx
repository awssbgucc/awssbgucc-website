import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getSiteSettings } from '@/lib/content/queries';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';
import { Logo } from './Logo';
import { navLinks } from './nav-links';

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="type-label text-text-muted">{title}</h2>
      <ul className="mt-3">
        {links.map(({ href, label }) => (
          <li key={label}>
            {href.startsWith('/') ? <Link href={href} className="footer-link">{label}</Link> : <a href={href} className="footer-link">{label}</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const s = await getSiteSettings();
  const connect = [
    { href: s.meetupUrl, label: 'Meetup' },
    { href: s.whatsappUrl, label: 'WhatsApp' },
    { href: s.linkedinUrl, label: 'LinkedIn' },
    { href: s.instagramUrl, label: 'Instagram' },
    { href: s.xUrl, label: 'X' },
    { href: `mailto:${s.email}`, label: 'Email' },
  ].filter((link): link is { href: string; label: string } => !!link.href);

  return (
    <footer className="site-footer">
      <div className="footer-steps" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <Container>
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo size="large" />
            <p>Students at the University of Cape Coast, learning by building, together.</p>
            <p className="font-display text-xs text-text-muted">5.10 N  1.25 W / Cape Coast, Ghana</p>
          </div>
          <Column title="Group" links={[...navLinks(s.scdPageEnabled), { href: '/partners', label: 'Partners' }, { href: '/contact', label: 'Contact' }]} />
          <Column title="Members" links={[{ href: '/builder', label: 'Builder Portal' }, { href: '/code-of-conduct', label: 'Code of conduct' }, { href: '/privacy', label: 'Privacy notice' }]} />
          <Column title="Connect" links={connect} />
          <Column
            title="Learn on AWS"
            links={[
              { href: 'https://skillbuilder.aws', label: 'AWS Skill Builder' },
              { href: s.builderCenterUrl, label: 'AWS Builder Center' },
              { href: 'https://aws.amazon.com/certification/', label: 'AWS Certification paths' },
            ]}
          />
        </div>
        <div className="footer-legal">
          <p className="max-w-[62ch]">
            A student-led group in the AWS Student Builder Groups program. Run by students at the University of Cape Coast, not by Amazon Web Services.
          </p>
          <a href={AWS_EVENT_TERMS_URL} className="footer-link">
            AWS Event Terms and Conditions
          </a>
          <p>© 2026 AWS Student Builder Group at University of Cape Coast</p>
        </div>
      </Container>
    </footer>
  );
}
