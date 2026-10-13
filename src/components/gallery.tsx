'use client';
import { useEffect, useRef, useState } from 'react';
import type { Photo } from '@/lib/content/types';
import ScientificImage from './scientific-image';

export default function Gallery({
  photos,
  label = 'Life in the lab',
  imageLabel = 'Group photograph',
  showToolbar = true,
}: {
  photos: Photo[];
  label?: string;
  imageLabel?: string;
  showToolbar?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [compact, setCompact] = useState(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLAnchorElement | null>(null);
  const photo = active === null ? undefined : photos[active];
  const isOpen = active !== null;
  useEffect(() => {
    if (!isOpen) return;
    closeButton.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);
  useEffect(() => {
    if (active !== null)
      dialog.current
        ?.querySelector<HTMLButtonElement>('[aria-current="true"]')
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);
  const visible = photos
    .map((p, i) => ({ p, i }))
    .filter(({ p }) =>
      `${p.caption} ${p.alt}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  const move = (direction: number) =>
    setActive((i) =>
      i === null ? i : (i + direction + photos.length) % photos.length,
    );
  return (
    <>
      {showToolbar && (
        <div className="gallery-toolbar">
          <div>
            <p className="eyebrow">{label}</p>
            <p className="gallery-count" role="status">
              {visible.length}{' '}
              {visible.length === 1 ? 'photograph' : 'photographs'}
              {query.trim() ? ` of ${photos.length}` : ''}
            </p>
          </div>
          <label className="gallery-search">
            <span>Find a photograph</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search captions…"
            />
          </label>
          <div
            className="gallery-view"
            role="group"
            aria-label="Gallery layout"
          >
            <button
              type="button"
              aria-pressed={!compact}
              onClick={() => setCompact(false)}
            >
              Comfortable
            </button>
            <button
              type="button"
              aria-pressed={compact}
              onClick={() => setCompact(true)}
            >
              Compact
            </button>
          </div>
        </div>
      )}
      {!visible.length && (
        <p className="gallery-empty">
          No photographs match your search.{' '}
          <button className="text-link" onClick={() => setQuery('')}>
            Clear search
          </button>
        </p>
      )}
      <div className={`gallery-grid${compact ? ' gallery-grid--compact' : ''}`}>
        {visible.map(({ p, i }) => (
          <figure key={p.url}>
            <a
              href={p.url}
              aria-label={
                p.caption
                  ? `Open image: ${p.caption}`
                  : `Open lab gallery photograph ${i + 1}`
              }
              aria-haspopup="dialog"
              onClick={(e) => {
                e.preventDefault();
                trigger.current = e.currentTarget;
                setActive(i);
                dialog.current?.showModal();
              }}
            >
              <div className="gallery-media">
                <ScientificImage
                  photo={{
                    ...p,
                    alt:
                      p.alt || `Das Research Group gallery photograph ${i + 1}`,
                  }}
                  sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) 45vw, 400px"
                />
              </div>
              <span className="image-action" aria-hidden="true">
                <span>View photograph</span>
                <span>↗</span>
              </span>
            </a>
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-labelledby="gallery-dialog-title"
        onClose={() => {
          setActive(null);
          trigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            move(e.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
      >
        {photo && (
          <div className="gallery-dialog-content">
            <div className="gallery-dialog-toolbar">
              <h2 id="gallery-dialog-title">
                {imageLabel} {(active ?? 0) + 1} of {photos.length}
              </h2>
              <button
                ref={closeButton}
                className="button button-dark"
                onClick={() => dialog.current?.close()}
              >
                Close <span aria-hidden="true">×</span>
              </button>
            </div>
            <div
              className="gallery-stage"
              onTouchStart={(e) => {
                const t = e.touches[0];
                swipeStart.current = { x: t.clientX, y: t.clientY };
              }}
              onTouchEnd={(e) => {
                const start = swipeStart.current;
                swipeStart.current = null;
                if (!start) return;
                const t = e.changedTouches[0];
                const dx = t.clientX - start.x;
                if (
                  Math.abs(dx) > 60 &&
                  Math.abs(dx) > Math.abs(t.clientY - start.y) * 1.5
                )
                  move(dx < 0 ? 1 : -1);
              }}
            >
              <ScientificImage
                key={photo.url}
                photo={{
                  ...photo,
                  alt:
                    photo.alt ||
                    photo.caption ||
                    'Das Research Group photograph',
                }}
                sizes="90vw"
                priority
              />
            </div>
            {photo.caption && (
              <p className="gallery-dialog-caption">{photo.caption}</p>
            )}
            <p className="gallery-viewer-hint">
              Use arrow keys or swipe to browse. Escape to close.
            </p>
            <div
              className="gallery-filmstrip"
              role="group"
              aria-label="Choose a photograph"
            >
              {photos.map((p, i) => (
                <button
                  key={p.url}
                  aria-label={`View photograph ${i + 1}`}
                  aria-current={active === i ? 'true' : undefined}
                  onClick={() => setActive(i)}
                >
                  <ScientificImage photo={{ ...p, alt: '' }} sizes="72px" />
                </button>
              ))}
            </div>
            <nav
              className="gallery-dialog-actions"
              aria-label="Photograph controls"
            >
              <button className="button button-dark" onClick={() => move(-1)}>
                ← Previous
              </button>
              <a className="text-link" href={photo.url}>
                Open original image ↗
              </a>
              <button className="button button-dark" onClick={() => move(1)}>
                Next →
              </button>
            </nav>
          </div>
        )}
      </dialog>
    </>
  );
}
