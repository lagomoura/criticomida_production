'use client';

import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import { Category } from '@/app/lib/types';
import { cn } from '@/app/lib/utils/cn';

const FILTER_THRESHOLD = 8;

interface CategoryEntry {
  category: Category;
  /** Already-resolved label (i18n or fallback to name). */
  label: string;
}

interface Props {
  entries: CategoryEntry[];
}

export default function CategoriasIndexClient({ entries }: Props) {
  const t = useTranslations('categoriesIndex');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.label.toLowerCase().includes(q));
  }, [entries, query]);

  const showFilter = entries.length >= FILTER_THRESHOLD;

  return (
    <>
      {showFilter && (
        <div className="mb-6">
          <label className="relative block">
            <span className="sr-only">{t('filterAria')}</span>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('filterPlaceholder')}
              className={cn(
                'h-11 w-full max-w-md rounded-full border bg-surface-card pl-11 pr-10 font-sans text-sm text-text-primary',
                'placeholder:text-text-muted',
                'focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-action-primary',
                'border-border-default',
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('filterAria')}
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
              </button>
            )}
          </label>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border-default bg-surface-card p-10 text-center">
          <p className="font-sans text-sm text-text-muted">{t('filterEmpty')}</p>
        </div>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ category, label }) => {
            const reviewCount = category.review_count ?? 0;
            const countLabel =
              reviewCount === 0
                ? t('reviewsCountZero')
                : reviewCount === 1
                  ? t('reviewsCountOne', { count: reviewCount })
                  : t('reviewsCountMany', { count: reviewCount });

            return (
              <li key={category.id}>
                <Link
                  href={`/categorias/${category.slug}`}
                  aria-label={`${t('viewLabel')} ${label}`}
                  className="group block overflow-hidden rounded-2xl border border-border-default bg-surface-card no-underline transition-shadow hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                    {category.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-canela)] via-[var(--color-azafran)] to-[var(--color-azafran-light)]"
                      >
                        <span className="font-display text-7xl font-medium text-white/95 drop-shadow-sm">
                          {label.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
                    />
                    <h2 className="absolute bottom-3 left-4 right-4 m-0 font-display text-2xl font-medium text-white drop-shadow sm:text-3xl">
                      {label}
                    </h2>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="font-sans text-xs uppercase tracking-[0.18em] text-text-muted">
                      {countLabel}
                    </span>
                    <span
                      aria-hidden
                      className="font-sans text-sm font-medium text-action-primary transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
