import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getSiteSettings } from '@/lib/content/queries';
import { AWS_EVENT_TERMS_URL } from '@/lib/site';
import { Logo } from './Logo';
import { NAV_LINKS } from './nav-links';

const LINK = 'inline-flex min-h-11 items-center text-sm text-text-muted underline-offset-4 hover:underline';

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-2">
        {links.map(({ href, label }) => (
          <li key={label}>
            {href.startsWith('/') ? (
              <Link href={href} className={LINK}>
                {label}
              </Link>
            ) : (
              <a href={href} className={LINK}>
                {label}
              </a>
            )}
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
    <footer className="border-t border-border bg-bg py-16">
      <Container>
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
          </div>
          <Column title="Group" links={NAV_LINKS} />
          <Column title="Connect" links={connect} />
          <Column
            title="AWS learning"
            links={[
              { href: 'https://skillbuilder.aws', label: 'AWS Skill Builder' },
              { href: s.builderCenterUrl, label: 'AWS Builder Center' },
              { href: 'https://aws.amazon.com/certification/', label: 'AWS Certification paths' },
            ]}
          />
        </div>
        <div className="mt-12 border-t border-border pt-8 text-sm text-text-muted">
          <p className="max-w-[62ch]">
            A student-led group in the AWS Student Builder Groups program. Run by students at the University of Cape Coast, not by
            Amazon Web Services.
          </p>
          <a href={AWS_EVENT_TERMS_URL} className={LINK}>
            AWS Event Terms and Conditions
          </a>
          <p className="mt-2">© 2026 AWS Student Builder Group at University of Cape Coast</p>
        </div>
      </Container>
    </footer>
  );
}
