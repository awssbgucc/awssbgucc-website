import Image from 'next/image';
import Link from 'next/link';

/** The official chip and wordmark with the surface underneath, for the portal, admin and sign-in screens. */
export function BrandMark({ href, label, compact = false }: { href: string; label: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2.5" aria-label={`AWS Student Builder Group at University of Cape Coast, ${label}`}>
      <Image src="/brand/sbg-chip-purple.svg" alt="" width={compact ? 26 : 30} height={compact ? 26 : 30} unoptimized />
      <span className="flex flex-col gap-1">
        <Image src="/brand/sbg-wordmark-white.svg" alt="" width={compact ? 136 : 160} height={compact ? 16 : 19} unoptimized />
        <span className="type-label text-[10px] text-sbg-mint">{label}</span>
      </span>
    </Link>
  );
}
