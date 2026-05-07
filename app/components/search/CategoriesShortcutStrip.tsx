'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import { getCategories } from '@/app/lib/api/categories';
import {
  REVIEW_CATEGORIES,
  getReviewCategoryLabelKey,
} from '@/app/data/review-categories';
import { Category } from '@/app/lib/types';
import { cn } from '@/app/lib/utils/cn';

const CANONICAL_ORDER = REVIEW_CATEGORIES.reduce<Record<string, number>>(
  (acc, c, idx) => {
    acc[c.slug] = idx;
    return acc;
  },
  {},
);

// El strip es atajos rápidos para los usuarios que no saben qué buscar — no
// el catálogo completo. Mostrar 52 chips horizontales convierte el strip en
// un muro scrollable. 10 cubre los casos comunes; el resto se descubre en
// /categorias vía el botón "Ver todas →".
const MAX_SHORTCUTS = 10;

type Status =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; categories: Category[] };

export default function CategoriesShortcutStrip() {
  const t = useTranslations('searchCategoriesStrip');
  const tCategories = useTranslations('categories');
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        // Priorizá categorías con más reseñas (señal real de que el catálogo
        // tiene contenido detrás de ese chip). Cuando todas están en 0
        // (catálogo virgen) cae al orden canónico para no quedar vacío.
        const sorted = [...cats].sort((a, b) => {
          const ra = a.review_count ?? 0;
          const rb = b.review_count ?? 0;
          if (ra !== rb) return rb - ra;
          const orderA = a.display_order ?? CANONICAL_ORDER[a.slug] ?? 99;
          const orderB = b.display_order ?? CANONICAL_ORDER[b.slug] ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });
        const trimmed = sorted.slice(0, MAX_SHORTCUTS);
        setStatus({ kind: 'ready', categories: trimmed });
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.kind === 'loading') {
    return (
      <section aria-label={t('heading')} className="flex flex-col gap-2">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          {t('heading')}
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className="h-9 w-24 shrink-0 rounded-full bg-surface-subtle"
            />
          ))}
        </div>
      </section>
    );
  }

  if (status.kind === 'error' || status.categories.length === 0) {
    return null;
  }

  return (
    <section aria-label={t('heading')} className="flex flex-col gap-2">
      <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        {t('heading')}
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {status.categories.map((category) => {
          const labelKey = getReviewCategoryLabelKey(category.slug);
          const label = labelKey
            ? tCategories(labelKey.split('.')[1])
            : category.name;
          return (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className={cn(
                'inline-flex h-9 shrink-0 items-center rounded-full border px-4 font-sans text-sm no-underline transition-colors',
                'border-border-default bg-surface-card text-text-primary',
                'hover:border-action-primary hover:text-action-primary',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              )}
            >
              {label}
            </Link>
          );
        })}
        <Link
          href="/categorias"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-4 font-sans text-sm font-medium no-underline transition-colors',
            'bg-action-primary text-text-inverse',
            'hover:bg-action-primary-hover',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          )}
        >
          {t('viewAll')} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
