'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ApiError } from '@/app/lib/api/client';
import { getDishes } from '@/app/lib/api/dishes';
import { uploadDishCoverImage } from '@/app/lib/api/images';
import {
  clearDishCover,
  listDishPhotoCandidates,
  setDishCover,
} from '@/app/lib/api/owner-dishes';
import type { Dish } from '@/app/lib/types/dish';
import type { DishPhotoCandidate } from '@/app/lib/types/owner-content';

interface Props {
  restaurantSlug: string;
}

export default function DishesCoverManager({ restaurantSlug }: Props) {
  const t = useTranslations('ownerDashboard.dishCovers');
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [pickerDish, setPickerDish] = useState<Dish | null>(null);

  const refresh = useCallback(async () => {
    try {
      const items = await getDishes(restaurantSlug);
      // Orden estable: primero los que ya tienen cover (verificados visualmente),
      // después por review_count desc — los más reseñados son los que más impactan
      // en el menú visible.
      const sorted = [...items].sort((a, b) => {
        const ah = a.cover_image_url ? 1 : 0;
        const bh = b.cover_image_url ? 1 : 0;
        if (ah !== bh) return bh - ah;
        return (b.review_count ?? 0) - (a.review_count ?? 0);
      });
      setDishes(sorted);
    } catch {
      setDishes([]);
    }
  }, [restaurantSlug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCoverUpdated = useCallback(
    (dishId: string, coverUrl: string | null) => {
      setDishes((prev) =>
        prev
          ? prev.map((d) =>
              d.id === dishId ? { ...d, cover_image_url: coverUrl } : d,
            )
          : prev,
      );
    },
    [],
  );

  if (dishes === null) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium">{t('heading')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-2xl bg-surface-subtle"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-medium">{t('heading')}</h2>
        {dishes.length > 0 && (
          <span className="font-sans text-xs text-text-muted">
            {dishes.length}
          </span>
        )}
      </div>
      <p className="font-sans text-sm text-text-secondary">{t('intro')}</p>

      {dishes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-default bg-surface-subtle p-6 text-center">
          <h3 className="font-display text-lg">{t('emptyTitle')}</h3>
          <p className="mt-1 font-sans text-sm text-text-muted">
            {t('emptyDescription')}
          </p>
        </div>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 md:grid-cols-3">
          {dishes.map((dish) => (
            <li key={dish.id}>
              <DishRow
                dish={dish}
                onClick={() => setPickerDish(dish)}
                onClearCover={async () => {
                  try {
                    await clearDishCover(restaurantSlug, dish.id);
                    handleCoverUpdated(dish.id, null);
                  } catch {
                    // El picker maneja errores también; el clear inline es
                    // best-effort (el render mostrará el estado actual).
                  }
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {pickerDish && (
        <DishCoverPickerModal
          dish={pickerDish}
          restaurantSlug={restaurantSlug}
          onClose={() => setPickerDish(null)}
          onSaved={(url) => {
            handleCoverUpdated(pickerDish.id, url);
            setPickerDish(null);
          }}
        />
      )}
    </section>
  );
}


// ── Card por plato ──────────────────────────────────────────────────────────


function DishRow({
  dish,
  onClick,
  onClearCover,
}: {
  dish: Dish;
  onClick: () => void;
  onClearCover: () => void | Promise<void>;
}) {
  const t = useTranslations('ownerDashboard.dishCovers');
  const [confirmClear, setConfirmClear] = useState(false);
  const hasCover = !!dish.cover_image_url;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border-default bg-surface-card p-3">
      <button
        type="button"
        onClick={onClick}
        aria-label={hasCover ? t('changeAction') : t('setAction')}
        className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        {hasCover ? (
          <Image
            src={dish.cover_image_url!}
            alt={dish.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-center">
            <span className="text-3xl" aria-hidden>
              +
            </span>
            <span className="font-sans text-xs text-text-muted">
              {t('noCoverHint')}
            </span>
          </div>
        )}
        <span className="absolute bottom-2 right-2 rounded-full bg-[color:var(--color-espresso)]/80 dark:bg-[var(--neutral-100)]/85 px-2.5 py-1 font-sans text-[11px] font-semibold text-text-inverse opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          {hasCover ? t('changeAction') : t('setAction')}
        </span>
      </button>

      <div className="flex items-baseline justify-between gap-2">
        <span className="line-clamp-1 font-display text-sm">{dish.name}</span>
        <span className="shrink-0 font-sans text-[11px] text-text-muted">
          {t('reviewsCount', { count: dish.review_count ?? 0 })}
        </span>
      </div>

      {hasCover && (
        <div className="flex items-center justify-end">
          {confirmClear ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setConfirmClear(false);
                  void onClearCover();
                }}
                className="rounded-full bg-action-danger px-2.5 py-1 font-sans text-[11px] font-semibold text-text-inverse transition hover:opacity-90 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                {t('clearAction')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-full border border-border-default px-2.5 py-1 font-sans text-[11px] font-semibold text-text-secondary transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                {t('picker.closeAction')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="rounded-full font-sans text-[11px] font-medium text-text-muted transition hover:text-action-danger focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {t('clearAction')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}


// ── Modal: tabs Subir nueva / Elegir de reseñas ────────────────────────────


type PickerTab = 'upload' | 'reviews';


function DishCoverPickerModal({
  dish,
  restaurantSlug,
  onClose,
  onSaved,
}: {
  dish: Dish;
  restaurantSlug: string;
  onClose: () => void;
  onSaved: (url: string) => void;
}) {
  const t = useTranslations('ownerDashboard.dishCovers');
  const locale = useLocale();
  const [tab, setTab] = useState<PickerTab>('upload');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<DishPhotoCandidate[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cerrar con Escape — patrón del resto de modales del proyecto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Cargar candidates lazily — solo cuando el owner abre la pestaña Reviews.
  // Evita un fetch siempre que abre el modal (la pestaña por default es Upload).
  useEffect(() => {
    if (tab !== 'reviews' || candidates !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await listDishPhotoCandidates(restaurantSlug, dish.id);
        if (!cancelled) setCandidates(resp.items);
      } catch {
        if (!cancelled) setCandidates([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, candidates, restaurantSlug, dish.id]);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      try {
        const url = await uploadDishCoverImage(file, dish.id);
        await setDishCover(restaurantSlug, dish.id, url);
        onSaved(url);
      } catch (err) {
        setError(
          err instanceof ApiError && err.status === 413
            ? t('uploadError')
            : t('saveError'),
        );
      } finally {
        setBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [dish.id, restaurantSlug, onSaved, t],
  );

  const handlePromote = useCallback(
    async (url: string) => {
      setError(null);
      setBusy(true);
      try {
        await setDishCover(restaurantSlug, dish.id, url);
        onSaved(url);
      } catch {
        setError(t('saveError'));
      } finally {
        setBusy(false);
      }
    },
    [dish.id, restaurantSlug, onSaved, t],
  );

  const tabs = useMemo(
    () =>
      [
        { key: 'upload' as const, label: t('picker.tabUpload') },
        { key: 'reviews' as const, label: t('picker.tabReviews') },
      ],
    [t],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('picker.title', { dish: dish.name })}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[color:var(--color-espresso)]/60 p-0 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-surface-card shadow-xl sm:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-border-subtle p-4">
          <h2 className="font-display text-xl">
            {t('picker.title', { dish: dish.name })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('picker.closeAction')}
            className="-m-1 rounded-full p-1 text-text-muted transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            ✕
          </button>
        </header>

        <div role="tablist" className="flex gap-1 border-b border-border-subtle px-4">
          {tabs.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={`-mb-px border-b-2 px-3 py-2.5 font-sans text-sm font-semibold transition ${
                  active
                    ? 'border-action-primary text-action-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'upload' ? (
            <UploadTab
              fileInputRef={fileInputRef}
              busy={busy}
              onUpload={handleUpload}
            />
          ) : (
            <ReviewsTab
              candidates={candidates}
              busy={busy}
              locale={locale}
              onPick={handlePromote}
            />
          )}

          {error && (
            <p className="mt-3 rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Tab: Subir nueva ────────────────────────────────────────────────────────


function UploadTab({
  fileInputRef,
  busy,
  onUpload,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  busy: boolean;
  onUpload: (file: File) => void | Promise<void>;
}) {
  const t = useTranslations('ownerDashboard.dishCovers.picker');
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <label
        className={`flex w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-default bg-surface-subtle py-10 text-center font-sans text-sm text-text-secondary hover:bg-surface-card ${
          busy ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onUpload(f);
          }}
        />
        <span className="text-3xl" aria-hidden>
          ⬆
        </span>
        <span className="font-medium">
          {busy ? t('uploading') : t('uploadCta')}
        </span>
        <span className="font-sans text-xs text-text-muted">
          {t('uploadHint')}
        </span>
      </label>
    </div>
  );
}


// ── Tab: Elegir de reseñas ──────────────────────────────────────────────────


function ReviewsTab({
  candidates,
  busy,
  locale,
  onPick,
}: {
  candidates: DishPhotoCandidate[] | null;
  busy: boolean;
  locale: string;
  onPick: (url: string) => void | Promise<void>;
}) {
  const t = useTranslations('ownerDashboard.dishCovers.picker');

  if (candidates === null) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="aspect-[4/3] animate-pulse rounded-xl bg-surface-subtle"
          />
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <h3 className="font-display text-lg">{t('reviewsEmptyTitle')}</h3>
        <p className="max-w-sm font-sans text-sm text-text-muted">
          {t('reviewsEmptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
      {candidates.map((c) => (
        <li key={c.image_id} className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onPick(c.url)}
            aria-label={t('promoteAction')}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-50"
          >
            <Image
              src={c.url}
              alt={c.alt_text ?? ''}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-[1.02]"
            />
            <span className="absolute left-2 top-2 rounded-full bg-[color:var(--color-espresso)]/80 dark:bg-[var(--neutral-100)]/85 px-2 py-0.5 font-sans text-[11px] font-semibold text-text-inverse">
              {t('reviewRating', { rating: c.review_rating.toFixed(1) })}
            </span>
            <span className="absolute bottom-2 right-2 rounded-full bg-action-primary px-2.5 py-1 font-sans text-[11px] font-semibold text-text-inverse opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {busy ? t('promoting') : t('promoteAction')}
            </span>
          </button>
          <div className="flex items-baseline justify-between gap-2">
            <span className="line-clamp-1 font-sans text-[11px] text-text-secondary">
              {c.is_anonymous
                ? t('reviewByAnonymous')
                : t('reviewBy', { author: c.user_display_name ?? '—' })}
            </span>
            <span className="shrink-0 font-sans text-[11px] text-text-muted">
              {new Date(c.review_created_at).toLocaleDateString(locale, {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
