import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { wp, adminSite } from '@/lib/admin/wordpress';
import {
  collection,
  recordId,
  rawTitle,
  type WPRecord,
} from '@/lib/admin/records';
import { templates } from '@/lib/admin/templates';
import { EditorForm, UploadForm } from '@/components/admin/forms';
import { safeUrl } from '@/lib/wordpress/adapters';
import { guidedFields } from '@/lib/admin/guided-parser';
import { textBlocks } from '@/lib/admin/text-blocks';
import { adminSections } from '@/lib/admin/sections';
export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string; id: string }>;
  searchParams: Promise<{
    saved?: string;
    template?: string;
    section?: string;
  }>;
}) {
  const { session } = await requireAdmin();
  const path = await params,
    query = await searchParams;
  let kind;
  try {
    kind = collection(path.collection);
  } catch {
    notFound();
  }
  const isNew = path.id === 'new';
  let record: WPRecord = { id: 0, title: { raw: '' }, status: 'draft' },
    error = '';
  let revisions: WPRecord[] = [];
  let photos: { id: number; label: string; url?: string }[] = [];
  try {
    if (!isNew) {
      const id = recordId(path.id);
      record = (await wp<WPRecord>(`${kind}/${id}?context=edit`, session)).data;
      if (kind === 'pages' || kind === 'posts') {
        try {
          revisions = (
            await wp<WPRecord[]>(
              `${kind}/${id}/revisions?context=edit&per_page=5`,
              session,
            )
          ).data;
        } catch {
          /* content service may not expose revisions to this account. */
        }
      }
    } else {
      const template = query.template ? templates[query.template] : undefined;
      if (template && template.kind === kind) {
        record = {
          ...record,
          title: { raw: template.title },
          slug: template.slug,
          content: { raw: template.content },
        };
        if (template.parentSlug)
          record.parent =
            (
              await wp<WPRecord[]>(
                `pages?context=edit&slug=${encodeURIComponent(template.parentSlug)}`,
                session,
              )
            ).data[0]?.id || 0;
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Could not load this record.';
  }
  if (kind === 'pages' || kind === 'posts')
    try {
      photos = (
        await wp<WPRecord[]>('media?context=edit&per_page=100', session)
      ).data.map((photo) => ({
        id: photo.id,
        label: rawTitle(photo),
        url: photo.source_url ? safeUrl(photo.source_url) : undefined,
      }));
    } catch {
      /* Keep advanced image field if library access is unavailable. */
    }
  const section = adminSections.find(
    (item) => item.key === query.section || item.slug === record.slug,
  );
  return (
    <>
      <nav className="admin-tabs" aria-label="Editor navigation">
        <Link prefetch={false} href="/admin">
          Workspace
        </Link>
        <Link prefetch={false} href={`/admin/${kind}`}>
          Back to {kind}
        </Link>
        {!isNew && !section && (
          <a
            href={`${adminSite()}/wp-admin/${kind === 'categories' || kind === 'tags' ? `term.php?taxonomy=${kind === 'categories' ? 'category' : 'post_tag'}&tag_ID=${record.id}` : `post.php?post=${record.id}&action=edit`}`}
          >
            Open advanced visual editor ↗
          </a>
        )}
      </nav>
      <h2>
        {isNew
          ? kind === 'media'
            ? 'Upload image'
            : 'Create content'
          : section?.label || rawTitle(record)}
      </h2>
      {section && <p className="collection-note">{section.description}</p>}
      {kind === 'media' && record.source_url && safeUrl(record.source_url) && (
        <p className="collection-note">
          File URL: <a href={safeUrl(record.source_url)}>{record.source_url}</a>
        </p>
      )}
      {query.saved === '1' && (
        <p role="status" className="admin-success">
          Changes saved. Reload the website to review; unmigrated or draft
          content may not appear there.
        </p>
      )}
      {error ? (
        <p role="alert" className="admin-error">
          {error}
        </p>
      ) : (
        <section className="admin-panel">
          {isNew && kind === 'media' ? (
            <UploadForm />
          ) : (
            <EditorForm
              kind={kind}
              record={record}
              isNew={isNew}
              blocks={
                kind === 'pages' || kind === 'posts'
                  ? textBlocks(record.content?.raw || '')
                  : []
              }
              photos={photos}
              section={section?.key}
              visualEditorUrl={`${adminSite()}/wp-admin/${kind === 'categories' || kind === 'tags' ? `${isNew ? 'edit-tags.php' : 'term.php'}?taxonomy=${kind === 'categories' ? 'category' : 'post_tag'}${isNew ? '' : `&tag_ID=${record.id}`}` : isNew ? (kind === 'posts' ? 'post-new.php' : 'post-new.php?post_type=page') : `post.php?post=${record.id}&action=edit`}`}
              guided={
                kind === 'pages' || kind === 'posts'
                  ? guidedFields(record.content?.raw || '')
                  : null
              }
            />
          )}
        </section>
      )}
      {revisions.length > 0 && (
        <section className="content-section">
          <h3>Recent revisions</h3>
          <p>
            Compare or restore revisions in the content editor; availability
            follows the site’s revision policy.
          </p>
          <ul>
            {revisions.map((revision) => (
              <li key={revision.id}>
                <a
                  href={`${adminSite()}/wp-admin/revision.php?revision=${revision.id}`}
                >
                  Revision {revision.id} ·{' '}
                  {revision.modified_gmt || 'Date not supplied'} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
