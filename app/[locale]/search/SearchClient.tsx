'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Tabs from '@/app/components/ui/Tabs';
import Avatar from '@/app/components/ui/Avatar';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import RatingPill from '@/app/components/ui/RatingPill';
import CategoriesShortcutStrip from '@/app/components/search/CategoriesShortcutStrip';
import { searchAll, type SearchEntity, type SearchResults } from '@/app/lib/api/search';
import { cn } from '@/app/lib/utils/cn';
import type {
  DishSearchResult,
  RestaurantSearchResult,
  UserSearchResult,
} from '@/app/lib/types/social';

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; results: SearchResults };

const DEBOUNCE_MS = 280;

export default function SearchClient() {
  const t = useTranslations('search');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchEntity>('dishes');
  const [state, setState] = useState<ViewState>({ status: 'idle' });

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });
    const timer = window.setTimeout(async () => {
      try {
        const results = await searchAll(trimmed);
        if (!cancelled) setState({ status: 'ready', results });
      } catch {
        if (!cancelled) {
          setState({
            status: 'error',
            message: t('errorMessage'),
          });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, t]);

  const counts = useMemo(() => {
    if (state.status !== 'ready') return { dishes: 0, restaurants: 0, users: 0 };
    return {
      dishes: state.results.dishes.length,
      restaurants: state.results.restaurants.length,
      users: state.results.users.length,
    };
  }, [state]);

  const handleClear = useCallback(() => setQuery(''), []);

  const tabs = [
    { value: 'dishes', label: t('tabDishes'), count: state.status === 'ready' ? counts.dishes : undefined },
    { value: 'restaurants', label: t('tabRestaurants'), count: state.status === 'ready' ? counts.restaurants : undefined },
    { value: 'users', label: t('tabUsers'), count: state.status === 'ready' ? counts.users : undefined },
  ];

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header className="flex flex-col gap-5">
        <div>
          <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action-primary">
            {t('kicker')}
          </p>
          <h1 className="mt-1.5 m-0 font-display text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.05] text-text-primary">
            {t('title')}
          </h1>
        </div>
        <label className="relative block">
          <span className="sr-only">{t('srLabel')}</span>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            aria-hidden
            className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors peer-focus:text-action-primary"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className={cn(
              'h-14 w-full rounded-2xl border-2 bg-surface-card pl-14 pr-12 font-display text-lg text-text-primary',
              'shadow-[var(--shadow-base)] transition-[border-color,box-shadow] duration-[var(--duration-standard)]',
              'placeholder:font-sans placeholder:text-base placeholder:text-text-muted',
              'focus:outline-none focus:border-action-primary focus:shadow-[var(--shadow-elevated)]',
              'border-border-default',
            )}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={t('clear')}
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </header>

      {!query.trim() && <CategoriesShortcutStrip />}

      <Tabs
        ariaLabel={t('tabsLabel')}
        value={activeTab}
        items={tabs}
        onChange={(v) => setActiveTab(v as SearchEntity)}
      />

      <ResultsArea state={state} activeTab={activeTab} query={query} />
    </div>
  );
}

function ResultsArea({
  state,
  activeTab,
  query,
}: {
  state: ViewState;
  activeTab: SearchEntity;
  query: string;
}) {
  const t = useTranslations('search');
  if (state.status === 'idle') {
    return (
      <EmptyState
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className="h-8 w-8" aria-hidden />}
        title={t('idleTitle')}
        description={t('idleDescription')}
      />
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} shape="box" width="100%" height={76} />
        ))}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
        <FontAwesomeIcon icon={faTriangleExclamation} className="mb-2 h-5 w-5 text-action-danger" aria-hidden />
        <p className="font-sans text-sm text-text-secondary">{state.message}</p>
      </div>
    );
  }

  const items =
    activeTab === 'dishes'
      ? state.results.dishes
      : activeTab === 'restaurants'
        ? state.results.restaurants
        : state.results.users;

  if (items.length === 0) {
    const emptyKey =
      activeTab === 'dishes'
        ? 'emptyDishes'
        : activeTab === 'restaurants'
          ? 'emptyRestaurants'
          : 'emptyUsers';
    return (
      <EmptyState
        title={t('emptyTitle')}
        description={t(emptyKey, { query })}
      />
    );
  }

  if (activeTab === 'dishes') {
    return (
      <ul className="flex list-none flex-col gap-3 p-0">
        {(items as DishSearchResult[]).map((d) => (
          <li key={d.id}>
            <DishResultRow dish={d} />
          </li>
        ))}
      </ul>
    );
  }

  if (activeTab === 'restaurants') {
    return (
      <ul className="flex list-none flex-col gap-3 p-0">
        {(items as RestaurantSearchResult[]).map((r) => (
          <li key={r.id}>
            <RestaurantResultRow restaurant={r} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex list-none flex-col gap-3 p-0">
      {(items as UserSearchResult[]).map((u) => (
        <li key={u.id}>
          <UserResultRow user={u} />
        </li>
      ))}
    </ul>
  );
}

function DishResultRow({ dish }: { dish: DishSearchResult }) {
  const t = useTranslations('search');
  return (
    <Link
      href={`/dishes/${dish.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-[var(--shadow-base)] transition-[transform,box-shadow] duration-[var(--duration-standard)] hover:-translate-y-px hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-medium italic text-text-primary">
          {dish.name}
        </p>
        <p className="truncate font-sans text-sm text-text-muted">
          <span className="font-display italic text-text-secondary">{t('atRestaurant')}</span>
          {dish.restaurantName}
          {dish.category && <span> · {dish.category}</span>}
        </p>
        <p className="mt-1 font-sans text-xs text-text-muted">
          {dish.reviewCount === 1
            ? t('reviewOne', { count: dish.reviewCount })
            : t('reviewMany', { count: dish.reviewCount })}
        </p>
      </div>
      <RatingPill value={dish.averageScore * 2} size="md" className="shrink-0" />
    </Link>
  );
}

function RestaurantResultRow({ restaurant }: { restaurant: RestaurantSearchResult }) {
  const t = useTranslations('search');
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-card p-4 transition-colors hover:bg-surface-subtle/40 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-medium text-text-primary">{restaurant.name}</p>
        <p className="truncate font-sans text-sm text-text-muted">
          {restaurant.category && <span>{restaurant.category} · </span>}
          {restaurant.dishCount === 1
            ? t('dishOneReviewed', { count: restaurant.dishCount })
            : t('dishManyReviewed', { count: restaurant.dishCount })}
        </p>
      </div>
    </Link>
  );
}

function UserResultRow({ user }: { user: UserSearchResult }) {
  const t = useTranslations('search');
  return (
    <Link
      href={`/u/${user.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-card p-4 transition-colors hover:bg-surface-subtle/40 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <Avatar src={user.avatarUrl} name={user.displayName} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-base font-medium text-text-primary">{user.displayName}</p>
        {user.handle && (
          <p className="truncate font-sans text-sm text-text-muted">@{user.handle}</p>
        )}
        {user.bio && (
          <p className="mt-0.5 line-clamp-1 font-sans text-sm text-text-secondary">{user.bio}</p>
        )}
      </div>
      <span className="shrink-0 font-sans text-xs tabular-nums text-text-muted">
        {user.followers === 1
          ? t('followerOne', { count: user.followers })
          : t('followerMany', { count: user.followers })}
      </span>
    </Link>
  );
}
