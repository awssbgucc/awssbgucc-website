import { Avatar } from '@/components/ui/Avatar';
import type { MemberProfile } from '@/generated/prisma/client';
import { ACCENT_CLASSES, optionLabel } from '@/lib/platform/customise';

/** The banner, initials, name and title, as other people see them. On the public profile page the name is the h1. */
export function ProfileCard({ profile, level, nameIsHeading = false }: { profile: MemberProfile; level?: number; nameIsHeading?: boolean }) {
  const Name = nameIsHeading ? 'h1' : 'p';
  const accent = ACCENT_CLASSES[profile.accentKey] ?? ACCENT_CLASSES.lime;
  const title = optionLabel('TITLE', profile.titleKey);
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className={`banner-${profile.bannerKey} h-24 border-b border-border sm:h-32`} aria-hidden />
      <div className="-mt-10 px-5 pb-5 sm:px-6">
        <Avatar name={profile.displayName} accent={profile.accentKey} frame={profile.frameKey} size="lg" />
        <Name className="mt-3 text-xl font-semibold text-white">{profile.displayName}</Name>
        <p className="font-display text-sm text-text-muted">
          @{profile.handle}
          {level !== undefined && <span className={accent.text}> · Level {level}</span>}
        </p>
        {title && <p className={`type-label mt-2 ${accent.text}`}>{title}</p>}
        {profile.bio && <p className="mt-3 max-w-[56ch] text-sm text-text-muted">{profile.bio}</p>}
      </div>
    </div>
  );
}
