import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getCategories } from '@/app/lib/api/categories';
import {
  REVIEW_CATEGORIES,
  getReviewCategoryLabelKey,
} from '@/app/data/review-categories';
import { Category } from '@/app/lib/types';
import CategoriasIndexClient from './CategoriasIndexClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.categoriesIndex' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

const CANONICAL_ORDER = REVIEW_CATEGORIES.reduce<Record<string, number>>(
  (acc, c, idx) => {
    acc[c.slug] = idx;
    return acc;
  },
  {},
);

export default async function CategoriasIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tIndex = await getTranslations({ locale, namespace: 'categoriesIndex' });
  const tCategories = await getTranslations({ locale, namespace: 'categories' });

  let categories: Category[] = [];
  let loadFailed = false;
  try {
    categories = await getCategories();
  } catch {
    loadFailed = true;
  }

  const sorted = [...categories].sort((a, b) => {
    const orderA = a.display_order ?? CANONICAL_ORDER[a.slug] ?? 99;
    const orderB = b.display_order ?? CANONICAL_ORDER[b.slug] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  const entries = sorted.map((category) => {
    const labelKey = getReviewCategoryLabelKey(category.slug);
    const label = labelKey
      ? tCategories(labelKey.split('.')[1])
      : category.name;
    return { category, label };
  });

  return (
    <main id="main-content" className="cc-container py-10">
      <header className="mb-10">
        <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-action-primary">
          {tIndex('kicker')}
        </p>
        <h1 className="mt-2 m-0 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.02] text-text-primary">
          {tIndex('title')}
        </h1>
        <p className="mt-3 max-w-2xl font-display italic text-base leading-relaxed text-text-secondary md:text-lg">
          {tIndex('subtitle')}
        </p>
      </header>

      {loadFailed && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <p className="font-sans text-sm text-text-secondary">{tIndex('loadError')}</p>
        </div>
      )}

      {!loadFailed && entries.length === 0 && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-10 text-center">
          <p className="font-sans text-sm text-text-muted">{tIndex('empty')}</p>
        </div>
      )}

      {!loadFailed && entries.length > 0 && (
        <CategoriasIndexClient entries={entries} />
      )}
    </main>
  );
}
