import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.palato.me';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api',
          '/admin',
          '/*/admin',
          '/me',
          '/*/me',
          '/settings',
          '/*/settings',
          '/saved',
          '/*/saved',
          '/notifications',
          '/*/notifications',
          '/compose',
          '/*/compose',
          '/verify-email',
          '/*/verify-email',
          '/reset-password',
          '/*/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
