import { load } from 'cheerio';
import type { GuidedField } from './guided-values';
// Offer plain fields only when no original formatting, embeds or blocks can be lost.
export function guidedFields(html: string): GuidedField[] | null {
  if (!html.trim() || html.includes('<!--')) return null;
  const $ = load(html),
    children = $('body').children().toArray();
  const fields: GuidedField[] = [];
  for (const child of children) {
    const el = $(child);
    if (
      el.is('h2') &&
      !el.children().length &&
      !Object.keys(el.attr() || {}).length
    ) {
      const label = el.text().trim();
      if (!label || fields.some((field) => field.label === label)) return null;
      fields.push({ label, value: '' });
    } else if (
      el.is('p') &&
      fields.length &&
      !el.find('*').not('br').length &&
      !Object.keys(el.attr() || {}).length &&
      !el
        .find('br')
        .toArray()
        .some((node) => Object.keys($(node).attr() || {}).length)
    ) {
      const field = fields.at(-1)!;
      el.find('br').replaceWith('\n');
      field.value += (field.value ? '\n\n' : '') + el.text();
    } else return null;
  }
  // Reject orphan top-level text, which HTML editing must preserve.
  if (
    $('body')
      .contents()
      .toArray()
      .some((node) => node.type === 'text' && node.data.trim())
  )
    return null;
  return fields.length ? fields : null;
}
