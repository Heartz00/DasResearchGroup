'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Photo } from '@/lib/content/types';
import { RichText } from './content';
import ScientificImage from './scientific-image';

interface Instrument {
  id: number;
  displayName: string;
  manufacturer: string;
  model: string;
  purpose: string;
  ownership: string;
  searchText: string;
  html: string;
  photo?: Photo;
  facilityUrl?: string;
}

export default function InstrumentExhibition({
  instruments,
  photos,
}: {
  instruments: Instrument[];
  photos: Photo[];
}) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('All');
  const [list, setList] = useState(false);
  const [active, setActive] = useState<Instrument | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const imageKey = (url: string) =>
    url.split('?')[0].replace(/-\d+x\d+(?=\.[^/]+$)/, '');
  const archive = photos.filter(
    (photo) =>
      !instruments.some(
        (instrument) =>
          instrument.photo &&
          imageKey(instrument.photo.url) === imageKey(photo.url),
      ),
  );
  const scopes = [
    'All',
    ...new Set(instruments.map((p) => p.ownership).filter(Boolean)),
  ];
  const visible = instruments.filter(
    (p) =>
      (scope === 'All' || p.ownership === scope) &&
      `${p.displayName} ${p.searchText}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  useEffect(() => {
    if (!active) return;
    close.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
  return (
    <div className="instrument-exhibition">
      <div className="instrument-introduction">
        <div>
          <p className="eyebrow">Explore the laboratory</p>
          <h2>Tools behind the research.</h2>
        </div>
        <p>
          Browse our instrumentation and view equipment information.{' '}
          <Link href="/contact">Contact the group</Link> about capabilities and
          access.
        </p>
      </div>
      {!!instruments.length && (
        <>
          <div className="instrument-toolbar">
            <label className="gallery-search">
              <span>Find an instrument</span>
              <input
                type="search"
                placeholder="Name, model or capability…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            {scopes.length > 1 && (
              <label className="instrument-filter">
                <span>Equipment access</span>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                >
                  {scopes.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            )}
            <div
              className="gallery-view"
              role="group"
              aria-label="Instrument layout"
            >
              <button aria-pressed={!list} onClick={() => setList(false)}>
                Grid
              </button>
              <button aria-pressed={list} onClick={() => setList(true)}>
                List
              </button>
            </div>
          </div>
          <p className="instrument-result" role="status">
            {visible.length} of {instruments.length}{' '}
            {instruments.length === 1 ? 'instrument' : 'instruments'}
          </p>
          {!visible.length && (
            <div className="instrument-empty">
              <h3>No matching instruments</h3>
              <p>Try a different name, model or capability.</p>
              <button
                className="button button-dark"
                onClick={() => {
                  setQuery('');
                  setScope('All');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          <div
            className={`instrument-showcase${list ? ' instrument-showcase--list' : ''}`}
          >
            {visible.map((p) => (
              <article
                className="equipment-card"
                key={p.id}
                id={`instrument-${p.id}`}
              >
                <div className="equipment-photo">
                  {p.photo ? (
                    <ScientificImage
                      photo={{ ...p.photo, alt: p.photo.alt || p.displayName }}
                      sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 400px"
                    />
                  ) : (
                    <div className="equipment-no-photo">
                      Photograph not available
                    </div>
                  )}
                </div>
                <div className="equipment-copy">
                  {p.ownership && (
                    <span className="equipment-tag">{p.ownership}</span>
                  )}
                  <h3>{p.displayName}</h3>
                  {(p.manufacturer || p.model) && (
                    <p className="equipment-model">
                      {[p.manufacturer, p.model].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {p.purpose && (
                    <p className="equipment-purpose">{p.purpose}</p>
                  )}
                  <button
                    className="equipment-details"
                    onClick={(e) => {
                      trigger.current = e.currentTarget;
                      setActive(p);
                      dialog.current?.showModal();
                    }}
                    aria-haspopup="dialog"
                    aria-label={`View details: ${p.displayName}`}
                  >
                    View instrument <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {!!archive.length && (
        <details
          className="instrument-photo-archive"
          aria-labelledby="instrument-photo-title"
        >
          <summary id="instrument-photo-title">
            Laboratory photo archive <span>{archive.length} photographs</span>
          </summary>
          <p>Additional photographs from the lab.</p>
          <div className="equipment-archive-grid">
            {archive.map((p, i) => (
              <figure key={p.url}>
                <a
                  href={p.url}
                  aria-label={`Open laboratory photograph ${i + 1}`}
                >
                  <ScientificImage
                    photo={{
                      ...p,
                      alt: p.alt || `Laboratory photograph ${i + 1}`,
                    }}
                  />
                </a>
                {p.caption && <figcaption>{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </details>
      )}
      <dialog
        ref={dialog}
        className="equipment-dialog"
        aria-labelledby="equipment-dialog-title"
        onClose={() => {
          setActive(null);
          trigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        {active && (
          <>
            <div className="equipment-dialog-toolbar">
              <p className="eyebrow">Instrument information</p>
              <button
                ref={close}
                className="button button-dark"
                onClick={() => dialog.current?.close()}
              >
                Close <span aria-hidden="true">×</span>
              </button>
            </div>
            <h2 id="equipment-dialog-title">{active.displayName}</h2>
            <div
              className={`equipment-dialog-body${active.photo ? '' : ' equipment-dialog-body--text'}`}
            >
              {active.photo && (
                <div className="equipment-detail-photo">
                  <ScientificImage
                    key={active.photo.url}
                    photo={{
                      ...active.photo,
                      alt: active.photo.alt || active.displayName,
                    }}
                    sizes="(max-width: 700px) 90vw, 600px"
                    priority
                  />
                  <a href={active.photo.url} className="text-link">
                    Open original photograph ↗
                  </a>
                </div>
              )}
              <div>
                {active.html ? (
                  <RichText html={active.html} />
                ) : (
                  <p>
                    Contact the group for information about this instrument.
                  </p>
                )}
                {active.facilityUrl && (
                  <a className="text-link" href={active.facilityUrl}>
                    Facility information ↗
                  </a>
                )}
              </div>
            </div>
            <div className="equipment-dialog-contact">
              <p>Questions about this instrument or equipment access?</p>
              <Link className="button button-red" href="/contact">
                Contact the group <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
