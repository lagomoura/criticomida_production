'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faTriangleExclamation,
  faCheck,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/app/lib/i18n/navigation';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import { useToast } from '@/app/components/ui/Toast';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import {
  approveCategory,
  getCategories,
  getPendingCategories,
  rejectCategory,
  type PendingCategory,
} from '@/app/lib/api/categories';
import type { Category } from '@/app/lib/types';

type ListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: PendingCategory[] };

interface RejectDialogState {
  category: PendingCategory;
  targetSlug: string;
}

export default function AdminCategoriasPendientesClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('admin.categoriasPendientes');
  const toast = useToast();

  const [state, setState] = useState<ListState>({ status: 'loading' });
  const [approvedTargets, setApprovedTargets] = useState<Category[]>([]);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<RejectDialogState | null>(null);

  const sortedTargets = useMemo(
    () =>
      [...approvedTargets].sort((a, b) =>
        a.display_order !== b.display_order
          ? a.display_order - b.display_order
          : a.name.localeCompare(b.name),
      ),
    [approvedTargets],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const [pending, targets] = await Promise.all([
        getPendingCategories(),
        getCategories(),
      ]);
      setApprovedTargets(targets);
      setState({ status: 'ready', items: pending });
    } catch {
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void load();
    }
  }, [authLoading, user, load]);

  const handleApprove = useCallback(
    async (cat: PendingCategory) => {
      setPendingActionId(cat.id);
      try {
        await approveCategory(cat.slug);
        setState((prev) =>
          prev.status === 'ready'
            ? { ...prev, items: prev.items.filter((c) => c.id !== cat.id) }
            : prev,
        );
        toast.success(t('approveSuccess'));
      } catch {
        toast.error(t('approveError'));
      } finally {
        setPendingActionId(null);
      }
    },
    [t, toast],
  );

  const handleRejectConfirm = useCallback(
    async () => {
      if (!rejectDialog) return;
      const cat = rejectDialog.category;
      setPendingActionId(cat.id);
      try {
        await rejectCategory(cat.slug, rejectDialog.targetSlug);
        setState((prev) =>
          prev.status === 'ready'
            ? { ...prev, items: prev.items.filter((c) => c.id !== cat.id) }
            : prev,
        );
        toast.success(t('rejectSuccess'));
        setRejectDialog(null);
      } catch {
        toast.error(t('rejectError'));
      } finally {
        setPendingActionId(null);
      }
    },
    [rejectDialog, t, toast],
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
        <FontAwesomeIcon
          icon={faShieldHalved}
          className="h-8 w-8 text-text-muted"
          aria-hidden
        />
        <h1 className="font-display text-3xl font-medium text-text-primary">
          {t('accessRestricted')}
        </h1>
        <p className="max-w-md font-sans text-sm text-text-muted">
          {t('adminOnly')}
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          {t('backToFeed')}
        </Button>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header className="flex items-center gap-3">
        <FontAwesomeIcon
          icon={faShieldHalved}
          className="h-6 w-6 text-action-primary"
          aria-hidden
        />
        <div>
          <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action-primary">
            {t('kicker')}
          </p>
          <h1 className="m-0 font-display text-3xl font-medium text-text-primary sm:text-4xl">
            {t('title')}
          </h1>
          <p className="font-sans text-sm text-text-muted">{t('subtitle')}</p>
        </div>
      </header>

      {state.status === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} shape="box" width="100%" height={120} />
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
          <p className="mb-3 font-sans text-sm text-text-secondary">
            {t('loadError')}
          </p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {t('retry')}
          </Button>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState title={t('empty')} />
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <ul className="flex flex-col gap-3 p-0" role="list">
          {state.items.map((cat) => (
            <li
              key={cat.id}
              className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface-card p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h2 className="m-0 font-display text-xl font-medium text-text-primary">
                    {cat.name}
                  </h2>
                  <code className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono text-xs text-text-muted">
                    {cat.slug}
                  </code>
                </div>
                {cat.description && (
                  <p className="m-0 font-sans text-sm text-text-secondary">
                    {cat.description}
                  </p>
                )}
                {cat.restaurant_count > 0 && (
                  <p className="m-0 font-sans text-xs text-text-muted">
                    {t('tableRestaurants')}: {cat.restaurant_count}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={pendingActionId === cat.id}
                  onClick={() => void handleApprove(cat)}
                >
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="mr-1 h-3 w-3"
                    aria-hidden
                  />
                  {t('approve')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pendingActionId === cat.id}
                  onClick={() =>
                    setRejectDialog({ category: cat, targetSlug: 'otros' })
                  }
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="mr-1 h-3 w-3"
                    aria-hidden
                  />
                  {t('reject')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rejectDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && pendingActionId === null) {
              setRejectDialog(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-surface-card p-5 shadow-xl">
            <h2
              id="reject-dialog-title"
              className="m-0 mb-2 font-display text-xl font-medium text-text-primary"
            >
              {t('rejectTitle', { name: rejectDialog.category.name })}
            </h2>
            <p className="m-0 mb-4 font-sans text-sm text-text-secondary">
              {t('rejectMessage')}
            </p>
            <Select
              label={t('rejectTargetLabel')}
              value={rejectDialog.targetSlug}
              onChange={(e) =>
                setRejectDialog((prev) =>
                  prev ? { ...prev, targetSlug: e.target.value } : prev,
                )
              }
              disabled={pendingActionId === rejectDialog.category.id}
              className="w-full"
            >
              {sortedTargets.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                size="md"
                disabled={pendingActionId === rejectDialog.category.id}
                onClick={() => setRejectDialog(null)}
              >
                {t('rejectCancel')}
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={pendingActionId === rejectDialog.category.id}
                onClick={() => void handleRejectConfirm()}
              >
                {t('rejectConfirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
