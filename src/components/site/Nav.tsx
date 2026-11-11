import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getSiteSettings } from '@/lib/content/queries';
import { Cta } from './Cta';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';
import { navLinks } from './nav-links';

export async function Nav() {
  const { meetupUrl, whatsappUrl, scdPageEnabled } = await getSiteSettings();
  const links = navLinks(scdPageEnabled);
  return (
    <header className="site-header">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-white focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <Container className="site-header-inner">
        <Logo />
        <nav aria-label="Main" className="hidden xl:block">
          <NavLinks links={links} />
        </nav>
        <div className="hidden items-center gap-6 xl:flex">
          <Link href="/builder" className="nav-link">
            Builder Portal
          </Link>
          <Cta href={meetupUrl} variant="mint">Join on Meetup</Cta>
        </div>
        <MobileMenu meetupUrl={meetupUrl} whatsappUrl={whatsappUrl} links={links} />
      </Container>
    </header>
  );
}
