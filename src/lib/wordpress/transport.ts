import type {
  CmsPage,
  CmsPost,
  Media,
  SiteContent,
  Taxonomy,
} from '../content/types';
interface WPPage {
  id: number;
  slug: string;
  title?: { rendered: string };
  content?: { rendered: string };
  link?: string;
  modified_gmt?: string;
  featured_media?: number;
  parent?: number;
  author?: number;
  excerpt?: { rendered: string };
  date_gmt?: string;
  categories?: number[];
  tags?: number[];
  _embedded?: { 'wp:featuredmedia'?: WPMedia[] };
}
interface WPMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  caption?: { rendered: string };
  media_details?: { width?: number; height?: number; sizes?: Media['sizes'] };
}
export async function collection<T>(
  base: string,
  path: string,
  request: typeof fetch = fetch,
): Promise<T[]> {
  const result: T[] = [];
  let total = 1;
  for (let page = 1; page <= total; page++) {
    const options: RequestInit & { next: { revalidate: number } } = {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(15000),
    };
    const response = await request(
      `${base}/wp-json/wp/v2/${path}?per_page=100&page=${page}${path === 'pages' || path === 'posts' ? '&_embed=wp:featuredmedia' : ''}`,
      options,
    );
    if (!response.ok)
      throw new Error(`WordPress ${path}: HTTP ${response.status}`);
    const body: unknown = await response.json();
    if (!Array.isArray(body))
      throw new Error(`WordPress ${path}: invalid collection`);
    result.push(...(body as T[]));
    total = Number(response.headers.get('x-wp-totalpages')) || 1;
    if (!Number.isInteger(total) || total < 1 || total > 100)
      throw new Error('Invalid WordPress pagination');
  }
  return result;
}
function normalize(p: WPPage): CmsPage {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered ?? '',
    html: p.content?.rendered ?? '',
    link: p.link ?? '',
    modified: p.modified_gmt ?? '',
    featuredMedia: p.featured_media ?? 0,
    parent: p.parent,
    author: p.author,
    excerpt: p.excerpt?.rendered ?? '',
  };
}
export async function loadLiveContent(
  base: string,
  request: typeof fetch = fetch,
  report: (message: string) => void = console.error,
): Promise<SiteContent> {
  try {
    const pages = await collection<WPPage>(base, 'pages', request);
    const additional = await Promise.allSettled([
      collection<WPMedia>(base, 'media', request),
      collection<WPPage>(base, 'posts', request),
      collection<Taxonomy>(base, 'categories', request),
      collection<Taxonomy>(base, 'tags', request),
    ]);
    const values = additional.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      report(
        `WordPress auxiliary collection ${i} unavailable: ${r.reason instanceof Error ? r.reason.message : 'Request failed'}`,
      );
      return [];
    });
    const featured = [...pages, ...(values[1] as WPPage[])].flatMap(
      (p) => p._embedded?.['wp:featuredmedia'] ?? [],
    );
    const rawMedia = [
      ...new Map(
        [...featured, ...(values[0] as WPMedia[])]
          .filter((m) => m.id && m.source_url)
          .map((m) => [m.id, m]),
      ).values(),
    ];
    const media: Media[] = rawMedia.map((m) => ({
      id: m.id,
      url: m.source_url,
      alt: m.alt_text ?? '',
      caption: m.caption?.rendered ?? '',
      ...m.media_details,
    }));
    const posts: CmsPost[] = (values[1] as WPPage[]).map((p) => ({
      ...normalize(p),
      date: p.date_gmt ? `${p.date_gmt}Z` : '',
      categories: p.categories ?? [],
      tags: p.tags ?? [],
    }));
    return {
      pages: pages.map(normalize),
      media,
      posts,
      categories: values[2] as Taxonomy[],
      tags: values[3] as Taxonomy[],
      mode: 'live',
    };
  } catch (error) {
    report(
      `WordPress content unavailable: ${error instanceof Error ? error.message : 'Request failed'}`,
    );
    return {
      pages: [],
      media: [],
      posts: [],
      categories: [],
      tags: [],
      mode: 'unavailable',
    };
  }
}
