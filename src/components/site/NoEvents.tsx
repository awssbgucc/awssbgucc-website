import { Button } from '@/components/ui/Button';
import { getSiteSettings } from '@/lib/content/queries';

export async function NoEvents() {
  const { meetupUrl } = await getSiteSettings();
  return (
    <div>
      <p className="max-w-[62ch]">No event scheduled right now. Join on Meetup to hear about the next one first.</p>
      <Button href={meetupUrl} className="mt-6">
        Join on Meetup
      </Button>
    </div>
  );
}
