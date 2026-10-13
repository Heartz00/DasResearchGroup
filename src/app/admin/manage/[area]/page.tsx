import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { managedData } from '@/lib/admin/content-data';
import { contentKey, photoKey } from '@/lib/wordpress/content-keys';
import { contentDefaults } from '@/lib/admin/content-defaults';
import { contentModel } from '@/lib/admin/content-model';
import {
  contentValues,
  profileKey,
  publicationKey,
  updateKey,
} from '@/lib/admin/content-values';
import { rawTitle, type WPRecord } from '@/lib/admin/records';
import { sections, text, safeUrl } from '@/lib/wordpress/adapters';
import ContentEditor, {
  VersionHistory,
} from '@/components/admin/content-editor';
import { wp } from '@/lib/admin/wordpress';
export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ item?: string; saved?: string; search?: string }>;
}) {
  const { area } = await params;
  let model;
  try {
    model = contentModel(area);
  } catch {
    notFound();
  }
  const { session, user } = await requireAdmin();
  const query = await searchParams;
  let data;
  try {
    data = await managedData(area, session, user.capabilities);
  } catch (error) {
    return (
      <p role="alert" className="admin-error">
        {error instanceof Error
          ? error.message
          : 'Could not load your content.'}
      </p>
    );
  }
  const base = `/admin/manage/${area}`;
  const existing =
    query.item === 'overview' && area === 'research'
      ? data.parent
      : model.single
        ? data.records[0]
        : data.records.find((r) => String(r.id) === query.item);
  const fallback =
    model.single && !existing
      ? data.pages.find((p) => p.slug === (model.fallback || model.slug))
      : undefined;
  let record: WPRecord | undefined = existing || fallback;
  let values = contentValues(area, record?.content?.raw || '');
  if (model.single) {
    const saved = sections(record?.content?.raw || '');
    for (const [label, value] of Object.entries(
      contentDefaults(area, data.site),
    ))
      if (!Object.hasOwn(saved, label.toLowerCase())) values[label] = value;
  }
  if (!record && area === 'homepage')
    values = {
      ...values,
      'Hero Eyebrow': data.site.heroEyebrow,
      'Hero Title': data.site.heroTitle,
      'Hero Subtitle': data.site.heroSubtitle,
      'Hero Description': data.site.heroDescription,
      'Primary CTA': data.site.primaryLabel,
      'Primary Link': data.site.primaryHref,
      'Secondary CTA': data.site.secondaryLabel,
      'Secondary Link': data.site.secondaryHref,
      'Atomic Scale': text(data.site.atomicHtml),
      'Join Us CTA Title': data.site.joinCtaTitle,
      'Join Us CTA Description': text(data.site.joinCtaHtml),
      'Join Us CTA Button': data.site.joinCtaLabel,
      'Join Us CTA Link': data.site.joinCtaHref,
    };
  let title = record ? rawTitle(record) : '';
  let photo =
    record?.featured_media ||
    Number(record?.content?.raw?.match(/wp-image-(\d+)/)?.[1]) ||
    0;
  if ((!record || record.status === 'publish') && area.endsWith('-header')) {
    const header = data.site.pageHeaders[area.replace('-header', '')];
    photo =
      data.media.find(
        (m) =>
          m.source_url === header?.photo?.url ||
          m.media_details?.sizes?.large?.source_url === header?.photo?.url,
      )?.id || 0;
    if (!record)
      values['Text Style'] =
        header?.lightText === false ? 'Navy text' : 'White text';
  }
  if (
    /^(yes|true|1)$/i.test(
      text(sections(record?.content?.raw || '')['photo hidden'] || ''),
    )
  )
    photo = 0;
  const legacyItem =
    query.item?.startsWith('legacy-') || query.item?.startsWith('archive-');
  let sourceKey = '';
  let citationReference =
    area === 'publications'
      ? text(sections(record?.content?.raw || '')['original citation'] || '')
      : '';
  if (legacyItem) {
    record = undefined;
    values = contentValues(area, '');
    if (area === 'people') {
      const p = data.site.roster.find((p) => p.id === query.item);
      if (!p) notFound();
      title = p.name;
      sourceKey = profileKey(p);
      values.Role =
        (
          {
            'Graduate Students': 'Graduate Researchers',
            'Postdoctoral Fellows': 'Postdoctoral Researchers',
            'Undergraduate Students': 'Undergraduate Researchers',
            'Former Members': 'Researchers',
          } as Record<string, string>
        )[p.role] || p.role;
      values.Status = p.alumni ? 'Alumni' : 'Current';
      values.Biography = text(p.html);
      values['Research Interests'] = p.interests || '';
      values.Email = p.email || '';
      photo =
        data.media.find(
          (m) =>
            m.source_url === p.photo?.url ||
            m.media_details?.sizes?.large?.source_url === p.photo?.url,
        )?.id || 0;
    } else if (area === 'publications') {
      const p = data.site.publications.find((p) => p.id === query.item);
      if (!p) notFound();
      title = p.title;
      sourceKey = publicationKey(p);
      citationReference = text(p.html);
      values.Year = String(p.year || '');
      values.Status = p.status;
      values.DOI = p.doi || '';
      values.Link = p.link || '';
      values.Affiliation = p.prior ? 'Prior to SMU' : 'SMU';
      photo =
        data.media.find(
          (m) =>
            m.source_url === p.photo?.url ||
            m.media_details?.sizes?.large?.source_url === p.photo?.url,
        )?.id || 0;
    } else if (area === 'photos' || area === 'facilities') {
      const images =
        area === 'photos'
          ? data.site.legacyGallery
          : data.site.legacyInstrumentPhotos;
      const image = images[Number(query.item!.slice(7))];
      if (!image) notFound();
      sourceKey = photoKey(image);
      title =
        image.caption ||
        image.alt ||
        `${area === 'photos' ? 'Lab photograph' : 'Instrument photograph'} ${Number(query.item!.slice(7)) + 1}`;
      if (area === 'photos') {
        values.Caption = image.caption;
        values['People Header'] =
          image.url === data.site.peopleHeaderPhoto?.url ? 'Yes' : 'No';
      }
      photo =
        data.media.find(
          (m) =>
            m.source_url === image.url ||
            m.media_details?.sizes?.large?.source_url === image.url,
        )?.id || 0;
    } else if (area === 'updates') {
      const n = data.site.news.find((n) => n.id === query.item);
      if (!n) notFound();
      title = n.title;
      sourceKey = updateKey(n);
      values['Full Story'] = text(n.html);
      values['External Link'] = n.link || '';
    } else notFound();
  }
  if (
    query.item &&
    query.item !== 'new' &&
    !existing &&
    !legacyItem &&
    !model.single
  )
    notFound();
  const editing = !!model.single || !!query.item;
  let versions: { id: number; date: string; summary: string }[] = [];
  if (editing && existing)
    try {
      versions = (
        await wp<WPRecord[]>(
          `${model.kind}/${existing.id}/revisions?context=edit&per_page=5`,
          session,
        )
      ).data.map((version) => ({
        id: version.id,
        date: version.modified_gmt
          ? version.modified_gmt.replace('T', ' ') + ' UTC'
          : '',
        summary: Object.entries(contentValues(area, version.content?.raw || ''))
          .filter(([, value]) => value)
          .map(([label, value]) => `${label}: ${value}`)
          .join('\n\n')
          .slice(0, 1800),
      }));
    } catch {
      /* History may be restricted by the content provider. */
    }
  const cards: { id: string; name: string; detail: string; image?: string }[] =
    data.records.map((record) => ({
      id: String(record.id),
      name: rawTitle(record),
      detail:
        `${text(sections(record.content?.raw || '').role ?? '')} ${record.status === 'publish' ? 'Published' : record.status === 'pending' ? 'In review' : 'Draft'}`.trim(),
      image: data.media.find((m) => m.id === record.featured_media)?.source_url,
    }));
  if (area === 'people')
    cards.push(
      ...data.site.roster
        .filter(
          (p) =>
            p.id.startsWith('legacy-') &&
            !data.records.some(
              (r) =>
                contentKey(
                  sections(r.content?.raw || '')['legacy source'] ?? '',
                ) === profileKey(p),
            ),
        )
        .map((p) => ({
          id: p.id,
          name: p.name || 'Member profile — name needed',
          detail: p.alumni ? 'Alumni' : p.role,
          image: p.photo?.url,
        })),
    );
  if (area === 'publications')
    cards.push(
      ...data.site.publications
        .filter(
          (p) =>
            p.id.startsWith('legacy-') &&
            !data.records.some(
              (r) =>
                contentKey(
                  sections(r.content?.raw || '')['legacy source'] ?? '',
                ) === publicationKey(p),
            ),
        )
        .map((p) => ({
          id: p.id,
          name: p.title,
          detail: `${p.year || 'Year not entered'} · ${p.status}`,
        })),
    );
  if (area === 'updates')
    cards.push(
      ...data.site.news
        .filter(
          (n) =>
            n.id.startsWith('archive-') &&
            !data.records.some(
              (r) =>
                contentKey(
                  sections(r.content?.raw || '')['legacy source'] ?? '',
                ) === updateKey(n),
            ),
        )
        .map((n) => ({
          id: n.id,
          name: n.title,
          detail: 'Existing lab update',
        })),
    );
  if (area === 'photos' || area === 'facilities')
    cards.push(
      ...(area === 'photos'
        ? data.site.legacyGallery
        : data.site.legacyInstrumentPhotos
      ).flatMap((image, index) =>
        data.records.some(
          (r) =>
            contentKey(
              sections(r.content?.raw || '')['legacy source'] || '',
            ) === photoKey(image),
        )
          ? []
          : [
              {
                id: `legacy-${index}`,
                name:
                  image.caption ||
                  image.alt ||
                  `${area === 'photos' ? 'Lab photograph' : 'Instrument photograph'} ${index + 1}`,
                detail:
                  area === 'photos'
                    ? 'Existing gallery photo'
                    : 'Existing instrument photo · Details needed',
                image: image.url,
              },
            ],
      ),
    );
  return (
    <>
      <nav className="admin-tabs" aria-label="Content navigation">
        <Link href="/admin">Overview</Link>
        {!model.single && editing && (
          <Link href={base}>Back to {model.label.toLowerCase()}</Link>
        )}
      </nav>
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Manage content</p>
          <h2>
            {editing
              ? model.single
                ? model.label
                : query.item === 'new'
                  ? `Add ${model.singular}`
                  : `Edit ${model.singular}`
              : model.label}
          </h2>
        </div>
        {!model.single && !editing && (
          <Link className="button button-red" href={`${base}?item=new`}>
            Add {model.singular}
          </Link>
        )}
      </div>
      {query.saved === '1' && (
        <p role="status" className="admin-success">
          Changes saved. Drafts stay private; published content will refresh on
          the website.
        </p>
      )}
      {editing && citationReference && (
        <details className="admin-help">
          <summary>Current citation</summary>
          <p>{citationReference}</p>
          <p>
            Use this reference to complete individual citation fields. The
            original citation is preserved until you enter structured details.
          </p>
        </details>
      )}
      {area === 'facilities' && legacyItem && (
        <p className="admin-help">
          This existing content entry contains a photograph. Enter the approved
          instrument name and technical details; fields without source
          information are left blank.
        </p>
      )}
      {editing ? (
        <ContentEditor
          key={`${existing?.id || query.item || area}:${existing?.modified_gmt || ''}:${existing?.featured_media || 0}`}
          area={area}
          item={
            query.item === 'overview'
              ? 'overview'
              : existing
                ? String(existing.id)
                : query.item || 'new'
          }
          title={
            model.single || query.item === 'overview'
              ? title || model.label
              : title
          }
          fields={model.fields}
          initial={values}
          modified={existing?.modified_gmt || ''}
          photos={data.media.flatMap((m) => {
            const url = safeUrl(m.source_url);
            return url
              ? [{ id: m.id, name: rawTitle(m), url, alt: m.alt_text || '' }]
              : [];
          })}
          photo={photo}
          featured={
            !!existing?.tags?.some((id) =>
              data.tags.some((t) => t.id === id && t.slug === 'featured'),
            )
          }
          single={!!model.single || query.item === 'overview'}
          canPublish={
            !!user.capabilities[
              model.kind === 'pages' ? 'publish_pages' : 'publish_posts'
            ]
          }
          status={
            existing?.status || (legacyItem || fallback ? 'publish' : 'draft')
          }
          sourceMissing={!!model.single && !record}
          sourceKey={sourceKey}
        />
      ) : (
        <>
          {area === 'research' && data.parent && (
            <Link className="button button-dark" href={`${base}?item=overview`}>
              Edit research overview
            </Link>
          )}
          <form className="admin-search">
            <label htmlFor="manage-search">
              Search {model.label.toLowerCase()}
            </label>
            <input
              id="manage-search"
              name="search"
              defaultValue={query.search || ''}
            />
            <button className="button button-dark">Search</button>
          </form>
          <div className="managed-list">
            {cards
              .filter((c) =>
                c.name
                  .toLowerCase()
                  .includes((query.search || '').toLowerCase()),
              )
              .map((card) => (
                <Link
                  key={card.id}
                  className="managed-item"
                  href={`${base}?item=${card.id}`}
                >
                  {card.image && safeUrl(card.image) && (
                    <Image
                      unoptimized
                      width={72}
                      height={72}
                      src={safeUrl(card.image)!}
                      alt=""
                    />
                  )}
                  <div>
                    <h3>{card.name}</h3>
                    <p>{card.detail}</p>
                  </div>
                  <span className="text-link">Edit →</span>
                </Link>
              ))}
          </div>
          {!cards.length && (
            <div className="empty-state">
              <h3>No {model.label.toLowerCase()} yet</h3>
              <p>
                Add your first {model.singular} and save a draft while you work.
              </p>
            </div>
          )}
        </>
      )}
      {editing && existing && (
        <VersionHistory
          area={area}
          item={query.item === 'overview' ? 'overview' : String(existing.id)}
          modified={existing.modified_gmt || ''}
          versions={versions}
        />
      )}
    </>
  );
}
