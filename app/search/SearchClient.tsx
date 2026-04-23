'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import Tabs from '@/app/components/ui/Tabs';
import Avatar from '@/app/components/ui/Avatar';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
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
            message: 'No pudimos buscar ahora. Probá de nuevo en un momento.',
          });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

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
    { value: 'dishes', label: 'Platos', count: state.status === 'ready' ? counts.dishes : undefined },
    { value: 'restaurants', label: 'Restaurantes', count: state.status === 'ready' ? counts.restaurants : undefined },
    { value: 'users', label: 'Usuarios', count: state.status === 'ready' ? counts.users : undefined },
  ];

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">Buscar</h1>
        <label className="relative block">
          <span className="sr-only">Buscar platos, restaurantes o críticos</span>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qué estás buscando — plato, restaurante, crítico…"
            className={cn(
              'h-12 w-full rounded-full border bg-surface-card pl-11 pr-11 font-sans text-sm text-text-primary',
              'placeholder:text-text-muted',
              'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
              'border-border-default focus:border-action-primary',
            )}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </header>

      <Tabs
        ariaLabel="Categoría de búsqueda"
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
  if (state.status === 'idle') {
    return (
      <EmptyState
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className="h-8 w-8" aria-hidden />}
        title="¿Qué vas a buscar?"
        description='Probá con un plato ("ramen"), un restaurante ("Güerrin") o un usuario ("mica").'
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
    return (
      <EmptyState
        title="Sin resultados"
        description={`No encontramos ${labelForTab(activeTab)} para "${query}".`}
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

function labelForTab(tab: SearchEntity): string {
  if (tab === 'dishes') return 'platos';
  if (tab === 'restaurants') return 'restaurantes';
  return 'usuarios';
}

function DishResultRow({ dish }: { dish: DishSearchResult }) {
  const tone = dish.averageScore >= 4.5 ? 'text-action-secondary' : 'text-text-primary';
  return (
    <Link
      href={`/dishes/${dish.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-card p-4 transition-colors hover:bg-surface-subtle/40 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-medium text-text-primary">{dish.name}</p>
        <p className="truncate font-sans text-sm text-text-muted">
          en {dish.restaurantName}
          {dish.category && <span> · {dish.category}</span>}
        </p>
        <p className="mt-1 font-sans text-xs text-text-muted">
          {dish.reviewCount} {dish.reviewCount === 1 ? 'reseña' : 'reseñas'}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full border border-border-default bg-surface-card px-3 py-1 font-display text-xl font-medium leading-none tabular-nums',
          tone,
        )}
      >
        {dish.averageScore.toFixed(1)}
      </span>
    </Link>
  );
}

function RestaurantResultRow({ restaurant }: { restaurant: RestaurantSearchResult }) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-card p-4 transition-colors hover:bg-surface-subtle/40 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-medium text-text-primary">{restaurant.name}</p>
        <p className="truncate font-sans text-sm text-text-muted">
          {restaurant.category && <span>{restaurant.category} · </span>}
          {restaurant.dishCount} {restaurant.dishCount === 1 ? 'plato reseñado' : 'platos reseñados'}
        </p>
      </div>
    </Link>
  );
}

function UserResultRow({ user }: { user: UserSearchResult }) {
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
        {user.followers} {user.followers === 1 ? 'seguidor' : 'seguidores'}
      </span>
    </Link>
  );
}
