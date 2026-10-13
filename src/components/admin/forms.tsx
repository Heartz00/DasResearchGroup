'use client';
import { useActionState, useState } from 'react';
import Image from 'next/image';
import { login, saveRecord, uploadImage } from '@/app/admin/actions';
import { rawTitle, type Collection, type WPRecord } from '@/lib/admin/records';
import { serializeFields, type GuidedField } from '@/lib/admin/guided-values';
import {
  replaceTextBlocks,
  type TextBlock,
} from '@/lib/admin/text-block-values';
export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="admin-form">
      <label>
        Username
        <input
          name="username"
          autoComplete="username"
          required
          maxLength={100}
        />
      </label>
      <label>
        Access key
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
        />
      </label>
      <p className="muted">
        Use the personal access key for your editing account. Your SMU password
        does not work here. Ask the website manager if you need access.
      </p>
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button className="button button-red" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
export function EditorForm({
  kind,
  record,
  isNew = false,
  guided = null,
  blocks = [],
  photos = [],
  section = '',
  visualEditorUrl,
}: {
  kind: Collection;
  record: WPRecord;
  isNew?: boolean;
  guided?: GuidedField[] | null;
  blocks?: TextBlock[];
  photos?: { id: number; label: string; url?: string }[];
  section?: string;
  visualEditorUrl: string;
}) {
  const [state, action, pending] = useActionState(saveRecord, {});
  const useGuided = !!guided;
  const [sections, setSections] = useState(guided || []);
  const useBlocks = !guided && blocks.length > 0;
  const [paragraphs, setParagraphs] = useState(
    blocks.map((block) => block.value),
  );
  const [values, setValues] = useState<Record<string, string>>({
    title: rawTitle(record),
    slug: record.slug || '',
    content: record.content?.raw || '',
    excerpt: record.excerpt?.raw || '',
    status: record.status || 'draft',
    parent: String(record.parent || 0),
    featured_media: String(record.featured_media || 0),
    categories: record.categories?.join(', ') || '',
    tags: record.tags?.join(', ') || '',
    alt_text: record.alt_text || '',
    caption: record.caption?.raw || '',
    description: record.description || '',
  });
  const field = (name: string, label: string, large = false, help?: string) => (
    <label key={name}>
      <span id={`admin-label-${name}`}>{label}</span>
      {large ? (
        <textarea
          aria-labelledby={`admin-label-${name}`}
          aria-describedby={help ? `admin-help-${name}` : undefined}
          name={name}
          value={values[name]}
          onChange={(e) => setValues({ ...values, [name]: e.target.value })}
          rows={name === 'content' ? 20 : 4}
        />
      ) : (
        <input
          aria-labelledby={`admin-label-${name}`}
          aria-describedby={help ? `admin-help-${name}` : undefined}
          name={name}
          value={values[name]}
          onChange={(e) => setValues({ ...values, [name]: e.target.value })}
          required={name === 'title'}
        />
      )}
      {help && (
        <span id={`admin-help-${name}`} className="admin-field-help">
          {help}
        </span>
      )}
    </label>
  );
  const term = kind === 'categories' || kind === 'tags';
  const content = kind === 'pages' || kind === 'posts';
  const unsupportedStatus =
    content &&
    !!record.status &&
    !['draft', 'pending', 'publish', 'private'].includes(record.status);
  const updateSection = (index: number, value: string) => {
    const next = sections.map((item, i) =>
      i === index ? { ...item, value } : item,
    );
    setSections(next);
    setValues({ ...values, content: serializeFields(next) });
  };
  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="collection" value={kind} />
      <input type="hidden" name="id" value={isNew ? 'new' : record.id} />
      <input type="hidden" name="modified" value={record.modified_gmt || ''} />
      <input type="hidden" name="section" value={section} />
      {field('title', term ? 'Name' : 'Title')}
      {content && (
        <label>
          Publication status
          <select
            name="status"
            value={values.status}
            onChange={(e) => setValues({ ...values, status: e.target.value })}
          >
            <option value="draft">Draft — not public</option>
            <option value="pending">Pending review</option>
            <option value="publish">Published</option>
            <option value="private">Private</option>
          </select>
        </label>
      )}
      {content && photos.length > 0 && (
        <fieldset className="admin-photo-picker">
          <legend>Featured photo</legend>
          <input
            type="hidden"
            name="featured_media"
            value={values.featured_media}
          />
          <select
            aria-label="Featured photo"
            value={values.featured_media}
            onChange={(event) =>
              setValues({ ...values, featured_media: event.target.value })
            }
          >
            <option value="0">No featured photo</option>
            {!photos.some(
              (photo) => String(photo.id) === values.featured_media,
            ) &&
              values.featured_media !== '0' && (
                <option value={values.featured_media}>
                  Keep current photo
                </option>
              )}
            {photos.map((photo) => (
              <option key={photo.id} value={photo.id}>
                {photo.label}
              </option>
            ))}
          </select>
          {photos.find((photo) => String(photo.id) === values.featured_media)
            ?.url && (
            <Image
              unoptimized
              width={240}
              height={160}
              src={
                photos.find(
                  (photo) => String(photo.id) === values.featured_media,
                )!.url!
              }
              alt="Selected featured photo"
            />
          )}
          <a
            className="text-link"
            href="/admin/media/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            Upload a new photo ↗
          </a>
        </fieldset>
      )}
      {!term && useGuided ? (
        <fieldset className="admin-guided">
          <legend>Content details</legend>
          <input type="hidden" name="content" value={values.content} />
          {sections.map((section, index) => (
            <label key={section.label}>
              <span id={`guided-label-${index}`}>{section.label}</span>
              {/featured/i.test(section.label) ? (
                <select
                  aria-labelledby={`guided-label-${index}`}
                  value={section.value}
                  onChange={(event) => updateSection(index, event.target.value)}
                >
                  <option value="">Not selected</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : /^(email|.*url|google scholar|orcid|linkedin|personal website|doi|year|start year|end year|display order)$/i.test(
                  section.label,
                ) ? (
                <input
                  aria-labelledby={`guided-label-${index}`}
                  type={
                    /email/i.test(section.label)
                      ? 'email'
                      : /year|order/i.test(section.label)
                        ? 'number'
                        : /doi/i.test(section.label)
                          ? 'text'
                          : 'url'
                  }
                  min={/year/i.test(section.label) ? 1900 : 0}
                  step="1"
                  value={section.value}
                  onChange={(event) => updateSection(index, event.target.value)}
                />
              ) : (
                <textarea
                  aria-labelledby={`guided-label-${index}`}
                  rows={section.value.length > 140 ? 5 : 2}
                  value={section.value}
                  onChange={(event) => {
                    updateSection(index, event.target.value);
                  }}
                />
              )}
            </label>
          ))}
        </fieldset>
      ) : useBlocks && !term ? (
        <fieldset className="admin-guided">
          <legend>Update your text</legend>
          <input type="hidden" name="content" value={values.content} />
          <p className="admin-field-help">
            Edit the text below. Existing images, links and formatted content
            are kept. Use content service’s visual editor to change formatting
            or images.
          </p>
          {blocks.map((block, index) => (
            <label key={block.start}>
              <span id={`text-label-${index}`}>
                {index === 0 ? 'Opening text' : `Text ${index + 1}`}
              </span>
              <textarea
                aria-labelledby={`text-label-${index}`}
                rows={paragraphs[index].length > 200 ? 6 : 2}
                value={paragraphs[index]}
                onChange={(event) => {
                  const next = paragraphs.map((value, i) =>
                    i === index ? event.target.value : value,
                  );
                  setParagraphs(next);
                  setValues({
                    ...values,
                    content: replaceTextBlocks(
                      record.content?.raw || '',
                      blocks,
                      next,
                    ),
                  });
                }}
              />
            </label>
          ))}
        </fieldset>
      ) : (
        !term && (
          <>
            <input type="hidden" name="content" value={values.content} />
            <p className="admin-field-help">
              Use content service’s visual editor for this content. Existing
              text and formatting are preserved when saving the other fields
              here.
            </p>
          </>
        )
      )}
      {!term && (
        <a className="text-link" href={visualEditorUrl}>
          Open advanced visual editor ↗
        </a>
      )}
      <details className="admin-advanced">
        <summary>Advanced publishing settings</summary>
        {field('slug', 'URL slug')}
        {content && (
          <input type="hidden" name="excerpt" value={values.excerpt} />
        )}
        {content && photos.length === 0 && (
          <input
            type="hidden"
            name="featured_media"
            value={values.featured_media}
          />
        )}
        {(kind === 'pages' || kind === 'categories') && (
          <input type="hidden" name="parent" value={values.parent} />
        )}
        {kind === 'posts' && (
          <>
            <input type="hidden" name="categories" value={values.categories} />
            <input type="hidden" name="tags" value={values.tags} />
            <p className="admin-field-help">
              Choose categories and featured tags using the named controls in
              content service.
            </p>
          </>
        )}
      </details>
      {term &&
        (/<|\[[\w-]+\b/.test(values.description) ? (
          <>
            <input
              type="hidden"
              name="description"
              value={values.description}
            />
            <a className="text-link" href={visualEditorUrl}>
              Edit description in the content editor ↗
            </a>
          </>
        ) : (
          field('description', 'Description', true)
        ))}
      {kind === 'media' && (
        <>
          {field(
            'alt_text',
            'Alternative text',
            false,
            'Describe the image meaningfully. Avoid filenames or generic “image” labels.',
          )}
          <input type="hidden" name="caption" value={values.caption} />
          <p className="admin-field-help">
            Edit the caption and description using content service’s visual
            editor.
          </p>
        </>
      )}
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <p className="muted">
        Save a draft while you work, or choose Published when the content is
        ready. Check the website after saving.
      </p>
      {unsupportedStatus && (
        <p role="alert" className="admin-error">
          This record uses the {record.status} status. Edit it in the content
          editor to preserve its scheduling or archive state.
        </p>
      )}
      <button
        className="button button-red"
        disabled={pending || unsupportedStatus}
      >
        {pending ? 'Saving changes…' : 'Save changes'}
      </button>
    </form>
  );
}
export function UploadForm() {
  const [state, action, pending] = useActionState(uploadImage, {});
  return (
    <form action={action} className="admin-form">
      <label>
        Image
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </label>
      <label>
        Alternative text
        <input name="alt_text" maxLength={2000} />
      </label>
      <p className="muted">
        JPEG, PNG or WebP, under 3 MB. Upload only images the lab has permission
        to use.
      </p>
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button className="button button-red" disabled={pending}>
        {pending ? 'Uploading…' : 'Upload photo'}
      </button>
    </form>
  );
}
