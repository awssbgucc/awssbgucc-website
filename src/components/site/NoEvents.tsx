import { Button } from '@/components/ui/Button';
import { getSiteSettings } from '@/lib/content/queries';

export async function NoEvents() {
  const { meetupUrl } = await getSiteSettings();
  return (
    <div>
      <p className="max-w-[62ch]">No upcoming events are scheduled right now. Join us on Meetup to hear when the next one is announced.</p>
      <Button href={meetupUrl} className="mt-6">
        Join on Meetup
      </Button>
    </div>
  );
}
