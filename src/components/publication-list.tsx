'use client';
import { useState } from 'react';
import type { Publication } from '@/lib/content/types';
import { PublicationCard } from './content';
export default function PublicationList({
  publications,
  journalLabels = {},
  searchText = {},
}: {
  publications: Publication[];
  journalLabels?: Record<string, string>;
  searchText?: Record<string, string>;
}) {
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [affiliation, setAffiliation] = useState('all');
  const [compact, setCompact] = useState(false);
  const [figures, setFigures] = useState(false);
  const statuses = [...new Set(publications.map((p) => p.status))];
  const years = [
    ...new Set(publications.map((p) => p.year).filter((y): y is number => !!y)),
  ].sort((a, b) => b - a);
  const selected = publications.filter(
    (p) =>
      (year === 'all' || String(p.year) === year) &&
      (status === 'all' || p.status === status) &&
      (affiliation === 'all' ||
        (affiliation === 'prior' ? p.prior : !p.prior)) &&
      `${p.title} ${p.doi || ''} ${searchText[p.id] || ''}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="filter-bar bibliography-filters">
        <label htmlFor="publication-search">Find a publication</label>
        <input
          id="publication-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, author, journal or DOI"
        />
        <label htmlFor="publication-year">Publication year</label>
        <select
          id="publication-year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <label htmlFor="publication-status">Publication status</label>
        <select
          id="publication-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <label htmlFor="publication-affiliation">Research affiliation</label>
        <select
          id="publication-affiliation"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
        >
          <option value="all">All work</option>
          <option value="smu">SMU</option>
          <option value="prior">Prior to SMU</option>
        </select>
        <span aria-live="polite">
          {selected.length} {selected.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      <div className="bibliography-toolbar">
        <div
          className="gallery-view"
          role="group"
          aria-label="Citation display"
        >
          <button
            type="button"
            aria-pressed={!compact}
            onClick={() => setCompact(false)}
          >
            Full citations
          </button>
          <button
            type="button"
            aria-pressed={compact}
            onClick={() => setCompact(true)}
          >
            Compact
          </button>
        </div>
        {publications.some((p) => p.photo) && (
          <label className="bibliography-figure-toggle">
            <input
              type="checkbox"
              checked={figures}
              onChange={(e) => setFigures(e.target.checked)}
            />
            Show research figures
          </label>
        )}
        {(query ||
          year !== 'all' ||
          status !== 'all' ||
          affiliation !== 'all') && (
          <button
            type="button"
            className="text-link bibliography-clear"
            onClick={() => {
              setQuery('');
              setYear('all');
              setStatus('all');
              setAffiliation('all');
            }}
          >
            Clear filters
          </button>
        )}
      </div>
      <nav
        className="section-navigation publication-year-navigation"
        aria-label="Publication years"
      >
        {years
          .filter((y) => selected.some((p) => p.year === y))
          .map((y) => (
            <a key={y} href={`#year-${y}`}>
              {y}
            </a>
          ))}
      </nav>
      <div
        className={`publication-list bibliography-list${figures ? ' bibliography-list--figures' : ''}`}
      >
        {[
          ...years,
          ...(publications.some((p) => !p.year) ? [undefined] : []),
        ].map((groupYear) => {
          const entries = selected.filter((p) => p.year === groupYear);
          if (!entries.length) return null;
          return (
            <section
              className="publication-year-group"
              key={groupYear ?? 'undated'}
              aria-labelledby={`year-${groupYear ?? 'undated'}`}
            >
              <div className="year-heading">
                <h2 id={`year-${groupYear ?? 'undated'}`}>
                  {groupYear ?? 'Year not listed'}
                </h2>
                <span>
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              {entries.map((p) => (
                <PublicationCard
                  key={p.id}
                  publication={p}
                  showYear={false}
                  compact={compact}
                  row
                  bibliography
                  number={publications.indexOf(p) + 1}
                  citationText={searchText[p.id]}
                  journal={journalLabels[p.id]}
                />
              ))}
            </section>
          );
        })}
      </div>
      {!selected.length && (
        <p role="status" className="empty-state">
          No publications match this search. Try another term or choose All
          years.
        </p>
      )}
    </>
  );
}
