import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'solid' | 'mint' | 'line' | 'arrow';

/** Public call to action. External links get the out-arrow, so it is clear they leave the site. */
export function Cta({ href, variant = 'solid', children, className = '' }: { href: string; variant?: Variant; children: ReactNode; className?: string }) {
  const external = /^(https?:|mailto:)/.test(href);
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span>{children}</span>
      <Arrow aria-hidden size={variant === 'arrow' ? 16 : 18} className="cta-arrow" />
    </>
  );
  const classes = `cta cta-${variant} ${className}`;
  return external ? <a href={href} className={classes}>{content}</a> : <Link href={href} className={classes}>{content}</Link>;
}
