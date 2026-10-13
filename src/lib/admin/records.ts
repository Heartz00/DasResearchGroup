export const collections = [
  'pages',
  'posts',
  'media',
  'categories',
  'tags',
] as const;
export type Collection = (typeof collections)[number];
export function collection(value: string): Collection {
  if (!collections.includes(value as Collection))
    throw new Error('Unknown content collection');
  return value as Collection;
}
export function recordId(value: string, zero = false) {
  if (!/^\d+$/.test(value)) throw new Error('Invalid record ID');
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < (zero ? 0 : 1))
    throw new Error('Invalid record ID');
  return id;
}
export type WPRecord = {
  id: number;
  title?: { raw?: string; rendered?: string };
  content?: { raw?: string; rendered?: string };
  excerpt?: { raw?: string };
  name?: string;
  slug?: string;
  description?: string;
  status?: string;
  modified_gmt?: string;
  parent?: number;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
  alt_text?: string;
  caption?: { raw?: string };
  source_url?: string;
  date_gmt?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: import('../content/types').Media['sizes'];
  };
};
export function rawTitle(record: WPRecord) {
  return (
    record.title?.raw ??
    record.name ??
    record.title?.rendered ??
    `Record ${record.id}`
  );
}
export function payload(
  kind: Collection,
  form: FormData,
): Record<string, unknown> {
  const string = (key: string, limit = 200000) => {
    const value = form.get(key);
    if (typeof value !== 'string' || value.length > limit)
      throw new Error(`Check the ${key.replaceAll('_', ' ')} field.`);
    return value;
  };
  const title = string('title', 500).trim();
  if (!title) throw new Error('A title or name is required.');
  const slug = string('slug', 200).trim();
  if (kind === 'categories' || kind === 'tags')
    return {
      name: title,
      slug,
      description: string('description', 20000),
      ...(kind === 'categories'
        ? { parent: recordId(string('parent'), true) }
        : {}),
    };
  if (kind === 'media')
    return {
      title,
      slug,
      alt_text: string('alt_text', 2000),
      caption: string('caption', 20000),
      description: string('content'),
    };
  const status = string('status');
  if (!['draft', 'pending', 'publish', 'private'].includes(status))
    throw new Error('Select a supported publication status.');
  const ids = (key: string) => {
    const value = string(key, 1000).trim();
    return value
      ? [...new Set(value.split(',').map((id) => recordId(id.trim())))]
      : [];
  };
  return {
    title,
    slug,
    content: string('content'),
    excerpt: string('excerpt', 20000),
    status,
    featured_media: recordId(string('featured_media'), true),
    ...(kind === 'pages'
      ? { parent: recordId(string('parent'), true) }
      : { categories: ids('categories'), tags: ids('tags') }),
  };
}
export function imageType(bytes: Uint8Array) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return { mime: 'image/jpeg', extension: 'jpg' };
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b))
    return { mime: 'image/png', extension: 'png' };
  if (
    Buffer.from(bytes.subarray(0, 4)).toString() === 'RIFF' &&
    Buffer.from(bytes.subarray(8, 12)).toString() === 'WEBP'
  )
    return { mime: 'image/webp', extension: 'webp' };
  throw new Error('Upload a JPEG, PNG or WebP image.');
}
