import { load } from 'cheerio';
import { safeUrl } from '../wordpress/values';

export function profileLinks(html: string) {
  const $ = load(html);
  const labels: Record<string, string> = {
    'linkedin.com': 'LinkedIn',
    'orcid.org': 'ORCID',
    'scholar.google.com': 'Google Scholar',
    'twitter.com': 'X',
    'x.com': 'X',
  };
  const links = $('a[href]')
    .toArray()
    .flatMap((anchor) => {
      const href = safeUrl($(anchor).attr('href'));
      const label =
        href && labels[new URL(href).hostname.replace(/^www\./, '')];
      return href && label ? [{ href, label }] : [];
    });
  return links.filter(
    (link, index) =>
      links.findIndex((other) => other.href === link.href) === index,
  );
}
