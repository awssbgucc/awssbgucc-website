import { initials } from '@/lib/content/selectors';
import { ACCENT_CLASSES } from '@/lib/platform/customise';

type AvatarProps = { name: string; accent?: string; frame?: string; size?: 'sm' | 'md' | 'lg' };

const SIZES = { sm: 'size-9 text-xs', md: 'size-12 text-sm', lg: 'size-24 text-2xl' };

/** Initials only. The portal does not store photos of members. */
export function Avatar({ name, accent = 'lime', frame = 'none', size = 'md' }: AvatarProps) {
  const colours = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.lime;
  const frameClass =
    frame === 'double' ? `border-4 border-double ${colours.border}` : frame === 'pixel' ? `border-2 ${colours.border} [border-style:dashed]` : 'border border-border-strong';
  return (
    <span aria-hidden className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-card-raised font-display font-medium ${colours.text} ${frameClass} ${SIZES[size]}`}>
      {initials(name)}
    </span>
  );
}
