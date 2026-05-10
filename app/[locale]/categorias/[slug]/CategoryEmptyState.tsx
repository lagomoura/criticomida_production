import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';

interface CategoryEmptyStateProps {
  categoryLabel: string;
}

export default function CategoryEmptyState({
  categoryLabel,
}: CategoryEmptyStateProps) {
  const t = useTranslations('categoryPage');
  return (
    <div
      className={
        'mx-auto max-w-2xl rounded-2xl border border-amber-200/80 ' +
        'bg-gradient-to-b from-amber-50/90 to-white px-6 py-10 ' +
        'text-center shadow-sm md:px-10 md:py-14'
      }
    >
      <p className="mb-4 text-5xl" aria-hidden>
        🍽️
      </p>
      <h1 className="mb-3 text-2xl font-bold text-neutral-900 md:text-3xl">
        {t('emptyTitle')}{' '}
        <span className="text-action-primary">{categoryLabel}</span>
      </h1>
      <p className="mb-8 text-base leading-relaxed text-neutral-600">
        {t('emptyDescription')}
      </p>
      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/#reviews"
          className={
            'btn btn-primary inline-flex items-center justify-center ' +
            'no-underline'
          }
        >
          {t('viewOtherCategories')}
        </Link>
        <Link
          href="/"
          className={
            'btn btn-ghost inline-flex items-center justify-center ' +
            'no-underline'
          }
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
