import { Link } from '@/components/site/motion/TransitionLink';
import { Container } from '@/components/ui/Container';
import { AppearanceRow } from '@/components/ui/ThemeSelector';
import { getSiteSettings } from '@/lib/content/queries';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';
import { Logo } from './Logo';
import { SocialIcon, type SocialKind } from './SocialIcons';

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="type-label text-text-muted">{title}</h2>
      <ul className="mt-2.5">
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
  const socials: { kind: SocialKind; href: string; label: string }[] = [
    { kind: 'meetup', href: s.meetupUrl, label: 'Meetup' },
    ...(s.linkedinUrl ? [{ kind: 'linkedin' as const, href: s.linkedinUrl, label: 'LinkedIn' }] : []),
    ...(s.instagramUrl ? [{ kind: 'instagram' as const, href: s.instagramUrl, label: 'Instagram' }] : []),
    ...(s.xUrl ? [{ kind: 'x' as const, href: s.xUrl, label: 'X' }] : []),
    ...(s.whatsappUrl ? [{ kind: 'whatsapp' as const, href: s.whatsappUrl, label: 'WhatsApp' }] : []),
    { kind: 'email', href: `mailto:${s.email}`, label: `Email ${s.email}` },
  ];

  const communityLinks = [
    { href: '/about', label: 'About' },
    { href: '/events', label: 'Events' },
    ...(s.scdPageEnabled ? [{ href: '/scd', label: 'Community Day' }] : []),
    { href: '/team', label: 'Team' },
    { href: '/partners', label: 'Partners' },
    { href: '/contact', label: 'Contact' },
  ];

  const exploreLinks = [
    { href: '/projects', label: 'Projects' },
    { href: '/resources', label: 'Resources' },
    { href: '/certifications', label: 'Certifications' },
    { href: '/blog', label: 'Writing' },
    { href: '/builder', label: 'Builder Portal' },
  ];

  const policyLinks = [
    { href: 'https://skillbuilder.aws', label: 'AWS Skill Builder' },
    { href: s.builderCenterUrl, label: 'AWS Builder Center' },
    { href: 'https://aws.amazon.com/certification/', label: 'AWS Certification paths' },
    { href: '/code-of-conduct', label: 'Code of conduct' },
    { href: '/privacy', label: 'Privacy notice' },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-steps" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <Container>
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo size="large" />
            <p>Online talks with people in the industry, training bootcamps and hands-on sessions on campus. Free, and open to students in every department.</p>
            <div className="footer-meta">
              <p className="font-display text-xs text-text-muted">5.10 N  1.25 W / Cape Coast, Ghana</p>
              <a href={`mailto:${s.email}`} className="footer-email">{s.email}</a>
            </div>
            <ul className="footer-socials" aria-label="Social links">
              {socials.map(({ kind, href, label }) => (
                <li key={kind}>
                  <a
                    href={href}
                    aria-label={label}
                    title={label}
                    className="footer-social-link"
                    {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <SocialIcon kind={kind} size={17} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Column title="Community" links={communityLinks} />
          <Column title="Explore" links={exploreLinks} />
          <Column title="AWS and policies" links={policyLinks} />
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">
            <p className="max-w-[62ch]">
              An independent, student-led community at the University of Cape Coast, part of the AWS Student Builder Groups program.
            </p>
            <div className="footer-legal-row">
              <p>© 2026 AWS Student Builder Group at University of Cape Coast</p>
              <a href={AWS_EVENT_TERMS_URL} className="footer-terms-link">
                AWS Event Terms and Conditions
              </a>
            </div>
          </div>
          <AppearanceRow className="footer-appearance" />
        </div>
      </Container>
    </footer>
  );
}
