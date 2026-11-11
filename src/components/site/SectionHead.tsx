import type { ReactNode } from 'react';

export function SectionHead({ label, title, id, children, action }: { label: string; title: ReactNode; id?: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <header className="section-head" data-reveal="rise">
      <div>
        <p className="type-label text-text-muted">{label}</p>
        <h2 id={id} className="section-title">{title}</h2>
      </div>
      {(children || action) && (
        <div className="section-head-aside">
          {children && <p>{children}</p>}
          {action}
        </div>
      )}
    </header>
  );
}
