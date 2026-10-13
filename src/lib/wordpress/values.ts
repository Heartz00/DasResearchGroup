import { load } from 'cheerio';
export function text(html: string): string {
  return load(html).text().replace(/\s+/g, ' ').trim();
}
export function safeUrl(value?: string): string | undefined {
  if (!value) return;
  try {
    const u = new URL(value);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
  } catch {
    /* Invalid links are omitted. */
  }
}
