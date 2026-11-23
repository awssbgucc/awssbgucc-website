import { Container } from '@/components/ui/Container';
import { NewsletterForm } from './NewsletterForm';

export function NewsletterBand({
  source,
  id = 'newsletter',
  surface = 'grid',
}: {
  source: string;
  id?: string;
  surface?: 'alt' | 'grid' | 'default';
}) {
  const bandClass = surface === 'alt' ? 'band band-alt' : surface === 'grid' ? 'band band-grid' : 'band';
  return (
    <section id={id} className={bandClass} aria-labelledby={`${id}-title`}>
      <Container>
        <div className="newsletter-card">
          <div className="contact-panel-steps" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="newsletter-grid">
            <div className="newsletter-copy">
              <p className="flex items-center gap-2 type-label text-text-muted">
                <span className="swatch swatch-mint" aria-hidden="true" />
                Newsletter
              </p>
              <h2 id={`${id}-title`} className="section-title">
                Stay updated with our sessions
              </h2>
              <p>
                Get email updates when we announce new campus talks, build sessions, bootcamps and community recaps at the University of Cape Coast.
              </p>
            </div>
            <NewsletterForm source={source} />
          </div>
        </div>
      </Container>
    </section>
  );
}
