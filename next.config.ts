import type { NextConfig } from 'next';
const config: NextConfig = {
  distDir: process.env.ADMIN_TEST_DIST_DIR || '.next',
  devIndicators: false,
  experimental: { serverActions: { bodySizeLimit: '4mb' } },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'people.smu.edu',
        pathname: '/daslab/files/**',
      },
      { protocol: 'https', hostname: 'pbs.twimg.com', pathname: '/media/**' },
      {
        protocol: 'https',
        hostname: 'i1.rgstatic.net',
        pathname: '/ii/profile.image/**',
      },
      { protocol: 'https', hostname: 'pubs.acs.org', pathname: '/cms/**' },
      {
        protocol: 'https',
        hostname: 'chemistry-europe.onlinelibrary.wiley.com',
        pathname: '/cms/**',
      },
      {
        protocol: 'https',
        hostname: 'onlinelibrary.wiley.com',
        pathname: '/cms/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};
export default config;
