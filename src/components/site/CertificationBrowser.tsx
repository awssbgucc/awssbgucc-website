'use client';

import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import {
  CERT_LEVEL_LABEL,
  CERT_LEVEL_TONE,
  CERT_PATHWAY_LABEL,
  type CertLevelValue,
  type CertPathwayValue,
} from '@/lib/validation/certification';

export type PublicCertificationItem = {
  id: string;
  memberName: string;
  programme: string | null;
  levelOfStudy: string | null;
  certName: string;
  certCode: string | null;
  certLevel: CertLevelValue;
  pathway: CertPathwayValue | null;
  credlyUrl: string;
  earnedMonth: string | null;
};

const LEVEL_ORDER: CertLevelValue[] = ['FOUNDATIONAL', 'ASSOCIATE', 'PROFESSIONAL', 'SPECIALTY'];

export function CertificationBrowser({ items }: { items: PublicCertificationItem[] }) {
  const [level, setLevel] = useState<CertLevelValue | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const availableLevels = LEVEL_ORDER.filter((lvl) => items.some((item) => item.certLevel === lvl));
  const q = query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (level !== 'ALL' && item.certLevel !== level) return false;
    if (!q) return true;
    const pathwayText = item.pathway ? CERT_PATHWAY_LABEL[item.pathway] : '';
    const searchable = [
      item.memberName,
      item.certName,
      item.certCode ?? '',
      item.programme ?? '',
      item.levelOfStudy ?? '',
      CERT_LEVEL_LABEL[item.certLevel],
      pathwayText,
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(q);
  });

  return (
    <div>
      <div className="filter-bar">
        <div role="group" aria-label="Filter by certification level" className="filter-chips pb-2">
          <button type="button" aria-pressed={level === 'ALL'} onClick={() => setLevel('ALL')} className="filter-chip">
            All
          </button>
          {availableLevels.map((lvl) => (
            <button key={lvl} type="button" aria-pressed={level === lvl} onClick={() => setLevel(lvl)} className="filter-chip">
              {CERT_LEVEL_LABEL[lvl]}
            </button>
          ))}
        </div>
        <label htmlFor="cert-search" className="sr-only">
          Search certified members
        </label>
        <input
          id="cert-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members or certifications"
          className="search-field"
        />
      </div>

      <div aria-live="polite" className="mt-8">
        <div key={`${level}|${q}`} className="list-swap">
          {filtered.length === 0 ? (
            <p className="py-8 text-text-muted">No certifications match your filters.</p>
          ) : (
            <ul className="cert-grid">
              {filtered.map((item) => {
                const tone = CERT_LEVEL_TONE[item.certLevel];
                const metaRight = [item.certCode, item.earnedMonth].filter(Boolean).join(' / ');
                const studyDetails = [item.programme, item.levelOfStudy].filter(Boolean).join(', ');
                return (
                  <li key={item.id} className="cert-card">
                    <div className="cert-card-top">
                      <span className="flex items-center gap-2 type-label text-text-muted">
                        <span className={`swatch swatch-${tone}`} aria-hidden="true" />
                        {CERT_LEVEL_LABEL[item.certLevel]}
                      </span>
                      {metaRight && <span className="type-label text-text-muted">{metaRight}</span>}
                    </div>
                    <h3>{item.certName}</h3>
                    <div className="cert-member">
                      <p className="cert-member-name">{item.memberName}</p>
                      {studyDetails && <p className="cert-member-meta">{studyDetails}</p>}
                    </div>
                    {item.pathway && <p className="cert-pathway">{CERT_PATHWAY_LABEL[item.pathway]}</p>}
                    <div className="cert-card-foot">
                      <a href={item.credlyUrl} target="_blank" rel="noopener noreferrer" className="resource-open-link">
                        <span>Verify on Credly</span>
                        <ArrowUpRight size={16} aria-hidden />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
