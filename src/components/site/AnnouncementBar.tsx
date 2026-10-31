import { siteSettings } from '@/lib/content/static';

export function AnnouncementBar() {
  const { announcementActive, announcementText, announcementUrl } = siteSettings;
  if (!announcementActive || !announcementText) return null;
  return (
    <p className="bg-card-raised px-6 py-2 text-center text-sm font-medium">
      {announcementUrl ? (
        <a href={announcementUrl} className="underline underline-offset-4">
          {announcementText}
        </a>
      ) : (
        announcementText
      )}
    </p>
  );
}
