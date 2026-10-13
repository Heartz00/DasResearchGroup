import { load } from 'cheerio';

// These fields already have dedicated heading, email and directions controls.
// Keep the remaining approved WordPress details without showing them twice.
export function contactDetails(
  html: string,
  professionalLinks: string[] = [],
  office?: string,
) {
  const $ = load(html, null, false);
  const duplicate = new Set([
    'lab name',
    'pi name',
    'department',
    'university',
    'email',
    'department url',
    'map url',
  ]);
  $('h2,h3').each((_, heading) => {
    if (!duplicate.has($(heading).text().trim().toLowerCase())) return;
    let next = $(heading).next();
    while (next.length && !next.is('h2,h3')) {
      const following = next.next();
      next.remove();
      next = following;
    }
    $(heading).remove();
  });
  $('p')
    .filter((_, node) =>
      /^(?:Contact:|Email:\s*\S+@\S+)$/i.test($(node).text().trim()),
    )
    .remove();
  $('p')
    .filter((_, node) => {
      const p = $(node);
      const anchor = p.find('a');
      return (
        (!!office && p.text().trim() === `Office: ${office}`) ||
        (anchor.length === 1 &&
          p.text().trim() === anchor.text().trim() &&
          professionalLinks.includes(anchor.attr('href') || ''))
      );
    })
    .remove();
  return $.html();
}
