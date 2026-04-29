'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getTrendingCities,
  getTrendingDishes,
  type TrendingDish,
} from '@/app/lib/api/trending';
import Rail from './Rail';
import HorizontalScroll from './HorizontalScroll';

interface TrendingRailProps {
  /** Si la pasamos, no consultamos /trending/cities. */
  defaultCity?: string;
}

/**
 * Tendencias de nicho — wrapping de /api/trending/dishes con selector de ciudad.
 * Si no hay ciudades o falla, el rail no se renderiza.
 */
export default function TrendingRail({ defaultCity }: TrendingRailProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [activeCity, setActiveCity] = useState<string | null>(defaultCity ?? null);
  const [items, setItems] = useState<TrendingDish[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (defaultCity) return;
    let cancelled = false;
    getTrendingCities()
      .then((rows) => {
        if (cancelled) return;
        const names = rows.map((r) => r.city);
        setCities(names);
        if (names.length > 0 && activeCity === null) setActiveCity(names[0]);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCity]);

  useEffect(() => {
    if (!activeCity) return;
    let cancelled = false;
    setItems(null);
    setError(false);
    getTrendingDishes({ city: activeCity, days: 7, limit: 10 })
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCity]);

  if (error) return null;
  if (items !== null && items.length === 0) return null;

  return (
    <Rail
      kicker="Tendencias de nicho"
      title="Lo más comentado de la semana"
      subtitle={
        activeCity ? `En ${activeCity}, últimos 7 días.` : 'Últimos 7 días.'
      }
      action={
        cities.length > 1 ? (
          <select
            aria-label="Ciudad"
            value={activeCity ?? ''}
            onChange={(e) => setActiveCity(e.target.value)}
            className="rounded-full border border-border-default bg-white px-3 py-1.5 font-sans text-xs"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : null
      }
    >
      {items === null ? (
        <RailSkeleton />
      ) : (
        <HorizontalScroll>
          {items.map((dish, idx) => (
            <TrendingMiniCard key={dish.dishId} dish={dish} rank={idx + 1} />
          ))}
        </HorizontalScroll>
      )}
    </Rail>
  );
}

function TrendingMiniCard({ dish, rank }: { dish: TrendingDish; rank: number }) {
  return (
    <Link
      href={`/dishes/${dish.dishId}`}
      className="flex w-64 shrink-0 snap-start gap-3 rounded-2xl border border-border-subtle bg-surface-card p-3 no-underline hover:border-action-primary"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-azafran-pale)] font-display text-lg font-bold text-[var(--color-canela)]">
        #{rank}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-display text-base font-semibold text-text-primary">
          {dish.dishName}
        </span>
        <span className="truncate font-sans text-xs text-text-muted">
          {dish.restaurantName}
        </span>
        <div className="mt-1 flex flex-wrap gap-x-2 font-sans text-[0.7rem] text-text-muted">
          <span>★ {dish.averageScore.toFixed(1)}</span>
          <span>{dish.reviewsRecent} reseñas/sem</span>
          <span>{dish.likesRecent} ❤</span>
        </div>
      </div>
    </Link>
  );
}

function RailSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden" aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-20 w-64 shrink-0 animate-pulse rounded-2xl border border-border-subtle bg-surface-card"
        />
      ))}
    </div>
  );
}
