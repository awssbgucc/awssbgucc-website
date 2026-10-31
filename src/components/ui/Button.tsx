import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'text';

const BASE = 'inline-flex min-h-11 items-center gap-2 text-sm font-medium transition-colors duration-150 ease-brand';

const VARIANTS: Record<Variant, string> = {
  primary: 'rounded-sm bg-white px-5 text-bg hover:bg-white/90',
  secondary: 'rounded-sm border border-border-strong px-5 text-white hover:border-text-muted',
  text: 'text-text-muted underline-offset-4 hover:underline',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { href?: string; variant?: Variant };

export function Button({ href, variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;
  const content = (
    <>
      {children}
      {variant === 'primary' && <ArrowRight aria-hidden size={16} />}
    </>
  );

  if (href === undefined) {
    return (
      <button type="button" {...rest} className={classes}>
        {content}
      </button>
    );
  }

  // External and mailto links skip client-side routing.
  return /^(https?:|mailto:)/.test(href) ? (
    <a href={href} className={classes}>
      {content}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
