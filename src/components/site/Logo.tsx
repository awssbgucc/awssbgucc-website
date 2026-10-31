import Link from 'next/link';

// TODO(joel): add the official SBG logo from Box to public/brand/ and show it above this text.
// The pixel chip must not stand in for it (docs/COMPLIANCE.md rule 4).
export function Logo() {
  return (
    <Link href="/" className="inline-flex min-h-11 flex-col justify-center leading-tight">
      <span className="font-display text-sm font-medium text-white">AWS Student Builder Group</span>
      <span className="text-xs font-medium text-text-muted">University of Cape Coast</span>
    </Link>
  );
}
