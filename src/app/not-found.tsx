import { SiteChrome } from '@/components/site/SiteChrome';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';

// TODO(joel): the pixel chip goes above the headline once the program contact confirms the logo trace is allowed.
export default function NotFound() {
  return (
    <SiteChrome>
      <Section>
        <div className="flex flex-col items-center text-center">
          <h1 className="type-section">Page not found</h1>
          <p className="mt-4">This page does not exist, or it moved.</p>
          <Button href="/" className="mt-8">
            Back to the home page
          </Button>
        </div>
      </Section>
    </SiteChrome>
  );
}
