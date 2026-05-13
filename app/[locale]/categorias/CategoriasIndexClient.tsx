'use client';

import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import { Category } from '@/app/lib/types';
import { cn } from '@/app/lib/utils/cn';

const FILTER_THRESHOLD = 8;
const POPULAR_LIMIT = 6;
const POPULAR_MIN_REVIEWS = 1;

/**
 * Prefer the locally-bundled hero in `public/img/categories/{slug}.jpg` when
 * the backend points at the ephemeral fal.media CDN (URLs expire). Persistent
 * local URLs (`/img/...`) and remote hosts other than fal.media are respected.
 */
function resolveCategoryImage(category: Category): string {
  const url = category.image_url ?? '';
  if (!url || url.includes('fal.media')) {
    return `/img/categories/${category.slug}.jpg`;
  }
  return url;
}

interface CategoryEntry {
  category: Category;
  /** Already-resolved label (i18n or fallback to name). */
  label: string;
}

interface SectionDef {
  id: string;
  titleKey:
    | 'sectionSudamerica'
    | 'sectionCentroamerica'
    | 'sectionNorteamerica'
    | 'sectionEuropa'
    | 'sectionMedioOriente'
    | 'sectionAsia'
    | 'sectionCarnes'
    | 'sectionMariscos'
    | 'sectionEstilos'
    | 'sectionBebidaDulce'
    | 'sectionOtros';
  matches: (order: number) => boolean;
}

// Buckets se infieren de display_order. Los rangos están alineados con los que
// usa la migración 047 al sembrar las categorías. Cualquier entrada que no
// caiga en ningún rango cae en "Otros".
const SECTIONS: SectionDef[] = [
  { id: 'sudamerica', titleKey: 'sectionSudamerica', matches: (o) => o >= 100 && o < 120 },
  { id: 'centroamerica', titleKey: 'sectionCentroamerica', matches: (o) => o >= 120 && o < 140 },
  { id: 'norteamerica', titleKey: 'sectionNorteamerica', matches: (o) => o >= 140 && o < 150 },
  { id: 'europa', titleKey: 'sectionEuropa', matches: (o) => o >= 150 && o < 180 },
  { id: 'medio-oriente', titleKey: 'sectionMedioOriente', matches: (o) => o >= 180 && o < 200 },
  { id: 'asia', titleKey: 'sectionAsia', matches: (o) => o >= 200 && o < 230 },
  { id: 'carnes', titleKey: 'sectionCarnes', matches: (o) => o >= 230 && o < 240 },
  { id: 'mariscos', titleKey: 'sectionMariscos', matches: (o) => o >= 240 && o < 300 },
  { id: 'estilos', titleKey: 'sectionEstilos', matches: (o) => o >= 300 && o < 330 },
  { id: 'bebida-dulce', titleKey: 'sectionBebidaDulce', matches: (o) => o >= 330 && o < 900 },
];

// Catch-all para "otros" (display_order 999) y cualquier entry suelta.
const OTROS_SECTION: SectionDef = {
  id: 'otros',
  titleKey: 'sectionOtros',
  matches: () => true,
};

interface Props {
  entries: CategoryEntry[];
}

export default function CategoriasIndexClient({ entries }: Props) {
  const t = useTranslations('categoriesIndex');
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const isFiltering = trimmed.length > 0;

  const filtered = useMemo(() => {
    if (!isFiltering) return entries;
    return entries.filter((e) => e.label.toLowerCase().includes(trimmed));
  }, [entries, trimmed, isFiltering]);

  const popular = useMemo(() => {
    if (isFiltering) return [];
    return [...entries]
      .filter((e) => (e.category.review_count ?? 0) >= POPULAR_MIN_REVIEWS)
      .sort((a, b) => {
        const ra = a.category.review_count ?? 0;
        const rb = b.category.review_count ?? 0;
        if (ra !== rb) return rb - ra;
        return (a.category.display_order ?? 0) - (b.category.display_order ?? 0);
      })
      .slice(0, POPULAR_LIMIT);
  }, [entries, isFiltering]);

  const grouped = useMemo(() => {
    if (isFiltering) return [];
    const buckets = new Map<string, CategoryEntry[]>();
    for (const entry of entries) {
      const order = entry.category.display_order ?? 9999;
      const section = SECTIONS.find((s) => s.matches(order)) ?? OTROS_SECTION;
      const bucket = buckets.get(section.id) ?? [];
      bucket.push(entry);
      buckets.set(section.id, bucket);
    }
    const result: Array<{ section: SectionDef; items: CategoryEntry[] }> = [];
    for (const section of [...SECTIONS, OTROS_SECTION]) {
      const items = buckets.get(section.id);
      if (items && items.length > 0) {
        result.push({ section, items });
      }
    }
    return result;
  }, [entries, isFiltering]);

  const showFilter = entries.length >= FILTER_THRESHOLD;

  return (
    <>
      {showFilter && (
        <div className="mb-8">
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

      {isFiltering && filtered.length === 0 && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-10 text-center">
          <p className="font-sans text-sm text-text-muted">{t('filterEmpty')}</p>
        </div>
      )}

      {isFiltering && filtered.length > 0 && (
        <CategoryGrid entries={filtered} viewLabel={t('viewLabel')}
          formatCount={(n) =>
            n === 0
              ? t('reviewsCountZero')
              : n === 1
                ? t('reviewsCountOne', { count: n })
                : t('reviewsCountMany', { count: n })
          }
        />
      )}

      {!isFiltering && (
        <div className="flex flex-col gap-12">
          {popular.length > 0 && (
            <SectionBlock
              heading={t('popularHeading')}
              entries={popular}
              viewLabel={t('viewLabel')}
              formatCount={(n) =>
                n === 0
                  ? t('reviewsCountZero')
                  : n === 1
                    ? t('reviewsCountOne', { count: n })
                    : t('reviewsCountMany', { count: n })
              }
            />
          )}

          {grouped.map(({ section, items }) => (
            <SectionBlock
              key={section.id}
              heading={t(section.titleKey)}
              entries={items}
              viewLabel={t('viewLabel')}
              formatCount={(n) =>
                n === 0
                  ? t('reviewsCountZero')
                  : n === 1
                    ? t('reviewsCountOne', { count: n })
                    : t('reviewsCountMany', { count: n })
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

interface SectionBlockProps {
  heading: string;
  entries: CategoryEntry[];
  viewLabel: string;
  formatCount: (n: number) => string;
}

function SectionBlock({ heading, entries, viewLabel, formatCount }: SectionBlockProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline gap-3 border-b border-border-default pb-2">
        <h2 className="m-0 font-display text-xl font-medium text-text-primary sm:text-2xl">
          {heading}
        </h2>
        <span className="font-sans text-xs uppercase tracking-[0.18em] text-text-muted">
          {entries.length}
        </span>
      </div>
      <CategoryGrid entries={entries} viewLabel={viewLabel} formatCount={formatCount} />
    </section>
  );
}

interface CategoryGridProps {
  entries: CategoryEntry[];
  viewLabel: string;
  formatCount: (n: number) => string;
}

function CategoryGrid({ entries, viewLabel, formatCount }: CategoryGridProps) {
  return (
    <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ category, label }) => {
        const reviewCount = category.review_count ?? 0;
        return (
          <li key={category.id}>
            <Link
              href={`/categorias/${category.slug}`}
              aria-label={`${viewLabel} ${label}`}
              className="group block overflow-hidden rounded-2xl border border-border-default bg-surface-card no-underline transition-shadow hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                <div
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-terracota-deep)] via-[var(--color-terracota)] to-[var(--color-terracota-light)]"
                >
                  <span className="font-display text-7xl font-medium text-white/95 drop-shadow-sm">
                    {label.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveCategoryImage(category)}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
                />
                <h3 className="absolute bottom-3 left-4 right-4 m-0 font-display text-2xl font-medium text-white drop-shadow sm:text-3xl">
                  {label}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="font-sans text-xs uppercase tracking-[0.18em] text-text-muted">
                  {formatCount(reviewCount)}
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
  );
}
