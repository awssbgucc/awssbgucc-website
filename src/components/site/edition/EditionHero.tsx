import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import type { Edition } from '@/lib/editions';

type Fact = [label: string, value: string | null];

/**
 * The opening of a special event edition. The theme's two colours lead; the signature motif builds in on arrival:
 * stairs climb in the edition colours, or the official artwork opens with a stepped mask when one is supplied.
 * Facts are text, never part of the artwork, so they read with or without motion.
 */
export function EditionHero({ edition, facts, action }: { edition: Edition; facts: Fact[]; action?: ReactNode }) {
  const { theme } = edition;
  const style = { '--ed-accent': `var(--color-sbg-${theme.accent})`, '--ed-second': `var(--color-sbg-${theme.second})` } as CSSProperties;
  const known = facts.filter((fact): fact is [string, string] => !!fact[1]);
  return (
    <section className="edition-hero" style={style} aria-labelledby="edition-title">
      <div className="hero-field" aria-hidden="true" />
      <Container>
        <p className="type-label edition-label">{edition.label}</p>
        <div className="edition-layout">
          <div>
            <h1 id="edition-title" className="edition-title">{edition.name}</h1>
            {known.length > 0 && (
              <dl className="edition-facts">
                {known.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            )}
            {action && <div className="edition-action">{action}</div>}
          </div>
          {theme.artwork ? (
            <figure className="edition-art">
              <Image src={theme.artwork.src} alt={theme.artwork.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" />
            </figure>
          ) : (
            <div className={`edition-motif motif-${theme.motif}`} aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => <span key={index} style={{ '--i': index } as CSSProperties} />)}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
