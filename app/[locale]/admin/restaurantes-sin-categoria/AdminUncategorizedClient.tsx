'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faTriangleExclamation,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/app/lib/i18n/navigation';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import { useToast } from '@/app/components/ui/Toast';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { getCategories } from '@/app/lib/api/categories';
import { getRestaurants, updateRestaurant } from '@/app/lib/api/restaurants';
import type { Category, RestaurantListItem } from '@/app/lib/types';

type ListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: RestaurantListItem[]; total: number };

export default function AdminUncategorizedClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('admin.uncategorized');
  const tCommon = useTranslations('admin.categorias');
  const toast = useToast();

  const [state, setState] = useState<ListState>({ status: 'loading' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () =>
      [...categories]
        .filter((c) => c.slug !== 'otros')
        .sort((a, b) =>
          a.display_order !== b.display_order
            ? a.display_order - b.display_order
            : a.name.localeCompare(b.name),
        ),
    [categories],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const [{ items, total }, cats] = await Promise.all([
        getRestaurants({ uncategorized: true, per_page: 100 }),
        getCategories(),
      ]);
      setCategories(cats);
      setState({ status: 'ready', items, total });
    } catch {
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void load();
    }
  }, [authLoading, user, load]);

  const handleAssign = useCallback(
    async (restaurant: RestaurantListItem, categoryId: number) => {
      setSavingId(restaurant.id);
      try {
        await updateRestaurant(restaurant.slug, { category_id: categoryId });
        setState((prev) =>
          prev.status === 'ready'
            ? {
                ...prev,
                items: prev.items.filter((r) => r.id !== restaurant.id),
                total: prev.total - 1,
              }
            : prev,
        );
        toast.success(t('assignSuccess', { name: restaurant.name }));
      } catch {
        toast.error(t('assignError'));
      } finally {
        setSavingId(null);
      }
    },
    [t, toast],
  );

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[50vh] items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <FontAwesomeIcon icon={faShieldHalved} className="h-8 w-8 text-text-muted" aria-hidden />
        <h1 className="font-display text-3xl font-medium text-text-primary">
          {tCommon('accessRestricted')}
        </h1>
        <p className="max-w-md font-sans text-sm text-text-muted">{tCommon('adminOnly')}</p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          {tCommon('backToFeed')}
        </Button>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6 text-action-primary" aria-hidden />
          <div>
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action-primary">
              {t('kicker')}
            </p>
            <h1 className="m-0 font-display text-3xl font-medium text-text-primary sm:text-4xl">
              {t('title')}
            </h1>
            <p className="font-sans text-sm text-text-muted">{t('subtitle')}</p>
          </div>
        </div>
        {state.status === 'ready' && state.total > 0 && (
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-sans text-sm font-medium text-text-secondary">
            {t('count', { count: state.total })}
          </span>
        )}
      </header>

      {state.status === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} shape="box" width="100%" height={80} />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="mb-2 h-5 w-5 text-action-danger"
            aria-hidden
          />
          <p className="mb-3 font-sans text-sm text-text-secondary">{tCommon('loadError')}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {tCommon('retry')}
          </Button>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState title={t('empty')} />
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <ul className="flex flex-col gap-2 p-0" role="list">
          {state.items.map((r) => (
            <li
              key={r.id}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border-default bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <Link
                  href={`/restaurants/${r.slug}`}
                  className="font-display text-lg font-medium text-text-primary no-underline hover:underline"
                >
                  {r.name}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-text-muted">
                  <span>{r.location_name}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faStar} className="h-3 w-3" aria-hidden />
                    {r.computed_rating?.toFixed(1) ?? '—'}
                    <span className="text-text-muted">({r.review_count})</span>
                  </span>
                  {r.category?.slug === 'otros' && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="rounded-full bg-surface-subtle px-2 py-0.5 font-medium uppercase tracking-wide">
                        {t('badgeOtros')}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Select
                  label={t('selectLabel')}
                  hideLabel
                  value=""
                  disabled={savingId === r.id}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (id) void handleAssign(r, id);
                  }}
                  className="w-full sm:w-64"
                >
                  <option value="">{t('selectPlaceholder')}</option>
                  {sortedCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                {savingId === r.id && (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-action-primary border-t-transparent"
                    aria-hidden
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
