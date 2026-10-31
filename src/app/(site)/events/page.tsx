import type { Metadata } from 'next';
import { EventCard } from '@/components/site/EventCard';
import { EventTabs } from '@/components/site/EventTabs';
import { NoEvents } from '@/components/site/NoEvents';
import { PageIntro } from '@/components/site/PageIntro';
import { Section } from '@/components/ui/Section';
import { pastEvents, publishedPosts, upcomingEvents } from '@/lib/content/selectors';
import { events, posts } from '@/lib/content/static';
import type { Event } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Events' };

function EventList({ list }: { list: Event[] }) {
  const published = publishedPosts(posts);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {list.map((event) => (
        <EventCard key={event.id} event={event} recapSlug={published.find((post) => post.id === event.recapPostId)?.slug} />
      ))}
    </div>
  );
}

export default function EventsPage() {
  const now = new Date();
  const upcoming = upcomingEvents(events, now);
  const past = pastEvents(events, now);
  const upcomingContent = upcoming.length > 0 ? <EventList list={upcoming} /> : <NoEvents />;

  return (
    <Section>
      <PageIntro title="Events" intro="Every event is free and listed on Meetup. RSVP there so we can plan seats and count you in." />
      {/* The tabs appear once there is a past event to switch to. */}
      {past.length > 0 ? <EventTabs upcoming={upcomingContent} past={<EventList list={past} />} /> : upcomingContent}
    </Section>
  );
}
