'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslations } from 'next-intl';
import {
  faXmark,
  faMagnifyingGlass,
  faImage,
  faTrashCan,
  faChevronRight,
  faPlus,
  faUtensils,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import { createDish, updateDish } from '@/app/lib/api/dishes';
import { uploadDishCoverImage } from '@/app/lib/api/images';
import { getMyReviewsForDish } from '@/app/lib/api/reviews';
import { Dish, DishReview, PriceTier } from '@/app/lib/types';
import DishReviewForm from './DishReviewForm';

interface PublishReviewModalProps {
  show: boolean;
  restaurantSlug: string;
  existingDishes: Dish[];
  /** Si se pasa, el modal abre directamente con este plato pre-seleccionado. */
  initialDish?: Dish | null;
  /** ISO 4217 del restaurante para formatear el campo precio. */
  currencyCode?: string | null;
  /** Cuando se pasa y el usuario seleccionó un plato existente, el modal
   * busca la última reseña que este user hizo del plato y la muestra como
   * recordatorio dentro del form (panel colapsable). Si es null/undefined
   * el panel queda desactivado. */
  currentUserId?: string | null;
  onClose: () => void;
  onSuccess: (dish: Dish, review: DishReview) => void;
}

type DishSelection =
  | { kind: 'existing'; dish: Dish }
  | { kind: 'new'; name: string };

export default function PublishReviewModal({
  show,
  restaurantSlug,
  existingDishes,
  initialDish = null,
  currencyCode = null,
  currentUserId = null,
  onClose,
  onSuccess,
}: PublishReviewModalProps) {
  const t = useTranslations('restaurant.publishReviewModal');
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<DishSelection | null>(null);

  // Inline new-dish fields.
  const [newDescription, setNewDescription] = useState('');
  const [newPriceTier, setNewPriceTier] = useState<PriceTier | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);

  // Última review que el usuario actual hizo del plato seleccionado.
  // Sólo se carga para platos existentes y cuando hay `currentUserId`.
  const [previousReview, setPreviousReview] = useState<DishReview | null>(null);

  const previewRef = useRef<string | null>(null);
  const createdDishRef = useRef<Dish | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Reset on open + cleanup blob URL on close. Si llega `initialDish`,
  // preselecciona y arranca directo en el form de reseña.
  useEffect(() => {
    if (show) {
      if (initialDish) {
        setQuery(initialDish.name);
        setSelection({ kind: 'existing', dish: initialDish });
      } else {
        setQuery('');
        setSelection(null);
      }
      setNewDescription('');
      setNewPriceTier(null);
      setNewCoverFile(null);
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setNewCoverPreview(null);
      createdDishRef.current = null;
    }
  }, [show, initialDish]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
    };
  }, []);

  // Cuando se elige un plato existente y hay user, traer su review más
  // reciente para mostrarla como recordatorio en el form. Plato nuevo o
  // user anónimo → no aplica.
  useEffect(() => {
    if (!show) return;
    if (!currentUserId || selection?.kind !== 'existing') {
      setPreviousReview(null);
      return;
    }
    let cancelled = false;
    getMyReviewsForDish(selection.dish.id, currentUserId)
      .then((rows) => {
        if (cancelled) return;
        // getMyReviewsForDish ordena ASC; queremos la última.
        setPreviousReview(rows.length > 0 ? rows[rows.length - 1] : null);
      })
      .catch(() => {
        if (!cancelled) setPreviousReview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [show, currentUserId, selection]);

  // Lock scroll + close on Escape.
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
  }, [show, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return existingDishes;
    return existingDishes.filter((d) => d.name.toLowerCase().includes(q));
  }, [query, existingDishes]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return existingDishes.find((d) => d.name.toLowerCase() === q) ?? null;
  }, [query, existingDishes]);

  function pickExisting(dish: Dish) {
    setSelection({ kind: 'existing', dish });
    setQuery(dish.name);
  }

  function pickNew() {
    const name = query.trim();
    if (!name) return;
    setSelection({ kind: 'new', name });
  }

  function clearSelection() {
    setSelection(null);
    createdDishRef.current = null;
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setNewCoverPreview(url);
    } else {
      setNewCoverPreview(null);
    }
    setNewCoverFile(file);
  }

  function clearCover() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setNewCoverFile(null);
    setNewCoverPreview(null);
  }

  async function resolveDishId(): Promise<string> {
    if (selection?.kind === 'existing') return selection.dish.id;
    if (selection?.kind !== 'new') {
      throw new Error(t('missingDishError'));
    }
    if (createdDishRef.current) return createdDishRef.current.id;

    let dish = await createDish(restaurantSlug, {
      name: selection.name,
      description: newDescription.trim() || undefined,
      price_tier: newPriceTier ?? undefined,
    });
    if (newCoverFile) {
      try {
        const url = await uploadDishCoverImage(newCoverFile, dish.id);
        dish = await updateDish(dish.id, { cover_image_url: url });
      } catch {
        /* la review se publica igual sin cover */
      }
    }
    createdDishRef.current = dish;
    return dish.id;
  }

  function handleReviewSuccess(review: DishReview) {
    let dish: Dish | null = null;
    if (selection?.kind === 'existing') dish = selection.dish;
    else if (createdDishRef.current) dish = createdDishRef.current;
    if (dish) onSuccess(dish, review);
    onClose();
  }

  if (!show) return null;

  const dishName =
    selection?.kind === 'existing'
      ? selection.dish.name
      : selection?.kind === 'new'
        ? selection.name
        : '';

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-end justify-center sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label={t('close')}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-color-carbon/55 backdrop-blur-md transition-opacity motion-safe:animate-[cc-modal-fade-in_180ms_ease-out]"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-review-title"
        className={[
          'relative z-10 grid w-full overflow-hidden bg-surface-card text-text-primary',
          // Grid 2 filas: chrome (drag + header + divider) + body scrollable.
          // minmax(0, 1fr) en el body es CRÍTICO: el min:0 evita que el grid
          // use min-content (que desactivaría el overflow-y-auto del body),
          // y permite que el body crezca/scrollee dentro del modal de altura
          // estable. flex-1 + min-h-0 funciona pero es más frágil ante
          // re-layouts (file picker en Chrome/Edge dispara uno y colapsaba
          // el body a ~3px).
          'grid-rows-[auto_minmax(0,1fr)]',
          'max-h-[94dvh] sm:max-h-[88dvh] sm:max-w-[48rem]',
          'rounded-t-3xl sm:rounded-3xl',
          'border-t border-border-subtle sm:border',
          'shadow-[var(--shadow-floating)]',
          'motion-safe:animate-[cc-modal-sheet-up_320ms_var(--ease-spoon)] sm:motion-safe:animate-[cc-modal-pop_240ms_var(--ease-spoon)]',
        ].join(' ')}
      >
        {/* Row 1: chrome (drag + header + divider) */}
        <div>
        {/* Drag indicator (mobile) */}
        <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-border-default" aria-hidden />
        </div>

        {/* Header */}
        <header className="relative px-6 pt-5 pb-4 sm:px-8 sm:pt-7 sm:pb-5">
          <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.22em] text-color-azafran">
            {t('kicker')}
          </p>
          <h2
            id="publish-review-title"
            className="mt-1.5 font-display text-[2rem] font-medium leading-[1.1] text-text-primary sm:text-[2.5rem]"
          >
            {selection ? t('selectedTitle', { name: dishName }) : t('selectionPrompt')}
          </h2>
          <p className="mt-1.5 font-sans text-sm leading-snug text-text-muted">
            {selection ? t('selectedSubtitle') : t('selectionSubtitle')}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className={[
              'absolute right-4 top-4 sm:right-5 sm:top-5',
              'inline-flex h-9 w-9 items-center justify-center rounded-full',
              'text-text-muted transition-all',
              'hover:bg-surface-subtle hover:text-text-primary',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            ].join(' ')}
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="mx-6 h-px bg-border-subtle sm:mx-8" aria-hidden />
        </div>

        {/* Row 2: body scrollable. minmax(0,1fr) del grid-template del padre
            le da altura definida; overflow-y-auto se encarga del scroll. */}
        <div className="overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
          {!selection && (
            <DishPicker
              query={query}
              onQueryChange={setQuery}
              filtered={filtered}
              showCreateOption={Boolean(query.trim()) && !exactMatch}
              onPickExisting={pickExisting}
              onPickNew={pickNew}
              isMenuEmpty={existingDishes.length === 0}
            />
          )}

          {selection && (
            <div className="flex flex-col gap-5">
              {/* Selected dish summary */}
              <SelectedDishCard
                kind={selection.kind}
                name={dishName}
                coverUrl={selection.kind === 'existing' ? selection.dish.cover_image_url : null}
                priceTier={selection.kind === 'existing' ? selection.dish.price_tier : null}
                onChange={clearSelection}
              />

              {/* Inline new-dish details */}
              {selection.kind === 'new' && (
                <NewDishInlineFields
                  description={newDescription}
                  onDescriptionChange={setNewDescription}
                  priceTier={newPriceTier}
                  onPriceTierChange={setNewPriceTier}
                  coverPreview={newCoverPreview}
                  onCoverChange={handleCoverChange}
                  onCoverClear={clearCover}
                />
              )}

              {/* Review form */}
              <SectionLabel>{t('yourReview')}</SectionLabel>
              <DishReviewForm
                dishId={selection.kind === 'existing' ? selection.dish.id : undefined}
                resolveDishId={selection.kind === 'new' ? resolveDishId : undefined}
                dishName={dishName}
                currencyCode={currencyCode}
                previousReview={
                  selection.kind === 'existing' ? previousReview : null
                }
                onSuccess={handleReviewSuccess}
                onCancel={onClose}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/* ---------- Sub-components ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        {children}
      </span>
      <div className="h-px flex-1 bg-border-subtle" aria-hidden />
    </div>
  );
}

function DishPicker({
  query,
  onQueryChange,
  filtered,
  showCreateOption,
  onPickExisting,
  onPickNew,
  isMenuEmpty,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  filtered: Dish[];
  showCreateOption: boolean;
  onPickExisting: (d: Dish) => void;
  onPickNew: () => void;
  isMenuEmpty: boolean;
}) {
  const t = useTranslations('restaurant.publishReviewModal');
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="text"
          autoFocus
          className={[
            'w-full rounded-full border border-border-subtle bg-surface-page',
            'pl-11 pr-4 py-3 font-sans text-base text-text-primary',
            'placeholder:text-text-muted/80',
            'transition-all',
            'focus:border-color-azafran focus:bg-surface-card focus:outline-none',
            'focus-visible:[box-shadow:var(--focus-ring)]',
          ].join(' ')}
          placeholder={isMenuEmpty ? t('searchEmpty') : t('searchPlaceholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t('fromMenu')}</SectionLabel>
          <ul className="flex flex-col gap-1.5" aria-label={t('menuListAria')}>
            {filtered.map((dish) => (
              <li key={dish.id}>
                <button
                  type="button"
                  onClick={() => onPickExisting(dish)}
                  className={[
                    'group relative flex w-full items-center gap-3 overflow-hidden',
                    'rounded-2xl border border-border-subtle bg-surface-page px-3 py-2.5 text-left',
                    'transition-all',
                    'hover:border-color-azafran hover:bg-color-azafran-pale hover:shadow-[var(--shadow-micro)]',
                    'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  ].join(' ')}
                >
                  <span
                    className="absolute left-0 top-0 h-full w-0.5 bg-color-azafran opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                  <DishThumb url={dish.cover_image_url} />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate font-sans text-[15px] font-semibold text-text-primary">
                      {dish.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {dish.price_tier && (
                        <span className="font-display text-sm font-semibold text-color-canela">
                          {dish.price_tier}
                        </span>
                      )}
                      {dish.review_count > 0 && (
                        <span className="font-sans text-xs text-text-muted">
                          {dish.review_count === 1
                            ? t('reviewOne', { count: dish.review_count })
                            : t('reviewMany', { count: dish.review_count })}
                        </span>
                      )}
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="h-3 w-3 text-text-muted transition-all group-hover:translate-x-0.5 group-hover:text-color-azafran"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCreateOption && (
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t('newOnMenu')}</SectionLabel>
          <button
            type="button"
            onClick={onPickNew}
            className={[
              'group flex w-full items-center gap-3 overflow-hidden',
              'rounded-2xl border-2 border-dashed border-color-azafran bg-color-azafran-pale px-4 py-3 text-left',
              'transition-all hover:bg-color-azafran-pale hover:shadow-[var(--shadow-micro)]',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            ].join(' ')}
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-color-azafran text-text-inverse">
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 font-sans text-[10.5px] font-semibold uppercase tracking-[0.16em] text-color-azafran">
                {t('createNewDish')}
              </p>
              <p className="mt-0.5 truncate font-sans text-[15px] font-semibold text-color-canela">
                {query.trim()}
              </p>
            </div>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="h-3 w-3 text-color-canela transition-all group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </div>
      )}

      {filtered.length === 0 && !showCreateOption && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-default bg-surface-page px-6 py-10 text-center">
          <FontAwesomeIcon
            icon={faUtensils}
            className="h-8 w-8 text-text-muted/60"
            aria-hidden
          />
          <p className="m-0 font-display text-lg font-medium text-text-primary">
            {isMenuEmpty ? t('noDishes') : t('noMatches')}
          </p>
          <p className="m-0 max-w-xs font-sans text-sm text-text-muted">
            {isMenuEmpty ? t('emptyHintAuth') : t('emptyHintNoMatch')}
          </p>
        </div>
      )}
    </div>
  );
}

function DishThumb({ url }: { url: string | null }) {
  if (url) {
    return (
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-text-muted">
      <FontAwesomeIcon icon={faUtensils} className="h-4 w-4" aria-hidden />
    </span>
  );
}

function SelectedDishCard({
  kind,
  name,
  coverUrl,
  priceTier,
  onChange,
}: {
  kind: 'existing' | 'new';
  name: string;
  coverUrl: string | null;
  priceTier: PriceTier | null;
  onChange: () => void;
}) {
  const t = useTranslations('restaurant.publishReviewModal');
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-page p-3">
      {kind === 'existing' ? (
        <DishThumb url={coverUrl} />
      ) : (
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-color-azafran text-text-inverse">
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" aria-hidden />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5',
              'font-sans text-[10px] font-semibold uppercase tracking-[0.12em]',
              kind === 'existing'
                ? 'bg-color-albahaca-pale text-color-albahaca'
                : 'bg-color-azafran-pale text-color-canela',
            ].join(' ')}
          >
            {kind === 'existing' ? t('fromMenuBadge') : t('newBadge')}
          </span>
          {priceTier && (
            <span className="font-display text-sm font-semibold text-color-canela">
              {priceTier}
            </span>
          )}
        </div>
        <p className="mt-0.5 m-0 truncate font-display text-lg font-medium text-text-primary">
          {name}
        </p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={[
          'inline-flex h-9 items-center gap-1.5 rounded-full px-3',
          'font-sans text-xs font-semibold text-text-secondary',
          'transition-colors hover:bg-surface-subtle hover:text-text-primary',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        ].join(' ')}
      >
        <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" aria-hidden />
        {t('change')}
      </button>
    </div>
  );
}

function NewDishInlineFields({
  description,
  onDescriptionChange,
  priceTier,
  onPriceTierChange,
  coverPreview,
  onCoverChange,
  onCoverClear,
}: {
  description: string;
  onDescriptionChange: (v: string) => void;
  priceTier: PriceTier | null;
  onPriceTierChange: (v: PriceTier | null) => void;
  coverPreview: string | null;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverClear: () => void;
}) {
  const t = useTranslations('restaurant.publishReviewModal');
  const PRICE_TIERS: { value: PriceTier; symbol: string; label: string }[] = [
    { value: '$', symbol: '$', label: t('priceTierCheap') },
    { value: '$$', symbol: '$$', label: t('priceTierMid') },
    { value: '$$$', symbol: '$$$', label: t('priceTierHigh') },
  ];
  const inputBase = [
    'w-full rounded-xl border border-border-subtle bg-surface-card',
    'px-4 py-3 font-sans text-base text-text-primary',
    'placeholder:text-text-muted/80 transition-all',
    'focus:border-color-azafran focus:outline-none',
    'focus-visible:[box-shadow:var(--focus-ring)]',
  ].join(' ');

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-page p-4">
      <SectionLabel>{t('newDishDetails')}</SectionLabel>

      <div>
        <label className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          {t('descriptionLabel')}
        </label>
        <textarea
          rows={2}
          className={`${inputBase} resize-none`}
          placeholder={t('descriptionPlaceholder')}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,auto]">
        <div>
          <label className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            {t('priceRangeLabel')}
          </label>
          <div role="radiogroup" aria-label={t('priceRangeLabel')} className="grid grid-cols-3 gap-2">
            {PRICE_TIERS.map((opt) => {
              const isSelected = priceTier === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onPriceTierChange(isSelected ? null : opt.value)}
                  className={[
                    'flex flex-col items-center justify-center gap-0.5',
                    'rounded-xl border-2 px-3 py-2 transition-all',
                    'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                    isSelected
                      ? 'border-color-azafran bg-color-azafran-pale text-color-canela shadow-[var(--shadow-micro)]'
                      : 'border-border-subtle bg-surface-card text-text-secondary hover:border-border-default hover:bg-surface-subtle',
                  ].join(' ')}
                >
                  <span className="font-display text-xl font-semibold leading-none">
                    {opt.symbol}
                  </span>
                  <span className="text-[9.5px] font-medium uppercase tracking-[0.1em]">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            {t('photoLabel')}
          </label>
          {coverPreview ? (
            <div className="relative h-[88px] w-[88px] overflow-hidden rounded-xl border border-border-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={onCoverClear}
                aria-label={t('removePhoto')}
                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-card/95 text-[11px] text-text-primary shadow-[var(--shadow-base)] backdrop-blur transition-colors hover:bg-surface-card"
              >
                <FontAwesomeIcon icon={faTrashCan} className="h-2.5 w-2.5" aria-hidden />
              </button>
            </div>
          ) : (
            <label className="group flex h-[88px] w-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-default bg-surface-card transition-all hover:border-color-azafran hover:bg-color-azafran-pale">
              <FontAwesomeIcon
                icon={faImage}
                className="h-5 w-5 text-text-muted transition-colors group-hover:text-color-azafran"
                aria-hidden
              />
              <span className="font-sans text-[10px] font-medium text-text-muted group-hover:text-color-canela">
                {t('uploadPhoto')}
              </span>
              <input type="file" accept="image/*" className="sr-only" onChange={onCoverChange} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
