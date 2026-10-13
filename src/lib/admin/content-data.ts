import 'server-only';
import { wp } from './wordpress';
import type { Session } from './session';
import { contentModel } from './content-model';
import { type WPRecord, rawTitle } from './records';
import { normalizeSite } from '../content/normalize';
import type { Taxonomy, Media } from '../content/types';
export async function allRecords(
  kind: string,
  session: Session,
  capabilities: Record<string, boolean>,
) {
  const records: WPRecord[] = [];
  let total = 1;
  for (let page = 1; page <= total; page++) {
    const context =
      (kind === 'categories' || kind === 'tags') &&
      !capabilities.manage_categories
        ? 'view'
        : 'edit';
    const statuses = [
      'publish',
      'draft',
      'pending',
      'future',
      ...(capabilities[
        kind === 'pages' ? 'read_private_pages' : 'read_private_posts'
      ]
        ? ['private']
        : []),
    ];
    const ownOnly =
      (kind === 'posts' || kind === 'media') && !capabilities.edit_others_posts;
    const response = await wp<WPRecord[]>(
      `${kind}?context=${context}&per_page=100&page=${page}${kind === 'pages' || kind === 'posts' ? `&status=${statuses.join(',')}` : ''}${kind === 'media' ? '&media_type=image' : ''}${ownOnly ? `&author=${session.userId}` : ''}`,
      session,
    );
    records.push(...response.data);
    total = response.pages;
    if (total > 100)
      throw new Error('This collection needs a narrower search.');
  }
  return records;
}
export async function managedData(
  area: string,
  session: Session,
  capabilities: Record<string, boolean>,
) {
  const model = contentModel(area);
  const [pages, posts, media, categories, tags] = await Promise.all([
    capabilities.edit_pages
      ? allRecords('pages', session, capabilities)
      : Promise.resolve([]),
    model.kind === 'posts'
      ? allRecords('posts', session, capabilities)
      : Promise.resolve([]),
    capabilities.upload_files
      ? allRecords('media', session, capabilities)
      : Promise.resolve([]),
    model.kind === 'posts'
      ? allRecords('categories', session, capabilities)
      : Promise.resolve([]),
    model.kind === 'posts'
      ? allRecords('tags', session, capabilities)
      : Promise.resolve([]),
  ]);
  const taxonomy = (records: WPRecord[]): Taxonomy[] =>
    records.map((r) => ({
      id: r.id,
      slug: r.slug || '',
      name: r.name || rawTitle(r),
    }));
  const page = (p: WPRecord) => ({
    id: p.id,
    slug: p.slug || '',
    title: rawTitle(p),
    html: p.content?.rendered ?? p.content?.raw ?? '',
    link: '',
    modified: p.modified_gmt || '',
    featuredMedia: p.featured_media || 0,
    parent: p.parent,
  });
  const publicMedia: Media[] = media.map((m) => ({
    id: m.id,
    url: m.source_url || '',
    alt: m.alt_text || '',
    caption: m.caption?.raw || '',
    ...m.media_details,
  }));
  const site = normalizeSite({
    pages: pages.filter((p) => p.status === 'publish').map(page),
    posts: posts
      .filter((p) => p.status === 'publish')
      .map((p) => ({
        ...page(p),
        date: p.date_gmt ? `${p.date_gmt}Z` : '',
        categories: p.categories || [],
        tags: p.tags || [],
      })),
    media: publicMedia,
    categories: taxonomy(categories),
    tags: taxonomy(tags),
    mode: 'live',
  });
  const parent = pages.find((p) => p.slug === model.parent);
  const category = categories.find((c) => c.slug === model.category);
  const records = model.single
    ? pages.filter((p) => p.slug === model.slug)
    : model.parent
      ? pages.filter((p) => parent && p.parent === parent.id)
      : posts.filter((p) => category && p.categories?.includes(category.id));
  return {
    model,
    pages,
    posts,
    media,
    categories,
    tags,
    site,
    parent,
    category,
    records,
  };
}
