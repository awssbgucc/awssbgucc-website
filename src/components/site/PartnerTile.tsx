import Image from 'next/image';
import type { Partner } from '@/lib/content/types';

export function PartnerTile({ partner }: { partner: Partner }) {
  const content = partner.logoUrl ? (
    <Image
      src={partner.logoUrl}
      alt={partner.name}
      width={140}
      height={56}
      className="max-h-14 w-auto object-contain opacity-70 brightness-0 invert transition duration-150 ease-brand hover:opacity-100 hover:filter-none"
    />
  ) : (
    <span className="text-center font-semibold">{partner.name}</span>
  );
  const classes = 'flex min-h-24 items-center justify-center rounded-md border border-border bg-card p-6';

  return partner.url ? (
    <a href={partner.url} className={classes}>
      {content}
    </a>
  ) : (
    <div className={classes}>{content}</div>
  );
}
