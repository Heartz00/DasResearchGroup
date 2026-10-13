'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Person } from '@/lib/content/types';
import { peopleRole } from '@/lib/content/people-role';
import { PersonCard } from './content';

export default function TeamDirectory({
  roster,
  leader,
  searchText,
}: {
  roster: Person[];
  leader: ReactNode;
  searchText: Record<string, string>;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const sourceRoles = [
    ...new Set(roster.filter((p) => !p.alumni).map((p) => p.role)),
  ];
  const roles = [...new Set(sourceRoles.map(peopleRole))];
  const hasAlumni = roster.some((p) => p.alumni);
  useEffect(() => {
    const reveal = () => {
      if (window.location.hash === '#alumni') {
        setQuery('');
        setCategory('Alumni');
      } else if (window.location.hash.startsWith('#people-category-')) {
        setQuery('');
        setCategory('All');
      }
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, []);
  const match = (p: Person) =>
    `${p.name} ${p.interests || ''} ${searchText[p.id] || ''}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()) &&
    (category === 'All' ||
      (p.alumni ? category === 'Alumni' : peopleRole(p.role) === category));
  const count = roster.filter(match).length;
  return (
    <div className="team-directory">
      {leader}
      {!!roster.length && (
        <>
          <div className="team-directory-intro">
            <div>
              <p className="eyebrow">Our research community</p>
              <h2>Meet the team.</h2>
            </div>
            <p>
              Explore member profiles, research interests and professional
              links.
            </p>
          </div>
          <div className="team-toolbar">
            <label className="gallery-search">
              <span>Find a team member</span>
              <input
                type="search"
                placeholder="Name or research interest…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="instrument-filter">
              <span>Member group</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All</option>
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
                {hasAlumni && <option>Alumni</option>}
              </select>
            </label>
            <p role="status">
              {count} {count === 1 ? 'member profile' : 'member profiles'}
            </p>
          </div>
          <nav className="section-navigation" aria-label="Team categories">
            {leader && (
              <a href="#principal-investigator">Principal investigator</a>
            )}
            {roles.map((r) => (
              <a
                key={r}
                href={`#people-category-${sourceRoles.findIndex((s) => peopleRole(s) === r)}`}
                onClick={() => {
                  setQuery('');
                  setCategory('All');
                }}
              >
                {r}
              </a>
            ))}
            {hasAlumni && (
              <a
                href="#alumni"
                onClick={() => {
                  setQuery('');
                  setCategory('Alumni');
                }}
              >
                Alumni
              </a>
            )}
          </nav>
          {!count && (
            <p className="empty-state">
              No members match these filters.{' '}
              <button
                className="text-link"
                onClick={() => {
                  setQuery('');
                  setCategory('All');
                }}
              >
                Clear filters
              </button>
            </p>
          )}
          {roles.map((role) => {
            const members = roster.filter(
              (p) => !p.alumni && peopleRole(p.role) === role && match(p),
            );
            return (
              <section
                key={role}
                className="content-section team-member-group"
                id={`people-category-${sourceRoles.findIndex((s) => peopleRole(s) === role)}`}
                hidden={!members.length}
              >
                {sourceRoles.map((s, i) =>
                  peopleRole(s) === role &&
                  s !== sourceRoles.find((v) => peopleRole(v) === role) ? (
                    <span
                      key={i}
                      id={`people-category-${i}`}
                      aria-hidden="true"
                    />
                  ) : null,
                )}
                <h2>{role}</h2>
                <div className="people-grid">
                  {members.map((p) => (
                    <PersonCard key={p.id} person={p} />
                  ))}
                </div>
              </section>
            );
          })}
          {hasAlumni && (
            <section
              id="alumni"
              className="content-section"
              hidden={!roster.some((p) => p.alumni && match(p))}
            >
              <details
                className="team-alumni"
                open={
                  category === 'Alumni' || !!query.trim() ? true : undefined
                }
              >
                <summary>
                  Alumni{' '}
                  <span>
                    {roster.filter((p) => p.alumni && match(p)).length} profiles
                  </span>
                </summary>
                <div className="people-grid alumni-grid">
                  {roster
                    .filter((p) => p.alumni && match(p))
                    .map((p) => (
                      <PersonCard key={p.id} person={p} />
                    ))}
                </div>
              </details>
            </section>
          )}
        </>
      )}
    </div>
  );
}
