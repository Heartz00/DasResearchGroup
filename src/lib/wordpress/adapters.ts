import { load } from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { fieldEmail, fieldOrder, fieldBoolean, fieldLink } from './fields';
import type {
  CmsPage,
  Media,
  News,
  Person,
  Photo,
  Publication,
} from '../content/types';

import { text, safeUrl } from './values';
export { text, safeUrl } from './values';

export function publicHtml(html: string) {
  const $ = load(html, null, false);
  const controls = new Set([
    'managed profile',
    'managed publication',
    'managed update',
    'legacy source',
    'photo hidden',
    'display order',
    'featured on homepage',
    'people source',
    'publication source',
  ]);
  $('h2,h3,h4').each((_, heading) => {
    if (!controls.has($(heading).text().trim().toLowerCase())) return;
    let node = $(heading).next();
    while (node.length && !node.is('h2,h3,h4')) {
      const next = node.next();
      node.remove();
      node = next;
    }
    $(heading).remove();
  });
  return cleanHtml($.html());
}

// Keep labels and rich scientific text; omit control fields from cards.
export function labeledContent(html: string, labels: string[]) {
  const s = sections(html);
  const populated = labels.filter((label) =>
    text(s[label.toLowerCase()] ?? ''),
  );
  return labels.some((label) => Object.hasOwn(s, label.toLowerCase()))
    ? populated
        .map(
          (label) =>
            `<p><strong>${label}</strong></p>${cleanHtml(s[label.toLowerCase()])}`,
        )
        .join('')
    : publicHtml(html);
}

export function allowedImage(value?: string): string | undefined {
  const url = safeUrl(value);
  if (!url) return;
  const u = new URL(url);
  const paths: Record<string, string> = {
    'people.smu.edu': '/daslab/files/',
    'pbs.twimg.com': '/media/',
    'i1.rgstatic.net': '/ii/profile.image/',
    'pubs.acs.org': '/cms/',
    'chemistry-europe.onlinelibrary.wiley.com': '/cms/',
    'onlinelibrary.wiley.com': '/cms/',
  };
  if (
    u.protocol === 'https:' &&
    paths[u.hostname] &&
    u.pathname.startsWith(paths[u.hostname])
  )
    return url;
}

export function cleanHtml(html: string): string {
  // Images are rendered separately through next/image; source styles and forms never execute.
  const $ = load(html);
  $('script, style, form, iframe, object, embed').remove();
  $('span').each((_, e) => {
    if (/underline/.test($(e).attr('style') ?? ''))
      $(e).replaceWith(`<u>${$(e).html()}</u>`);
  });
  return sanitizeHtml($.html(), {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'i',
      'b',
      'u',
      'sup',
      'sub',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'h2',
      'h3',
      'h4',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    allowedAttributes: { a: ['href', 'rel'], th: ['scope'] },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_, attrs) => ({
        tagName: 'a',
        attribs: { ...attrs, rel: 'noopener noreferrer' },
      }),
    },
  });
}

export function sections(html: string): Record<string, string> {
  const $ = load(html);
  const result: Record<string, string> = {};
  let key = '';
  $('body')
    .children()
    .each((_, e) => {
      if (/^h[234]$/.test(e.tagName)) {
        key = text($(e).html() ?? '').toLowerCase();
        result[key] = '';
      } else if (key) result[key] += $.html(e);
    });
  return result;
}

export function photos(html: string, media: Media[]): Photo[] {
  const $ = load(html);
  const result: Photo[] = [];
  $('img').each((_, e) => {
    const img = $(e);
    const id = Number(img.attr('class')?.match(/wp-image-(\d+)/)?.[1]);
    const asset = media.find((m) => m.id === id);
    const url = allowedImage(
      asset?.sizes?.large?.source_url ?? asset?.url ?? img.attr('src'),
    );
    if (!url || result.some((p) => p.url === url)) return;
    const caption = text(
      img.closest('figure').find('figcaption').html() ?? asset?.caption ?? '',
    );
    const originalAlt = asset?.alt || img.attr('alt') || '';
    const alt = /^(Description unavailable|Figure \d+|image)$/i.test(
      originalAlt,
    )
      ? ''
      : originalAlt;
    result.push({
      url,
      alt: alt || caption,
      caption,
      width:
        asset?.sizes?.large?.width ??
        asset?.width ??
        (Number(img.attr('width')) || 1000),
      height:
        asset?.sizes?.large?.height ??
        asset?.height ??
        (Number(img.attr('height')) || 700),
    });
  });
  return result;
}

export function mediaPhoto(asset?: Media): Photo | undefined {
  const url = allowedImage(asset?.sizes?.large?.source_url ?? asset?.url);
  if (!asset || !url) return;
  return {
    url,
    alt: asset.alt || text(asset.caption),
    caption: text(asset.caption),
    width: asset.width || 1280,
    height: asset.height || 720,
  };
}

export function people(
  page: CmsPage | undefined,
  media: Media[],
  children: CmsPage[] = [],
): Person[] {
  if (children.length)
    return children
      .map((p) => {
        const s = sections(p.html);
        const role = text(s.role ?? '') || 'Researcher';
        return {
          id: String(p.id),
          name: text(p.title),
          role,
          alumni: /alumni|former/i.test(text(s.status ?? '')),
          photo: fieldBoolean(s['photo hidden'])
            ? undefined
            : (mediaPhoto(media.find((m) => m.id === p.featuredMedia)) ??
              photos(p.html, media)[0]),
          html: labeledContent(p.html, [
            'Biography',
            'Education',
            'Office / Lab',
            'Start Year',
            'End Year',
            'Next Position',
          ]),
          interests: text(s['research interests'] ?? '') || undefined,
          email: fieldEmail(text(s.email ?? '')),
          order: fieldOrder(s['display order']),
          featured: fieldBoolean(s['featured on homepage']),
          links: ['Google Scholar', 'ORCID', 'LinkedIn', 'Personal Website']
            .map((label) => ({
              label,
              href: fieldLink(s[label.toLowerCase()]),
            }))
            .filter(
              (link): link is { label: string; href: string } => !!link.href,
            ),
        };
      })
      .sort((a, b) => a.order - b.order || Number(a.id) - Number(b.id));
  if (!page) return [];
  const $ = load(page.html);
  let role = 'Researchers';
  const result: Person[] = [];
  $('body')
    .children()
    .each((i, e) => {
      const el = $(e);
      const label = text(el.html() ?? '');
      const hasImage = el.is('img') || el.find('img').length > 0;
      if (
        !hasImage &&
        /^(Graduate Students|Postdoctoral Fellows|Undergraduate Students|REU Students|Former Members)$/i.test(
          label,
        )
      ) {
        role = label;
        return;
      }
      if (!label && !hasImage) return;
      const photo = photos($.html(e), media)[0];
      const caption = el.find('figcaption').text().trim();
      const name = caption || label || photo?.alt || '';
      // Some legacy images include names/biographies within the pixels. Preserve the whole image.
      result.push({
        id: `legacy-${i}`,
        name,
        role,
        alumni: /former|alumni/i.test(role),
        photo,
        html: '',
      });
    });
  return result;
}

export function publications(
  page: CmsPage | undefined,
  media: Media[],
): Publication[] {
  if (!page) return [];
  // The live page joins records 25 and 24 after an inline image in one paragraph.
  // Split only image-followed citation starts, leaving volume/issue numbers untouched.
  const $ = load(
    page.html.replace(/(<img\b[^>]*>)\s*(\d+\)\s*[A-Z])/gi, '$1</p><p>$2'),
  );
  const result: Publication[] = [];
  let prior = false;
  $('body')
    .children()
    .each((_, e) => {
      const el = $(e);
      const content = text(el.html() ?? '');
      if (/^Prior to SMU$/i.test(content)) {
        prior = true;
        return;
      }
      const number = content.match(/^(\d+)\)/)?.[1];
      if (!number) {
        const extra = photos($.html(e), media)[0];
        if (extra && result.length) result[result.length - 1].photo ??= extra;
        return;
      }
      const link = el
        .find('a')
        .toArray()
        .map((a) => safeUrl($(a).attr('href')))
        .find(Boolean);
      const citation = content
        .replace(/^\d+\)\s*/, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();
      const quoted = citation.match(/[“"]([^”"]+)[”"]/);
      const lastAuthor = citation
        .split(';')
        .at(-1)
        ?.replace(
          /^\s*\*?\s*[\p{L}’' -]+,\s*(?:[A-Z]\.\s*)+(?:[†*.,]\s*)*/u,
          '',
        );
      const year =
        Number(
          el
            .find('strong')
            .text()
            .match(/\b(?:19|20)\d{2}\b/)?.[0] ??
            citation.match(/\b(?:19|20)\d{2}\b/)?.[0],
        ) || undefined;
      let candidate =
        lastAuthor?.split(/,?\s*(?:19|20)\d{2}\b/)[0]?.trim() ?? '';
      const journal = text(el.find('em,i').first().html() ?? '');
      const journalAt = journal ? candidate.lastIndexOf(journal) : -1;
      if (
        journalAt >= 0 &&
        /^[\s.,]*$/.test(candidate.slice(journalAt + journal.length))
      )
        candidate = candidate.slice(0, journalAt);
      const title =
        quoted?.[1] ??
        (candidate.replace(/[\s.,]+$/, '') || `Publication ${number}`);
      const status = /under review/i.test(citation)
        ? 'Under review'
        : /submitted/i.test(citation)
          ? 'Submitted'
          : /accepted/i.test(citation)
            ? 'Accepted'
            : /editorial/i.test(citation)
              ? 'Editorial'
              : 'Published';
      result.push({
        id: `legacy-${number}`,
        title,
        year,
        html: cleanHtml($.html(e)),
        link,
        doi: link?.match(
          /(?:doi\.org\/|\/doi\/(?:full\/|abs\/)?)(10\.\S+)/,
        )?.[1],
        photo: photos($.html(e), media)[0],
        prior,
        status,
        featured: false,
      });
    });
  return result;
}

export function legacyNews(page?: CmsPage): News[] {
  if (!page) return [];
  const $ = load(page.html);
  return $('p')
    .toArray()
    .flatMap((e, i) => {
      const title = text($(e).clone().find('a').remove().end().html() ?? '');
      if (!title) return [];
      return [
        {
          id: `archive-${i}`,
          title,
          html: cleanHtml($.html(e)),
          link: $(e)
            .find('a')
            .toArray()
            .map((a) => safeUrl($(a).attr('href')))
            .find(Boolean),
        },
      ];
    });
}
