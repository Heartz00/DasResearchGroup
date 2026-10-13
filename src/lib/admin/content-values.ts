import { load } from 'cheerio';
import { cleanHtml, sections, text, safeUrl } from '../wordpress/adapters';
import { fieldDoi, fieldEmail, fieldYear } from '../wordpress/fields';
import { contentModel } from './content-model';
export function contentValues(area: string, html: string) {
  const s = sections(html);
  const values = Object.fromEntries(
    contentModel(area).fields.map((f) => [
      f.label,
      f.type === 'long'
        ? (() => {
            const part = load(s[f.label.toLowerCase()] ?? '');
            part('br').replaceWith('\n');
            return (
              part('p,li')
                .toArray()
                .map((node) => part(node).text().trim())
                .filter(Boolean)
                .join('\n\n') || text(s[f.label.toLowerCase()] ?? '')
            );
          })()
        : text(s[f.label.toLowerCase()] ?? ''),
    ]),
  );
  if (area === 'footer')
    for (const label of [
      'Social / Professional Links',
      'Institutional Links',
    ]) {
      const anchors = load(s[label.toLowerCase()] ?? '')('a[href]').toArray();
      if (anchors.length) {
        const source = load(s[label.toLowerCase()] ?? '');
        values[label] = source('a[href]')
          .toArray()
          .map((node) => source(node).attr('href') || '')
          .filter(Boolean)
          .join('\n');
      }
    }
  if (area === 'profile' && !Object.hasOwn(s, 'biography')) {
    const $ = load(html);
    const marker = $('p')
      .filter((_, p) => /^Contact:$/i.test($(p).text().trim()))
      .first();
    if (marker.length) {
      marker.nextAll().remove();
      marker.remove();
    }
    values.Biography = $('p')
      .toArray()
      .map((p) => $(p).text().trim())
      .filter(Boolean)
      .join('\n\n');
    const original = load(html);
    for (const [label, domain] of Object.entries({
      LinkedIn: 'linkedin.com',
      ORCID: 'orcid.org',
      'Google Scholar': 'scholar.google.com',
    })) {
      if (Object.hasOwn(s, label.toLowerCase())) continue;
      original('a[href]').each((_, anchor) => {
        const url = safeUrl(original(anchor).attr('href'));
        if (url && new URL(url).hostname.replace(/^www\./, '') === domain)
          values[label] = url;
      });
    }
    const plain = original('body')
      .children()
      .toArray()
      .map((node) => original(node).text())
      .join(' ');
    values.Name = 'Anindita (Dia) Das';
    values.Title = 'Principal investigator';
    values.Email = plain.match(/[\w.+-]+@[\w.-]+\.[a-z]+/i)?.[0] || '';
    values.Office =
      plain
        .match(/Office:\s*([^<]+?)(?:https?:|Interested undergraduate|$)/i)?.[1]
        ?.trim() || '';
    const source = load(html);
    const paragraphs = source('p')
      .toArray()
      .map((p) => source(p).text().trim());
    const at = paragraphs.findIndex((p) => /^Mailing Address:/i.test(p));
    if (at >= 0) {
      const address: string[] = [];
      for (
        let i = at + 1;
        i < paragraphs.length &&
        !/^(Office:|https?:|Interested)/i.test(paragraphs[i]);
        i++
      )
        if (paragraphs[i]) address.push(paragraphs[i]);
      values['Mailing Address'] = address.join('\n');
    }
  }
  if (area === 'teaching' && !values.Courses) values.Courses = text(html);
  if (area === 'research' && !Object.keys(s).length)
    values.Overview = text(html);
  return values;
}
const escape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
export function updateContentFields(
  area: string,
  original: string,
  values: Record<string, string>,
  metadata: Record<string, string> = {},
) {
  const model = contentModel(area);
  const previous = contentValues(area, original);
  const $ = load(original, null, false);
  const replacements = { ...values, ...metadata };
  for (const [label, value] of Object.entries(replacements)) {
    if (!Object.hasOwn(metadata, label) && previous[label] === value) continue;
    const spec = model.fields.find((f) => f.label === label);
    if (!spec && !Object.hasOwn(metadata, label))
      throw new Error('Unknown content field.');
    if (value.length > 30000) throw new Error(`${label} is too long.`);
    if (value && spec?.type === 'email' && !fieldEmail(value))
      throw new Error(`Check the ${label} address.`);
    if (value && spec?.type === 'url' && !/^https?:\/\//i.test(value))
      throw new Error(`Enter a full web address for ${label}.`);
    if (value && spec?.type === 'url') {
      try {
        const u = new URL(value);
        if (!['http:', 'https:'].includes(u.protocol)) throw new Error();
      } catch {
        throw new Error(`Check the ${label} web address.`);
      }
    }
    if (
      value &&
      spec?.type === 'number' &&
      (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
    )
      throw new Error(`${label} must be a whole number.`);
    if (value && /year/i.test(label) && !fieldYear(value))
      throw new Error(`${label} must be a four-digit year.`);
    if (value && label === 'DOI' && !fieldDoi(value))
      throw new Error('Check the DOI identifier.');
    if (value && spec?.options && !spec.options.includes(value))
      throw new Error(`Choose a valid ${label.toLowerCase()}.`);
    if (
      value &&
      spec?.type === 'date' &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value)
    )
      throw new Error(`Check the ${label.toLowerCase()} date.`);
    let body = value
      .split(/\n\s*\n/)
      .map((p) => `<p>${escape(p).replaceAll('\n', '<br>')}</p>`)
      .join('');
    if (
      area === 'footer' &&
      /^(Social \/ Professional Links|Institutional Links)$/.test(label)
    )
      body = value
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          let url;
          try {
            url = new URL(line.trim());
            if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
          } catch {
            throw new Error(`Enter one full web address per line in ${label}.`);
          }
          const host = url.hostname.replace(/^www\./, '');
          const names: Record<string, string> = {
            'linkedin.com': 'LinkedIn',
            'orcid.org': 'ORCID',
            'scholar.google.com': 'Google Scholar',
            'smu.edu': 'Southern Methodist University',
          };
          return `<p><a href="${escape(url.href)}">${escape(names[host] || host)}</a></p>`;
        })
        .join('');
    const heading = $('h2').filter(
      (_, node) => $(node).text().trim().toLowerCase() === label.toLowerCase(),
    );
    if (heading.length > 1)
      throw new Error(
        `The ${label} field occurs twice. Ask the site manager to review this record.`,
      );
    if (heading.length) {
      const region = [];
      let node = heading.get(0)?.nextSibling;
      while (node && !(node.type === 'tag' && node.name === 'h2')) {
        region.push(node);
        node = node.nextSibling;
      }
      const closing = region.find(
        (node) => node.type === 'comment' && /^\s*\/wp:heading/.test(node.data),
      );
      const blockFormat = region.some(
        (node) => node.type === 'comment' && /wp:/.test(node.data),
      );
      for (const child of region)
        if (!(
          child.type === 'comment' && /^\s*\/?wp:heading\b/.test(child.data)
        ))
          $(child).remove();
      const replacement = blockFormat
        ? value
            .split(/\n\s*\n/)
            .map(
              (p) =>
                `<!-- wp:paragraph --><p>${escape(p).replaceAll('\n', '<br>')}</p><!-- /wp:paragraph -->`,
            )
            .join('\n')
        : body;
      const headingEnd = closing ? $.html(closing) : '';
      if (closing) $(closing).remove();
      heading.first().after(headingEnd + replacement);
    } else $.root().append(`<h2>${escape(label)}</h2>${body}`);
  }
  // Return the original bytes when nothing changed, including block comments.
  return Object.entries(replacements).every(
    ([label, value]) =>
      !Object.hasOwn(metadata, label) && previous[label] === value,
  )
    ? original
    : $.html();
}
export {
  profileKey,
  publicationKey,
  updateKey,
} from '../wordpress/content-keys';
export function plainPreview(html: string) {
  return cleanHtml(html);
}
