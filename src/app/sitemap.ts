import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.SITE_URL || 'http://localhost:3000';
  return [
    '',
    '/research',
    '/people',
    '/people/anindita-das',
    '/publications',
    '/news',
    '/facilities',
    '/gallery',
    '/join',
    '/contact',
    '/teaching',
  ].map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
