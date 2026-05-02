'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faHeart,
  faComment,
  faPenToSquare,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import Tabs from '@/app/components/ui/Tabs';
import {
  getTrendingCities,
  getTrendingDishes,
  type TrendingCity,
  type TrendingDish,
} from '@/app/lib/api/trending';
import { cn } from '@/app/lib/utils/cn';

const STORAGE_KEY = 'criticomida.trending.city';

type CitiesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: TrendingCity[] };

type DishesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: TrendingDish[] };

export default function TrendingClient() {
  const t = useTranslations('trending');
  const [cities, setCities] = useState<CitiesState>({ status: 'loading' });
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [days, setDays] = useState<number>(7);
  const [dishes, setDishes] = useState<DishesState>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await getTrendingCities();
        if (cancelled) return;
        setCities({ status: 'ready', items });

        const stored = typeof window !== 'undefined'
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
        const initial = stored && items.some((c) => c.city === stored)
          ? stored
          : items[0]?.city ?? '';
        setSelectedCity(initial);
      } catch {
        if (!cancelled) setCities({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCity) {
      setDishes({ status: 'idle' });
      return;
    }
    let cancelled = false;
    setDishes({ status: 'loading' });
    (async () => {
      try {
        const items = await getTrendingDishes({ city: selectedCity, days });
        if (!cancelled) setDishes({ status: 'ready', items });
      } catch {
        if (!cancelled) setDishes({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCity, days]);

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, city);
    }
  }, []);

  const cityOptions = useMemo(() => {
    if (cities.status !== 'ready') return [];
    return cities.items;
  }, [cities]);

  const windowOptions = [
    { value: '7', label: t('window7') },
    { value: '30', label: t('window30') },
  ];

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header className="flex items-start gap-3">
        <FontAwesomeIcon
          icon={faArrowTrendUp}
          className="mt-1 h-6 w-6 text-action-primary"
          aria-hidden
        />
        <div>
          <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
            {t('title')}
          </h1>
          <p className="font-sans text-sm text-text-muted">
            {t('subtitle')}
          </p>
        </div>
      </header>

      {cities.status === 'loading' && <Skeleton shape="box" width="100%" height={48} />}

      {cities.status === 'error' && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-4 text-center font-sans text-sm text-text-secondary">
          {t('citiesError')}
        </div>
      )}

      {cities.status === 'ready' && cities.items.length === 0 && (
        <EmptyState
          title={t('noActivityTitle')}
          description={t('noActivityDescription')}
          action={{ label: t('writeReview'), href: '/compose' }}
        />
      )}

      {cities.status === 'ready' && cities.items.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label={t('cityLabel')}
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              {cityOptions.map((c) => (
                <option key={c.city} value={c.city}>
                  {t('cityOption', { name: c.city, count: c.restaurantCount })}
                </option>
              ))}
            </Select>
            <div className="flex flex-col gap-1.5">
              <span className="font-sans text-sm font-medium text-text-secondary">
                {t('windowLabel')}
              </span>
              <Tabs
                ariaLabel={t('windowAria')}
                value={String(days)}
                items={windowOptions}
                onChange={(v) => setDays(Number(v))}
              />
            </div>
          </div>

          <section aria-live="polite" className="flex flex-col gap-3">
            {dishes.status === 'loading' && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} shape="box" width="100%" height={84} />
                ))}
              </>
            )}

            {dishes.status === 'error' && (
              <div className="rounded-2xl border border-border-default bg-surface-card p-4 text-center">
                <p className="mb-2 font-sans text-sm text-text-secondary">
                  {t('loadError')}
                </p>
                <Button variant="outline" size="sm" onClick={() => setDays(days)}>
                  {t('tryAgain')}
                </Button>
              </div>
            )}

            {dishes.status === 'ready' && dishes.items.length === 0 && (
              <EmptyState
                title={t('noRecentTitle', { city: selectedCity })}
                description={t('noRecentDescription', { days })}
              />
            )}

            {dishes.status === 'ready' && dishes.items.length > 0 && (
              <ol className="flex list-none flex-col gap-3 p-0">
                {dishes.items.map((dish, i) => (
                  <li key={dish.dishId}>
                    <TrendingRow rank={i + 1} dish={dish} />
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function TrendingRow({ rank, dish }: { rank: number; dish: TrendingDish }) {
  const t = useTranslations('trending');
  return (
    <Link
      href={`/dishes/${dish.dishId}`}
      className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-card p-4 transition-colors hover:bg-surface-subtle/40 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <span
        aria-label={t('rankAria', { rank })}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-lg font-medium tabular-nums',
          rank === 1
            ? 'bg-action-primary text-text-inverse'
            : rank <= 3
              ? 'bg-action-highlight/30 text-action-primary'
              : 'bg-surface-subtle text-text-secondary',
        )}
      >
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-medium text-text-primary">
          {dish.dishName}
        </p>
        <p className="flex items-center gap-1 truncate font-sans text-sm text-text-muted">
          <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" aria-hidden />
          <span className="truncate">{dish.restaurantName}</span>
        </p>
        <p className="mt-1 flex items-center gap-3 font-sans text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <FontAwesomeIcon icon={faHeart} className="h-3 w-3" aria-hidden />
            {dish.likesRecent}
          </span>
          <span className="inline-flex items-center gap-1">
            <FontAwesomeIcon icon={faComment} className="h-3 w-3" aria-hidden />
            {dish.commentsRecent}
          </span>
          <span className="inline-flex items-center gap-1">
            <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" aria-hidden />
            {dish.reviewsRecent}
          </span>
        </p>
      </div>

      <span
        aria-label={t('scoreAria', { score: dish.averageScore.toFixed(1) })}
        className={cn(
          'shrink-0 rounded-full border border-border-default bg-surface-card px-3 py-1 font-display text-xl font-medium leading-none tabular-nums',
          dish.averageScore >= 4.5 ? 'text-action-secondary' : 'text-text-primary',
        )}
      >
        {dish.averageScore.toFixed(1)}
      </span>
    </Link>
  );
}
