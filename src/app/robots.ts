import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  const origin = process.env.SITE_URL || 'http://localhost:3000';
  const preview =
    process.env.VERCEL_ENV === 'preview' ||
    process.env.WORDPRESS_ENABLED === 'false' ||
    origin.includes('localhost');
  return {
    rules: {
      userAgent: '*',
      ...(preview ? { disallow: '/' } : { allow: '/', disallow: '/admin/' }),
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
