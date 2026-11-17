import { load } from 'cheerio';
import snapshot from '../../content/wordpress-snapshot.json';
import type { CmsPage, Media, Photo } from './types';
import { mediaPhoto, publicHtml, sections } from '../wordpress/adapters';
import { fieldBoolean } from '../wordpress/fields';

// The old homepage now serves a migration notice, not the research document.
// Recover only that known notice, never an intentionally cleared admin overview.
export function researchPresentation(
  page: CmsPage | undefined,
  media: Media[],
) {
  const fields = sections(page?.html || '');
  const document = load(page?.html || '', null, false);
  const migrationNotice = document('a')
    .toArray()
    .some(
      (a) =>
        document(a).attr('href') === 'https://dasgroup.vercel.app/' &&
        /Visit the Das Research Group Website/i.test(document(a).text()),
    );
  const original = snapshot.pages.find((p) => p.slug === 'research');
  const recovered = migrationNotice && !Object.hasOwn(fields, 'overview');
  const html =
    fields.overview ?? (recovered ? original?.html : page?.html) ?? '';
  const overview = load(html, null, false);
  // Funding has its own editable section; avoid duplicating its legacy graphic.
  overview('p,h2,h3')
    .filter((_, node) =>
      /^Current Funding Support\s*$/i.test(overview(node).text().trim()),
    )
    .each((_, node) => {
      overview(node).nextAll().remove();
      overview(node).remove();
    });
  const originalPhoto: Photo = {
    url: '/research/original-research.webp',
    alt: 'Metal cluster and porous framework structures, biological images and luminescent solutions from the Das Research Group.',
    caption:
      'Atomically precise structures and materials: research imagery from the original Das Research Group website.',
    width: 1280,
    height: 720,
  };
  return {
    html: publicHtml(overview.html()),
    recovered,
    photo: fieldBoolean(fields['photo hidden'])
      ? undefined
      : (mediaPhoto(media.find((m) => m.id === page?.featuredMedia)) ??
        (migrationNotice ? originalPhoto : undefined)),
    // Used by the existing overview editor to preserve/remove the recovered image.
    defaultMediaId:
      migrationNotice && media.some((m) => m.id === 360) ? 360 : 0,
  };
}
