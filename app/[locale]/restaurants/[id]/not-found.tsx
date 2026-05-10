import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('restaurant.notFound');
  return (
    <main id="main-content" className="cc-container px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-6xl" aria-hidden>🍽️</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-medium text-[var(--color-espresso)]">
        {t('title')}
      </h1>
      <p className="mt-2 text-[var(--color-espresso-soft)]">
        {t('description')}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-terracota)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-[var(--color-terracota-deep)]"
      >
        {t('backToFeed')}
      </Link>
    </main>
  );
}
