import { load } from 'cheerio';
import type { Publication } from './types';
import { text } from '../wordpress/values';

export function publicationJournal(paper: Publication) {
  const $ = load(paper.html);
  const label = $('p')
    .filter((_, p) => /^Journal$/i.test($(p).text().trim()))
    .first();
  const candidates = $('em,i')
    .toArray()
    .map((node) => {
      let value = $(node).text().trim();
      let next = node.nextSibling;
      while (next) {
        if (next.type === 'text' && !next.data.trim()) {
          next = next.nextSibling;
          continue;
        }
        if (next.type !== 'tag' || !['em', 'i'].includes(next.name)) break;
        value += ' ' + $(next).text().trim();
        next = next.nextSibling;
      }
      return value;
    });
  const journal = label.length
    ? text($.html(label.next()))
    : candidates.find((value) => /[a-z]{2}/i.test(value)) || '';
  return /^(?:under review|submitted|accepted|published|editorial)(?:\W|$)/i.test(
    journal,
  )
    ? ''
    : journal.replace(/[ ,;]*\b\d+(?:\(\d+\))?[,.; ]*$/, '').trim();
}

// Explicit user curation. Citations, images, links and attribution remain in WordPress.
export function homepagePublications(papers: Publication[]) {
  const fold = (value: string) =>
    value
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  const requested = [
    {
      year: 2019,
      journal: 'science',
      title: 'particle analogs of electrons in colloidal crystals',
    },
    {
      year: 2018,
      journal: 'j am chem soc',
      title:
        'molecular scale ligand effects in small gold thiolate nanoclusters',
    },
    {
      year: 2013,
      journal: 'j am chem soc',
      title: 'non superatomic au23 sr 16',
    },
    {
      year: 2012,
      journal: 'j am chem soc',
      title:
        'total structure and optical properties of a phosphine thiolate protected au24 nanocluster',
    },
  ];
  return requested.flatMap((choice) => {
    const paper = papers.find(
      (p) =>
        p.year === choice.year &&
        fold(publicationJournal(p)) === choice.journal &&
        fold(p.title + ' ' + text(p.html)).includes(choice.title) &&
        /^(Published|Accepted)$/i.test(p.status),
    );
    return paper ? [paper] : [];
  });
}
