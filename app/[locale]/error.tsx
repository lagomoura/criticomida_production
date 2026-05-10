'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');
  const tCommon = useTranslations('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className={
        'cc-container flex min-h-[50vh] flex-col items-center ' +
        'justify-center gap-6 py-16 text-center'
      }
    >
      <h1 className="m-0 text-2xl font-bold text-neutral-900 md:text-3xl">
        {t('title')}
      </h1>
      <p className="m-0 max-w-md text-neutral-600">
        {t('message')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={
            'rounded-xl bg-action-primary px-5 py-2.5 text-sm font-semibold ' +
            'text-white shadow-md hover:opacity-90'
          }
        >
          {tCommon('retry')}
        </button>
        <Link
          href="/"
          className={
            'rounded-xl border border-action-primary/50 px-5 py-2.5 text-sm ' +
            'font-semibold text-action-primary no-underline hover:bg-action-primary/10'
          }
        >
          {tCommon('backToHome')}
        </Link>
      </div>
    </main>
  );
}
