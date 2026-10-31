import type { ReactNode } from 'react';
import { Container } from './Container';

type SectionProps = { children: ReactNode; alt?: boolean; id?: string };

export function Section({ children, alt = false, id }: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-16 py-16 lg:py-24 ${alt ? 'bg-bg-alt' : 'bg-bg'}`}>
      <Container>{children}</Container>
    </section>
  );
}
