import type { MetadataRoute } from 'next';
import { routing } from '@/app/lib/i18n/routing';

const SITE_URL = 'https://www.palato.me';

const STATIC_PATHS = [
  '',
  '/about',
  '/categorias',
  '/login',
  '/registro',
  '/forgot-password',
  '/search',
  '/trending',
  '/mapa',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return STATIC_PATHS.flatMap((path) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`]),
    );

    return routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1.0 : 0.7,
      alternates: {
        languages: {
          ...languages,
          'x-default': `${SITE_URL}/${routing.defaultLocale}${path}`,
        },
      },
    })) as MetadataRoute.Sitemap;
  });
}
