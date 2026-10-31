import { Button } from '@/components/ui/Button';
import { siteSettings } from '@/lib/content/static';

export function NoEvents() {
  return (
    <div>
      <p className="max-w-[62ch]">No event scheduled right now. Join on Meetup to hear about the next one first.</p>
      <Button href={siteSettings.meetupUrl} className="mt-6">
        Join on Meetup
      </Button>
    </div>
  );
}
