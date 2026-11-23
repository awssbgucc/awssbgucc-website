'use client';

import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/components/site/motion/TransitionLink';
import type { PublicResourceItem, ResourceCategory } from '@/lib/content/resources';

const CATEGORY_ORDER: ResourceCategory[] = ['Session materials', 'Getting started', 'Exam prep', 'Hands-on labs', 'Reference'];

export function ResourceBrowser({ items }: { items: PublicResourceItem[] }) {
  const [category, setCategory] = useState<ResourceCategory | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const availableCategories = CATEGORY_ORDER.filter((cat) => items.some((item) => item.category === cat));
  const q = query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (category !== 'ALL' && item.category !== category) return false;
    return !q || `${item.title} ${item.description} ${item.source} ${item.category}`.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="filter-bar">
        <div role="group" aria-label="Filter by category" className="filter-chips pb-2">
          <button type="button" aria-pressed={category === 'ALL'} onClick={() => setCategory('ALL')} className="filter-chip">
            All
          </button>
          {availableCategories.map((cat) => (
            <button key={cat} type="button" aria-pressed={category === cat} onClick={() => setCategory(cat)} className="filter-chip">
              {cat}
            </button>
          ))}
        </div>
        <label htmlFor="resource-search" className="sr-only">
          Search resources
        </label>
        <input
          id="resource-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources"
          className="search-field"
        />
      </div>

      <div aria-live="polite" className="mt-8">
        <div key={`${category}|${q}`} className="list-swap">
          {filtered.length === 0 ? (
            <p className="py-8 text-text-muted">No resources match your filters.</p>
          ) : (
            <ul className="resource-grid">
              {filtered.map((item) => (
                <li key={item.id} className="resource-card">
                  <div className="resource-card-top">
                    <span className="flex items-center gap-2 type-label text-text-muted">
                      <span className={`swatch swatch-${item.tone}`} aria-hidden="true" />
                      {item.category}
                    </span>
                    <span className="type-label text-text-muted">{item.source}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="resource-card-desc">{item.description}</p>
                  <div className="resource-card-foot">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="resource-open-link">
                      <span>Open resource</span>
                      <ArrowUpRight size={16} aria-hidden />
                    </a>
                    {item.eventHref && (
                      <Link href={item.eventHref} className="resource-session-link">
                        Session details
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
