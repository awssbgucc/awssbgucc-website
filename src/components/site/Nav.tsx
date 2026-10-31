import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { getSiteSettings } from '@/lib/content/queries';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { NAV_LINKS } from './nav-links';

export async function Nav() {
  const { meetupUrl, whatsappUrl } = await getSiteSettings();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85">
      <Container className="flex min-h-[60px] items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-text-muted transition-colors duration-150 ease-brand hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button href={meetupUrl}>Join on Meetup</Button>
          {whatsappUrl && (
            <Button href={whatsappUrl} variant="secondary">
              WhatsApp
            </Button>
          )}
        </div>
        <MobileMenu meetupUrl={meetupUrl} whatsappUrl={whatsappUrl} />
      </Container>
    </header>
  );
}
