'use client';

import Link from 'next/link';
import type { RelatedDishItem } from '@/app/lib/types/social';

interface RelatedDishesCarouselProps {
  dishName: string;
  items: RelatedDishItem[];
}

export default function RelatedDishesCarousel({
  dishName,
  items,
}: RelatedDishesCarouselProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)]">
            ¿Dónde más probar {dishName}?
          </h2>
          <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
            Otros restaurantes con el mismo plato según las reseñas de la comunidad.
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
              className="group block w-56 shrink-0 overflow-hidden rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] no-underline shadow-sm transition hover:border-[var(--color-azafran)] hover:shadow-md"
            >
              <div className="relative h-32 w-full bg-[var(--color-crema-dark)]">
                {it.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.coverImageUrl}
                    alt={`Foto de ${it.name}`}
                    className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-azafran-pale)] to-[var(--color-canela)]/40" />
                )}
                {it.priceTier && (
                  <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--color-canela)]">
                    {it.priceTier}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-[family-name:var(--font-display)] text-base font-medium leading-snug text-[var(--color-carbon)] line-clamp-2">
                  {it.name}
                </p>
                <p className="mt-1 text-xs text-[var(--color-carbon-soft)] line-clamp-1">
                  {it.restaurantName}
                </p>
                <p className="text-xs text-[var(--color-carbon-soft)]/80 line-clamp-1">
                  {it.restaurantLocation}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-[var(--color-azafran-pale)] px-2 py-0.5 font-semibold text-[var(--color-canela)]">
                    ★ {Number(it.computedRating).toFixed(1)}
                  </span>
                  <span className="text-[var(--color-carbon-soft)]">
                    {it.reviewCount} reseñas
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
