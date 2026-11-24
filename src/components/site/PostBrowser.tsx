'use client';

import { useState } from 'react';
import type { PostCategory } from '@/lib/content/reading';
import type { Post } from '@/lib/content/types';
import { PostCard } from './PostCard';

export type PostBrowserItem = {
  post: Post;
  readingTime: string;
  categoryKey: PostCategory['key'];
  categoryLabel: string;
  tone: PostCategory['tone'];
  eventTitle: string | null;
};

const CATEGORY_ORDER: PostCategory['key'][] = ['event', 'bootcamp', 'notes', 'external'];

const CATEGORY_FILTER_LABELS: Record<PostCategory['key'], string> = {
  event: 'Event recaps',
  bootcamp: 'Bootcamp notes',
  notes: 'Community notes',
  external: 'External',
};

export function PostBrowser({ items }: { items: PostBrowserItem[] }) {
  const [category, setCategory] = useState<PostCategory['key'] | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const availableCategories = CATEGORY_ORDER.filter((key) => items.some((item) => item.categoryKey === key));
  const counts = new Map<PostCategory['key'], number>();
  for (const item of items) counts.set(item.categoryKey, (counts.get(item.categoryKey) ?? 0) + 1);

  const q = query.trim().toLowerCase();
  const isFiltered = category !== 'ALL' || q.length > 0;

  const filtered = items.filter((item) => {
    if (category !== 'ALL' && item.categoryKey !== category) return false;
    if (!q) return true;
    const searchable = [
      item.post.title,
      item.post.excerpt,
      item.post.author,
      item.post.body ?? '',
      item.eventTitle ?? '',
      item.categoryLabel,
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(q);
  });

  const [first, ...rest] = filtered;

  return (
    <div>
      <div className="filter-bar">
        {availableCategories.length > 1 ? (
          <div role="group" aria-label="Filter by topic" className="filter-chips pb-2">
            <button type="button" aria-pressed={category === 'ALL'} onClick={() => setCategory('ALL')} className="filter-chip">
              All <span className="filter-chip-count">{items.length}</span>
            </button>
            {availableCategories.map((key) => (
              <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)} className="filter-chip">
                {CATEGORY_FILTER_LABELS[key]} <span className="filter-chip-count">{counts.get(key) ?? 0}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="pb-2 type-label text-text-muted">{items.length} {items.length === 1 ? 'article' : 'articles'}</p>
        )}

        <div className="search-wrap">
          <label htmlFor="writing-search" className="sr-only">
            Search articles
          </label>
          <input
            id="writing-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles"
            className="search-field"
          />
          {q && (
            <button type="button" onClick={() => setQuery('')} className="search-clear">
              Clear
            </button>
          )}
        </div>
      </div>

      <div aria-live="polite" className="mt-8">
        {isFiltered && filtered.length > 0 && (
          <p className="mb-4 type-label text-text-muted">
            Showing {filtered.length} of {items.length} {items.length === 1 ? 'article' : 'articles'}
          </p>
        )}
        <div key={`${category}|${q}`} className="list-swap">
          {filtered.length === 0 ? (
            <div className="py-10">
              <p className="text-text-muted">No articles match your filters.</p>
              <button
                type="button"
                onClick={() => {
                  setCategory('ALL');
                  setQuery('');
                }}
                className="cta cta-line mt-4"
              >
                Reset filters
              </button>
            </div>
          ) : !isFiltered || filtered.length === 1 ? (
            <>
              <PostCard
                post={first.post}
                readingTime={first.readingTime}
                categoryLabel={first.categoryLabel}
                tone={first.tone}
                eventTitle={first.eventTitle ?? undefined}
                feature
              />
              {rest.length > 0 && (
                <div className="post-grid">
                  {rest.map((item) => (
                    <PostCard
                      key={item.post.id}
                      post={item.post}
                      readingTime={item.readingTime}
                      categoryLabel={item.categoryLabel}
                      tone={item.tone}
                      eventTitle={item.eventTitle ?? undefined}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="post-grid">
              {filtered.map((item) => (
                <PostCard
                  key={item.post.id}
                  post={item.post}
                  readingTime={item.readingTime}
                  categoryLabel={item.categoryLabel}
                  tone={item.tone}
                  eventTitle={item.eventTitle ?? undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
