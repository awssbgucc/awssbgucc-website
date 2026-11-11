'use client';

import { useState } from 'react';
import { ProjectCard, type ProjectCardData } from './ProjectCard';

type Item = ProjectCardData & { id: string; credit: string | null };

/** Filtering by technology runs in the browser, so the page stays static. */
export function ProjectBrowser({ projects }: { projects: Item[] }) {
  const [stack, setStack] = useState('');
  const [query, setQuery] = useState('');
  const counts = new Map<string, number>();
  for (const p of projects) for (const s of p.stack) counts.set(s, (counts.get(s) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name]) => name);
  const q = query.trim().toLowerCase();
  const list = projects.filter((p) => (!stack || p.stack.includes(stack)) && (!q || `${p.title} ${p.summary} ${p.stack.join(' ')}`.toLowerCase().includes(q)));
  const [first, ...rest] = list;

  return (
    <>
      {projects.length > 3 && (
        <div className="filter-bar">
          <div role="group" aria-label="Filter by technology" className="filter-chips">
            {['', ...top].map((name) => (
              <button key={name || 'all'} type="button" aria-pressed={stack === name} onClick={() => setStack(name)} className="filter-chip">
                {name || 'All'}
              </button>
            ))}
          </div>
          <label htmlFor="project-search" className="sr-only">Search projects</label>
          <input id="project-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" className="search-field" />
        </div>
      )}
      <div aria-live="polite">
        <div key={`${stack}|${q}`} className="list-swap">
        {list.length === 0 ? (
          <p className="text-text-muted">No projects match.</p>
        ) : (
          <>
            <ProjectCard project={first} credit={first.credit} size="large" />
            {rest.length > 0 && (
              <div className="project-grid">
                {rest.map((p) => <ProjectCard key={p.id} project={p} credit={p.credit} />)}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </>
  );
}
