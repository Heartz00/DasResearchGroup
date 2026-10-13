'use client';
import { useActionState, useState } from 'react';
import Image from 'next/image';
import { saveContent, restoreContent } from '@/app/admin/manage/actions';
import { hasPhoto, type ContentField } from '@/lib/admin/content-model';
export default function ContentEditor({
  area,
  item,
  title,
  fields,
  initial,
  modified,
  photos,
  photo,
  featured,
  single,
  canPublish,
  status,
  sourceMissing = false,
  sourceKey = '',
}: {
  area: string;
  item: string;
  title: string;
  fields: ContentField[];
  initial: Record<string, string>;
  modified: string;
  photos: { id: number; name: string; url: string; alt: string }[];
  photo: number;
  featured: boolean;
  single: boolean;
  canPublish: boolean;
  status: string;
  sourceMissing?: boolean;
  sourceKey?: string;
}) {
  const [state, action, pending] = useActionState(saveContent, {});
  const [values, setValues] = useState(initial);
  const [name, setName] = useState(title);
  const [selected, setSelected] = useState(photo);
  const [preview, setPreview] = useState(false);
  const set = (label: string, value: string) =>
    setValues({ ...values, [label]: value });
  return (
    <form action={action} className="content-editor">
      <input type="hidden" name="area" value={area} />
      <input type="hidden" name="item" value={item} />
      <input type="hidden" name="modified" value={modified} />
      <input type="hidden" name="sourceKey" value={sourceKey} />
      <div className="content-editor-main">
        {sourceMissing && (
          <p className="collection-note">
            Review this content before publishing its first saved version.
          </p>
        )}
        <section className="editor-card">
          <h3>
            {area === 'profile'
              ? 'PI information'
              : area === 'people'
                ? 'Member information'
                : area === 'funding'
                  ? 'Funder information'
                  : 'Content information'}
          </h3>
          {!single && (
            <label>
              {area === 'people'
                ? 'Full name'
                : area === 'publications'
                  ? 'Publication title'
                  : area === 'updates'
                    ? 'Update title'
                    : area === 'funding'
                      ? 'Funder name'
                      : 'Name / title'}
              <input
                name="title"
                required
                maxLength={500}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          )}
          {fields.map((field, index) => (
            <label key={field.label}>
              <span id={`content-field-${index}`}>
                {field.label === 'Link'
                  ? 'Publication URL'
                  : field.label === 'Role'
                    ? 'Position'
                    : field.label === 'Status'
                      ? area === 'people'
                        ? 'Current / alumni status'
                        : 'Publication status'
                      : field.label === 'People Header'
                        ? 'Team Header'
                        : field.label}
              </span>
              {field.options ? (
                <select
                  aria-labelledby={`content-field-${index}`}
                  name={field.label}
                  value={values[field.label] || ''}
                  onChange={(event) => set(field.label, event.target.value)}
                >
                  <option value="">Choose…</option>
                  {values[field.label] &&
                    !field.options.includes(values[field.label]) && (
                      <option value={values[field.label]}>
                        {values[field.label]}
                      </option>
                    )}
                  {field.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'long' ? (
                <textarea
                  aria-labelledby={`content-field-${index}`}
                  name={field.label}
                  rows={
                    field.label === 'Biography' || field.label === 'Full Story'
                      ? 7
                      : 3
                  }
                  value={values[field.label] || ''}
                  onChange={(event) => set(field.label, event.target.value)}
                />
              ) : (
                <input
                  aria-labelledby={`content-field-${index}`}
                  name={field.label}
                  type={field.type || 'text'}
                  value={values[field.label] || ''}
                  min={field.type === 'number' ? 0 : undefined}
                  maxLength={
                    field.type === 'number' || field.type === 'date'
                      ? undefined
                      : 30000
                  }
                  onChange={(event) => set(field.label, event.target.value)}
                  required={area === 'profile' && field.label === 'Name'}
                />
              )}
              {field.help && (
                <span className="admin-field-help">{field.help}</span>
              )}
            </label>
          ))}
        </section>
      </div>
      <aside className="content-editor-aside">
        {hasPhoto(area) ? (
          <section className="editor-card">
            <h3>
              {area === 'people' || area === 'profile'
                ? 'Profile photo'
                : area === 'publications'
                  ? 'Graphical abstract'
                  : area === 'funding'
                    ? 'Funder logo'
                    : 'Photo'}
            </h3>
            {photos.find((p) => p.id === selected)?.url ? (
              <Image
                unoptimized
                width={320}
                height={240}
                src={photos.find((p) => p.id === selected)!.url}
                alt={
                  photos.find((p) => p.id === selected)!.alt || 'Selected photo'
                }
                className="editor-photo"
              />
            ) : (
              <div className="editor-photo-empty">No photo selected</div>
            )}
            <label>
              Choose a photo
              <select
                aria-label="Choose a photo"
                name="photo"
                value={selected}
                onChange={(event) => setSelected(Number(event.target.value))}
              >
                <option value={0}>No photo</option>
                {selected && !photos.some((p) => p.id === selected) && (
                  <option value={selected}>Keep current photo</option>
                )}
                {photos.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Or upload a new photo
              <input
                type="file"
                aria-label="Upload a photo"
                name="upload"
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
            <label>
              Describe the new photo
              <input
                aria-label="Describe the new photo"
                name="photoAlt"
                maxLength={2000}
              />
              <span className="admin-field-help">
                This description makes the image accessible. JPEG, PNG or WebP,
                under 3 MB.
              </span>
            </label>
          </section>
        ) : (
          <input type="hidden" name="photo" value={photo} />
        )}
        <section className="editor-card">
          <h3>Save & publish</h3>
          <label>
            Visibility
            <select
              name="status"
              aria-label="Visibility"
              defaultValue={
                ['draft', 'pending', 'publish'].includes(status)
                  ? status
                  : 'draft'
              }
            >
              <option value="draft">Draft — only visible to editors</option>
              <option value="pending">Send for review</option>
              {canPublish && (
                <option value="publish">
                  Published — visible on the website
                </option>
              )}
            </select>
          </label>
          {(area === 'updates' || area === 'publications') && (
            <label className="editor-check">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={featured}
              />
              {area === 'publications'
                ? 'Highlight this publication'
                : 'Feature on the homepage'}
            </label>
          )}
          {area === 'publications' && (
            <p className="admin-help">
              The homepage Selected Publications section uses the four curated
              Science/JACS papers. Highlighting other papers emphasizes them in
              the full publication list.
            </p>
          )}
          <p className="admin-field-help">
            Published changes refresh automatically. Existing source records are
            retained.
          </p>
          <button
            type="button"
            className="button button-dark"
            onClick={() => setPreview(!preview)}
          >
            {preview ? 'Close content preview' : 'Preview content'}
          </button>
          <button
            className="button button-red"
            disabled={pending || status === 'future'}
          >
            {pending ? 'Saving…' : 'Save changes'}
          </button>
          {status === 'future' && (
            <p role="alert">
              This item is scheduled. Its publication schedule needs review
              before editing here.
            </p>
          )}
          {state.error && (
            <p role="alert" className="admin-error">
              {state.error}
            </p>
          )}
        </section>
      </aside>
      {preview && (
        <section
          className="editor-card content-preview"
          aria-label="Content preview"
        >
          <p className="eyebrow">
            Content preview — website styling may differ
          </p>
          <h3>{single ? values.Name || title : name}</h3>
          {fields
            .filter((f) => values[f.label])
            .map((f) => (
              <div key={f.label}>
                <strong>{f.label}</strong>
                <p style={{ whiteSpace: 'pre-wrap' }}>{values[f.label]}</p>
              </div>
            ))}
        </section>
      )}
    </form>
  );
}

export function VersionHistory({
  area,
  item,
  modified,
  versions,
}: {
  area: string;
  item: string;
  modified: string;
  versions: { id: number; date: string; summary: string }[];
}) {
  const [state, action, pending] = useActionState(restoreContent, {});
  return (
    <section className="editor-card">
      <h3>Version history</h3>
      <p className="admin-field-help">
        Review a saved version before restoring its text. Your current photo and
        visibility stay the same.
      </p>
      {versions.map((version) => (
        <details key={version.id}>
          <summary>{version.date || 'Saved version'}</summary>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {version.summary || 'Saved content'}
          </p>
          <form action={action}>
            <input type="hidden" name="area" value={area} />
            <input type="hidden" name="item" value={item} />
            <input type="hidden" name="modified" value={modified} />
            <input type="hidden" name="revision" value={version.id} />
            <button className="button button-dark" disabled={pending}>
              {pending ? 'Restoring…' : 'Restore this version'}
            </button>
          </form>
        </details>
      ))}
      {!versions.length && <p>No previous versions are available yet.</p>}
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
    </section>
  );
}
