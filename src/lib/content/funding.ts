import type { CmsPage, Media } from './types';
import { mediaPhoto, photos, sections, text } from '../wordpress/adapters';
import { fieldBoolean, fieldLink, fieldOrder } from '../wordpress/fields';

export const legacyFunders = [
  { key: 'nsf', name: 'National Science Foundation', award: '2316991' },
  { key: 'acs-prf', name: 'ACS Petroleum Research Fund', award: '' },
  {
    key: 'rcsa',
    name: 'Research Corporation for Science Advancement',
    award: '',
  },
  { key: 'sloan', name: 'Alfred P. Sloan Foundation', award: '' },
  { key: 'doe', name: 'U.S. Department of Energy', award: 'DE-SC0025724' },
  { key: 'welch', name: 'The Welch Foundation', award: '' },
];

export function fundingSupport(
  research: CmsPage | undefined,
  pages: CmsPage[],
  media: Media[],
) {
  const records = pages.filter(
    (p) =>
      p.parent === research?.id &&
      fieldBoolean(sections(p.html)['managed funder']),
  );
  const graphic = photos(research?.html || '', media).find((p) =>
    /\/website-grants(?:-\d+x\d+)?\.jpg(?:\?|$)/i.test(p.url),
  );
  const seeds = graphic
    ? legacyFunders.map((p, i) => ({
        id: `legacy-${i}`,
        name: p.name,
        award: p.award,
        program: '',
        description: '',
        link: undefined as string | undefined,
        photo: undefined as ReturnType<typeof mediaPhoto>,
        active: true,
        order: i,
        sourceKey: p.key,
      }))
    : [];
  const entries = records.map((p) => {
    const s = sections(p.html);
    return {
      id: String(p.id),
      name: text(p.title),
      award: text(s['award number'] || ''),
      program: text(s.program || ''),
      description: text(s.description || ''),
      link: fieldLink(s['funder website']),
      photo: fieldBoolean(s['photo hidden'])
        ? undefined
        : mediaPhoto(media.find((m) => m.id === p.featuredMedia)),
      active: text(s['display on website'] || 'Yes') !== 'No',
      order: fieldOrder(s['display order']),
      sourceKey: text(s['funding key'] || ''),
    };
  });
  const funders = [
    ...seeds.filter((p) => !entries.some((e) => e.sourceKey === p.sourceKey)),
    ...entries,
  ].sort((a, b) => a.order - b.order);
  return {
    funders,
    graphic: entries.some((p) => p.sourceKey) ? undefined : graphic,
  };
}
