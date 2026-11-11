import Image from 'next/image';
import Link from 'next/link';

// The official SBG chip and wordmark from the brand kit (public/brand, made by scripts/prepare-media.py), with the
// campus name under the wordmark as the handbook describes for a group lockup. Neither file is recoloured or redrawn.
export function Logo({ size = 'nav' }: { size?: 'nav' | 'large' }) {
  const large = size === 'large';
  return (
    <Link href="/" className={`sbg-lockup ${large ? 'sbg-lockup-large' : ''}`} aria-label="AWS Student Builder Group at University of Cape Coast, home">
      <Image src="/brand/sbg-chip-purple.svg" alt="" width={large ? 56 : 34} height={large ? 56 : 34} unoptimized className="sbg-lockup-chip" />
      <span className="sbg-lockup-text">
        <Image src="/brand/sbg-wordmark-white.svg" alt="" width={large ? 304 : 186} height={large ? 36 : 22} unoptimized />
        <span>University of Cape Coast</span>
      </span>
    </Link>
  );
}
