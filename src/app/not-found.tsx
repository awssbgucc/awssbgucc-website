import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { SiteChrome } from '@/components/site/SiteChrome';

// The official chip from the brand kit, used here instead of the pixel trace (W7 in tasks/todo.md).
export default function NotFound() {
  return (
    <SiteChrome>
      <section className="band band-grid">
        <Container>
          <div className="flex flex-col items-start gap-6 py-10">
            <Image src="/brand/sbg-chip-purple.svg" alt="" width={72} height={72} unoptimized />
            <p className="type-label text-text-muted">404</p>
            <h1 className="page-title">Page not found</h1>
            <p className="page-lead">This page does not exist, or it moved. The sessions and projects are still where they were.</p>
            <div className="flex flex-wrap gap-4">
              <Cta href="/">Back to the home page</Cta>
              <Cta href="/events" variant="line">Browse events</Cta>
            </div>
          </div>
        </Container>
      </section>
    </SiteChrome>
  );
}
