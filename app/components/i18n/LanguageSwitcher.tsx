'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useRouter, usePathname } from '@/app/lib/i18n/navigation';
import { routing } from '@/app/lib/i18n/routing';
import { cn } from '@/app/lib/utils/cn';

export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as (typeof routing.locales)[number];
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t('label')}</span>
      <select
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        aria-label={t('label')}
        className={cn(
          'h-9 cursor-pointer rounded-full border border-border-default bg-surface-card px-3 pr-7 font-sans text-xs font-medium text-text-secondary',
          'appearance-none transition-colors hover:bg-surface-subtle hover:text-text-primary',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          'disabled:opacity-60',
        )}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-2 h-3 w-3 text-text-muted"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  );
}
