// Read-only public content capture. This script never authenticates or writes to WordPress.
import fs from 'node:fs/promises';
const origin = 'https://people.smu.edu/daslab';
async function collection(path) {
  const records = [];
  let total = 1;
  for (let page = 1; page <= total; page++) {
    const response = await fetch(
      `${origin}/wp-json/wp/v2/${path}?per_page=100&page=${page}`,
      { signal: AbortSignal.timeout(15000) },
    );
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    records.push(...(await response.json()));
    total = Number(response.headers.get('x-wp-totalpages')) || 1;
  }
  return records;
}
const [pages, media] = await Promise.all([
  collection('pages'),
  collection('media'),
]);
const capturedAt = new Date().toISOString();
const snapshot = {
  capturedAt,
  pages: pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title.rendered,
    html: p.content.rendered,
    link: p.link,
    modified: p.modified_gmt,
    featuredMedia: p.featured_media,
    parent: p.parent,
  })),
  media: media.map((m) => ({
    id: m.id,
    url: m.source_url,
    alt: m.alt_text,
    caption: m.caption.rendered,
    width: m.media_details?.width,
    height: m.media_details?.height,
    sizes: m.media_details?.sizes?.large
      ? { large: m.media_details.sizes.large }
      : undefined,
  })),
};
await fs.writeFile(
  new URL('../src/content/wordpress-snapshot.json', import.meta.url),
  JSON.stringify(snapshot, null, 2) + '\n',
);
const plain = (value) =>
  String(value)
    .replace(/<[^>]+>/g, '')
    .replace(/\|/g, '\\|')
    .replace(/\s+/g, ' ')
    .trim();
const rows = media.map(
  (m) =>
    `| ${m.id} | [${plain(m.title.rendered)}](${m.source_url}) | ${m.media_details?.width ?? '?'} × ${m.media_details?.height ?? '?'} | ${plain(m.alt_text) || 'Missing'} | ${m.post ?? '—'} |`,
);
await fs.writeFile(
  new URL('../docs/MEDIA_INVENTORY.md', import.meta.url),
  `# WordPress media inventory\n\nPublic read-only capture: ${capturedAt}. ${media.length} records. Availability and reuse permissions require separate review. Missing alternative text should be repaired in the WordPress Media Library. Linked third-party images embedded directly in pages are not necessarily Media Library records.\n\n| ID | Original file | Dimensions | Alternative text | Attached page/post ID |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`,
);
console.log(
  `Captured ${pages.length} pages and ${media.length} media records. No WordPress content was changed.`,
);
