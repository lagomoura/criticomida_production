import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/app/lib/i18n/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.restaurantsIndex' });
  return {
    title: t('title'),
  };
}

export default async function RestaurantsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'restaurantsIndex' });

  return (
    <main id="main-content" className="cc-container py-12 md:py-16">
      <h1 className="mb-3 text-2xl font-bold text-neutral-900 md:text-3xl">
        {t('title')}
      </h1>
      <p className="mb-6 max-w-xl text-neutral-600">
        {t('description')}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/#reviews"
          className={
            'rounded-xl bg-main-pink px-5 py-2.5 text-sm font-semibold ' +
            'text-white no-underline shadow-md hover:opacity-90'
          }
        >
          {t('viewCategories')}
        </Link>
        <Link
          href="/"
          className={
            'rounded-xl border border-main-pink/50 px-5 py-2.5 text-sm ' +
            'font-semibold text-main-pink no-underline hover:bg-main-pink/10'
          }
        >
          {t('goHome')}
        </Link>
      </div>
    </main>
  );
}
