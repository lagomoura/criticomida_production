'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import type { RelatedDishItem } from '@/app/lib/types/social';

interface RelatedDishesCarouselProps {
  dishName: string;
  items: RelatedDishItem[];
}

export default function RelatedDishesCarousel({
  dishName,
  items,
}: RelatedDishesCarouselProps) {
  const t = useTranslations('dish.related');
  const tHero = useTranslations('dish.hero');
  if (items.length === 0) return null;

  return (
    <section>
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-espresso)]">
            {t('title', { dish: dishName })}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-espresso-soft)]">
            {t('subtitle')}
          </p>
        </div>
      </header>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:-mx-6 sm:px-6">
        {items.map((it) => {
          const href = `/dishes/${encodeURIComponent(it.id)}`;
          return (
            <Link
              key={it.id}
              href={href}
              className="group block w-56 shrink-0 overflow-hidden rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] no-underline shadow-sm transition hover:border-[var(--color-terracota)] hover:shadow-md"
            >
              <div className="relative h-32 w-full bg-[var(--color-crema-dark)]">
                {it.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.coverImageUrl}
                    alt={tHero('photoOf', { name: it.name })}
                    className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-terracota-pale)] to-[var(--color-terracota-deep)]/40" />
                )}
                {it.priceTier && (
                  <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--color-terracota-deep)]">
                    {it.priceTier}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-[family-name:var(--font-display)] text-base font-medium leading-snug text-[var(--color-espresso)] line-clamp-2">
                  {it.name}
                </p>
                <p className="mt-1 text-xs text-[var(--color-espresso-soft)] line-clamp-1">
                  {it.restaurantName}
                </p>
                <p className="text-xs text-[var(--color-espresso-soft)]/80 line-clamp-1">
                  {it.restaurantLocation}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-[var(--color-terracota-pale)] px-2 py-0.5 font-semibold text-[var(--color-terracota-deep)]">
                    ★ {Number(it.computedRating).toFixed(1)}
                  </span>
                  <span className="text-[var(--color-espresso-soft)]">
                    {t('reviews', { count: it.reviewCount })}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
