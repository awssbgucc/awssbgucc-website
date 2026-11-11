import type { ReactNode } from 'react';

/** Page opening: label, a large mono title, one paragraph, and optional facts. The stepped blocks repeat the hero's grid. */
export function PageIntro({ title, intro, label = 'AWS SBG UCC', children }: { title: string; intro: string; label?: string; children?: ReactNode }) {
  return (
    <header className="page-intro">
      <div className="page-intro-steps" aria-hidden="true"><span /><span /><span /></div>
      <p className="type-label text-text-muted">{label}</p>
      <div className="page-intro-grid">
        <h1 className="page-title">{title}</h1>
        <div>
          <p className="page-lead">{intro}</p>
          {children}
        </div>
      </div>
    </header>
  );
}
