import { load } from 'cheerio';
import type { TextBlock } from './text-block-values';
export function textBlocks(html: string): TextBlock[] {
  return [...html.matchAll(/<p\b[^>]*>([^<]*)<\/p>/gi)]
    .filter((match) => load(match[0]).text().trim())
    .map((match) => {
      const start = match.index! + match[0].match(/^<p\b[^>]*>/i)![0].length;
      return {
        start,
        end: start + match[1].length,
        value: load(match[0]).text(),
      };
    });
}
