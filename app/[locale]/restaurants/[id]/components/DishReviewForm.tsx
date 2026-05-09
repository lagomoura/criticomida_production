'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createReview, updateReview, uploadReviewPhoto } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { DishReview, MealPeriod, PillarScore, PortionSize } from '@/app/lib/types';
import ReviewFormBody, {
  companyFromVisitedWith,
  companyToVisitedWith,
  inferMealPeriodFromTime,
  type ReviewFormBodyValue,
} from '@/app/components/social/ReviewFormBody';
import PreviousReviewRecall from './PreviousReviewRecall';

/** Subset de DishReview necesario para pre-llenar el form en modo edición. */
export interface DishReviewFormInitial {
  rating: number;
  note: string;
  date_tasted: string;
  time_tasted: string | null;
  meal_period: MealPeriod | null;
  price_paid: number | null;
  portion_size: PortionSize | null;
  would_order_again: boolean | null;
  visited_with: string | null;
  is_anonymous: boolean;
  presentation: PillarScore | null;
  value_prop: PillarScore | null;
  execution: PillarScore | null;
  pros_cons: { type: 'pro' | 'con'; text: string }[];
  tags: { tag: string }[];
  images: { id: string; url: string; alt_text: string | null }[];
}

interface DishReviewFormProps {
  dishId?: string;
  resolveDishId?: () => Promise<string>;
  dishName: string;
  /** En modo edit, el segundo arg es el nombre tipeado al guardar — el modal
   * lo usa para actualizar el overlay del post si el nombre cambió. */
  onSuccess: (review: DishReview, newDishName?: string) => void;
  onCancel: () => void;
  cancelLabel?: string;
  mode?: 'create' | 'edit';
  reviewId?: string;
  initial?: DishReviewFormInitial;
  submitLabel?: string;
  currencyCode?: string | null;
  previousReview?: DishReview | null;
}

function buildInitialValue(initial?: DishReviewFormInitial): ReviewFormBodyValue {
  if (!initial) {
    return {
      rating: 5,
      wouldOrderAgain: null,
      pillars: { presentation: null, value_prop: null, execution: null },
      note: '',
      pros: [],
      cons: [],
      existingImages: [],
      photos: [],
      pricePaid: '',
      portionSize: '',
      dateTasted: new Date().toISOString().slice(0, 10),
      mealPeriod: null,
      companyType: null,
      visitedWith: '',
      tags: [],
      isAnonymous: false,
    };
  }
  const company = companyFromVisitedWith(initial.visited_with);
  // Prefer the persisted `meal_period`; fall back to inferring from any
  // legacy `time_tasted` so old reviews still pre-fill the picker on edit.
  const mealPeriod =
    initial.meal_period ?? inferMealPeriodFromTime(initial.time_tasted);
  return {
    rating: initial.rating,
    wouldOrderAgain: initial.would_order_again,
    pillars: {
      presentation: initial.presentation,
      value_prop: initial.value_prop,
      execution: initial.execution,
    },
    note: initial.note,
    pros: initial.pros_cons.filter((x) => x.type === 'pro').map((x) => x.text),
    cons: initial.pros_cons.filter((x) => x.type === 'con').map((x) => x.text),
    existingImages: initial.images,
    photos: [],
    pricePaid: initial.price_paid != null ? String(initial.price_paid) : '',
    portionSize: initial.portion_size ?? '',
    dateTasted: initial.date_tasted,
    mealPeriod,
    companyType: company.companyType,
    visitedWith: company.visitedWith,
    tags: initial.tags.map((t) => t.tag),
    isAnonymous: initial.is_anonymous,
  };
}

export default function DishReviewForm({
  dishId,
  resolveDishId,
  dishName,
  onSuccess,
  onCancel,
  cancelLabel,
  mode = 'create',
  reviewId,
  initial,
  submitLabel,
  currencyCode,
  previousReview,
}: DishReviewFormProps) {
  const t = useTranslations('restaurant.dishReviewForm');
  const isEdit = mode === 'edit';
  const effectiveCancelLabel = cancelLabel ?? t('cancel');

  const [editableDishName, setEditableDishName] = useState(dishName);
  const [body, setBody] = useState<ReviewFormBodyValue>(() => buildInitialValue(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedPrice = body.pricePaid.trim();
    let pricePaidParsed: number | undefined;
    if (trimmedPrice !== '') {
      const n = Number(trimmedPrice);
      if (!Number.isFinite(n) || n <= 0) {
        setError(t('priceInvalid'));
        return;
      }
      pricePaidParsed = n;
    }

    const trimmedDishName = (isEdit ? editableDishName : dishName).trim();
    if (isEdit && !trimmedDishName) {
      setError(t('dishNameRequired'));
      return;
    }

    setSubmitting(true);

    const prosFiltered = body.pros.map((p) => p.trim()).filter(Boolean);
    const consFiltered = body.cons.map((c) => c.trim()).filter(Boolean);
    const tagsFiltered = body.tags.map((t) => t.trim()).filter(Boolean);
    const visitedWithPayload = companyToVisitedWith(body.companyType, body.visitedWith);

    const altFor = (index: number, total: number) =>
      total > 1
        ? t('altPhotoIndexed', { index: index + 1, dish: trimmedDishName })
        : t('altPhotoSingle', { dish: trimmedDishName });

    try {
      if (isEdit) {
        if (!reviewId) throw new Error(t('errorMissingId'));

        const newUrls = await Promise.all(
          body.photos.map((photo, i) => uploadReviewPhoto(reviewId, photo.file, i)),
        );

        const keptExisting: { url: string; alt_text?: string }[] = body.existingImages.map((img) => ({
          url: img.url,
          alt_text: img.alt_text ?? undefined,
        }));
        const newOnes: { url: string; alt_text?: string }[] = newUrls.map((url) => ({ url }));
        const total = keptExisting.length + newOnes.length;
        const allImages = [...keptExisting, ...newOnes].map((img, i) => ({
          url: img.url,
          alt_text: img.alt_text ?? altFor(i, total),
          display_order: i,
        }));

        const dishNameChanged = trimmedDishName !== dishName.trim();
        const review = await updateReview(reviewId, {
          rating: body.rating,
          note: body.note,
          date_tasted: body.dateTasted,
          meal_period: body.mealPeriod ?? null,
          price_paid: pricePaidParsed ?? null,
          would_order_again: body.wouldOrderAgain ?? undefined,
          portion_size: body.portionSize || undefined,
          visited_with: visitedWithPayload,
          is_anonymous: body.isAnonymous,
          presentation: body.pillars.presentation ?? undefined,
          value_prop: body.pillars.value_prop ?? undefined,
          execution: body.pillars.execution ?? undefined,
          dish_name: dishNameChanged ? trimmedDishName : undefined,
          pros_cons: [
            ...prosFiltered.map((text) => ({ type: 'pro' as const, text })),
            ...consFiltered.map((text) => ({ type: 'con' as const, text })),
          ],
          tags: tagsFiltered.map((tag) => ({ tag })),
          images: allImages,
        });
        onSuccess(review, trimmedDishName);
        return;
      }

      const resolvedDishId = dishId ?? (await resolveDishId?.());
      if (!resolvedDishId) {
        throw new Error(t('errorMissingDish'));
      }

      const imageUrls = await Promise.all(
        body.photos.map((photo, i) => uploadReviewPhoto(resolvedDishId, photo.file, i)),
      );

      const review = await createReview(resolvedDishId, {
        rating: body.rating,
        note: body.note,
        date_tasted: body.dateTasted,
        meal_period: body.mealPeriod ?? undefined,
        price_paid: pricePaidParsed,
        would_order_again: body.wouldOrderAgain ?? undefined,
        portion_size: body.portionSize || undefined,
        visited_with: visitedWithPayload,
        is_anonymous: body.isAnonymous,
        presentation: body.pillars.presentation ?? undefined,
        value_prop: body.pillars.value_prop ?? undefined,
        execution: body.pillars.execution ?? undefined,
        pros_cons: [
          ...prosFiltered.map((text) => ({ type: 'pro' as const, text })),
          ...consFiltered.map((text) => ({ type: 'con' as const, text })),
        ],
        tags: tagsFiltered.map((tag) => ({ tag })),
        images: imageUrls.map((url, i) => ({
          url,
          alt_text: altFor(i, imageUrls.length),
          display_order: i,
        })),
      });
      onSuccess(review);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : t('errorGeneric'));
      } else {
        setError(isEdit ? t('errorSaveRetry') : t('errorSubmitRetry'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2.5 rounded-2xl border border-border-subtle bg-surface-page p-3 text-text-primary sm:gap-3 sm:p-4"
      aria-label={t('ariaLabel')}
    >
      {!isEdit && previousReview && (
        <PreviousReviewRecall
          review={previousReview}
          currencyCode={currencyCode ?? null}
        />
      )}

      {isEdit && (
        <div>
          <label
            htmlFor="review-dish-name"
            className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
          >
            {t('dishNameLabel')}
          </label>
          <input
            id="review-dish-name"
            type="text"
            className="w-full rounded-xl border border-border-subtle bg-surface-card px-3.5 py-2.5 font-sans text-base sm:text-sm text-text-primary placeholder:text-text-muted/80 transition-all focus:border-color-azafran focus:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-60"
            value={editableDishName}
            onChange={(e) => setEditableDishName(e.target.value)}
            placeholder={t('dishNamePlaceholder')}
            disabled={submitting}
            maxLength={200}
            required
          />
          <p className="mt-1 font-sans text-[11px] text-text-muted">
            {t('dishNameHelp')}
          </p>
        </div>
      )}

      <ReviewFormBody
        value={body}
        onChange={setBody}
        dishId={dishId}
        dishName={dishName}
        currencyCode={currencyCode}
        submitting={submitting}
      />

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-40"
        >
          {effectiveCancelLabel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-action-primary px-6 py-2.5 font-sans text-sm font-semibold text-text-inverse shadow-[var(--shadow-base)] transition-all hover:bg-action-primary-hover hover:shadow-[var(--shadow-media)] active:translate-y-[1px] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? (isEdit ? t('saving') : t('submitting'))
            : (submitLabel ?? (isEdit ? t('saveChanges') : t('publishReview')))}
        </button>
      </div>

      {error && (
        <p
          className="m-0 rounded-xl border border-color-paprika/30 bg-color-paprika-pale px-3 py-2 font-sans text-sm font-medium text-color-paprika"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}
