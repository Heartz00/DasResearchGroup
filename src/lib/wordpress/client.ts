import 'server-only';
import { cache } from 'react';
import snapshot from '@/content/wordpress-snapshot.json';
import type { Media, SiteContent } from '../content/types';
import { loadLiveContent } from './transport';

export const wordpressUrl = (
  process.env.WORDPRESS_URL || 'https://people.smu.edu/daslab'
).replace(/\/$/, '');
export const getContent = cache(async (): Promise<SiteContent> => {
  if (process.env.WORDPRESS_ENABLED === 'false')
    return {
      pages: snapshot.pages,
      media: snapshot.media as Media[],
      posts: [],
      categories: [],
      tags: [],
      mode: 'offline',
      capturedAt: snapshot.capturedAt,
    };
  return loadLiveContent(wordpressUrl);
});
