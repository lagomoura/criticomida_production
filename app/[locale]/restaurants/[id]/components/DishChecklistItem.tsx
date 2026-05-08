'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import { Dish, DishReview } from '@/app/lib/types';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import StarRating from './StarRating';
import DishReviewForm from './DishReviewForm';

interface DishChecklistItemProps {
  dish: Dish;
  reviews: DishReview[];
  currentUserId: string | null;
  onReviewAdded: (dishId: string, review: DishReview) => void;
  /** ISO 4217 del restaurante (heredado por el form de review inline). */
  currencyCode?: string | null;
}

export default function DishChecklistItem({
  dish,
  reviews,
  currentUserId,
  onReviewAdded,
  currencyCode = null,
}: DishChecklistItemProps) {
  const { user } = useAuthContext();
  const t = useTranslations('restaurant.checklistItem');
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Última review del usuario por `created_at` — para multi-review queremos
  // recordar la más reciente, no una cualquiera.
  const userReview = currentUserId
    ? reviews
        .filter((r) => r.user_id === currentUserId)
        .reduce<DishReview | null>(
          (latest, r) =>
            !latest || r.created_at > latest.created_at ? r : latest,
          null,
        )
    : null;
  const hasReviewed = !!userReview;

  // Fallback en cascada: cover oficial del plato → primera imagen de la
  // review más reciente que tenga fotos → mock genérico. Así un plato sin
  // cover asignado pero con reseñas con fotos muestra una imagen real.
  const reviewCover = [...reviews]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .flatMap((r) =>
      [...r.images].sort((a, b) => a.display_order - b.display_order),
    )
    .find((img) => !!img.url)?.url;
  const resolvedCover = dish.cover_image_url || reviewCover || null;
  const imageSrc = !imgError && resolvedCover ? resolvedCover : '/img/food-fallback.jpg';
  const dishHref = `/dishes/${dish.id}`;

  const displayRating = Number(dish.computed_rating);
  const reviewCount = dish.review_count;

  function handleReviewSuccess(review: DishReview) {
    onReviewAdded(dish.id, review);
    setShowForm(false);
    setExpanded(true);
  }

  const portionLabels: Record<string, string> = {
    small: t('portionSmall'),
    medium: t('portionMedium'),
    large: t('portionLarge'),
  };

  return (
    <li
      className={
        'overflow-hidden rounded-xl border transition-shadow duration-200 ' +
        (hasReviewed
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-neutral-200 bg-white')
      }
      aria-label={t('ariaLabel', { name: dish.name })}
    >
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <Link
          href={dishHref}
          aria-label={t('viewDishAria', { name: dish.name })}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-amber-50 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mainPink)] focus-visible:ring-offset-2 sm:h-20 sm:w-20"
        >
          <Image
            src={imageSrc}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImgError(true)}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-1">
            <Link
              href={dishHref}
              className="group/title text-base font-semibold leading-tight text-neutral-900 no-underline hover:text-[var(--mainPink)] focus-visible:outline-none focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4 sm:text-lg"
            >
              <h3 className="inline">{dish.name}</h3>
            </Link>
            {hasReviewed && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {t('reviewed')}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
            {displayRating > 0 ? (
              <>
                <StarRating value={Math.round(displayRating)} readonly size="sm" />
                <span className="font-medium text-neutral-800">{displayRating.toFixed(1)}</span>
              </>
            ) : (
              <span className="italic text-neutral-400">{t('noRatings')}</span>
            )}
            {reviewCount > 0 && (
              <span className="text-neutral-400">
                · {reviewCount === 1
                  ? t('reviewOne', { count: reviewCount })
                  : t('reviewMany', { count: reviewCount })}
              </span>
            )}
            {dish.price_tier && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                {dish.price_tier}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          {user && !showForm && (
            <button
              type="button"
              onClick={() => { setShowForm(true); setExpanded(true); }}
              className={
                'rounded-lg border-2 border-[var(--mainPink)] bg-white px-3 py-1.5 ' +
                'text-xs font-semibold text-[var(--mainPink)] transition-colors ' +
                'hover:bg-[var(--mainPink)] hover:text-white sm:text-sm'
              }
            >
              {hasReviewed ? t('reviewAgain') : t('review')}
            </button>
          )}
          {reviews.length > 0 && (
            <button
              type="button"
              onClick={() => { setExpanded(e => !e); setShowForm(false); }}
              aria-expanded={expanded}
              className={
                'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ' +
                'text-neutral-600 transition-colors hover:bg-neutral-100 sm:text-sm'
              }
            >
              {expanded ? t('hide') : t('viewReviews')}
              <span
                aria-hidden
                className={
                  'inline-block transition-transform duration-200 ' +
                  (expanded ? 'rotate-180' : 'rotate-0')
                }
              >
                ▾
              </span>
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-neutral-100 px-3 pb-4 pt-3 sm:px-4">
          {showForm && user && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-neutral-700">
                {hasReviewed
                  ? t('newReviewOf', { name: dish.name })
                  : t('yourReviewOf', { name: dish.name })}
              </p>
              <DishReviewForm
                dishId={dish.id}
                dishName={dish.name}
                currencyCode={currencyCode}
                previousReview={userReview}
                onSuccess={handleReviewSuccess}
                onCancel={() => { setShowForm(false); }}
              />
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => {
                const pros = review.pros_cons.filter(pc => pc.type === 'pro');
                const cons = review.pros_cons.filter(pc => pc.type === 'con');
                const date = new Date(review.date_tasted).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                const isOwn = review.user_id === currentUserId;

                return (
                  <div
                    key={review.id}
                    className={
                      'rounded-xl border p-3 sm:p-4 ' +
                      (isOwn
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-neutral-100 bg-neutral-50')
                    }
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-800">
                        {review.user_display_name ?? t('anonymous')}
                      </span>
                      {isOwn && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          {t('yourReviewBadge')}
                        </span>
                      )}
                      <StarRating value={review.rating} readonly size="sm" />
                      <span className="ml-auto text-xs text-neutral-400">{date}</span>
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
                      {review.would_order_again !== null && (
                        <span
                          className={
                            'rounded-full px-2.5 py-0.5 text-xs font-semibold ' +
                            (review.would_order_again
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700')
                          }
                        >
                          {review.would_order_again ? t('wouldOrderAgain') : t('wouldNotOrderAgain')}
                        </span>
                      )}
                      {review.portion_size && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          {t('portion', { label: portionLabels[review.portion_size] ?? review.portion_size })}
                        </span>
                      )}
                      {review.visited_with && (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                          {t('with', { name: review.visited_with })}
                        </span>
                      )}
                    </div>

                    {review.note && (
                      <p className="mb-2 text-sm leading-relaxed text-neutral-700">
                        {review.note}
                      </p>
                    )}

                    {(pros.length > 0 || cons.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {pros.map(pc => (
                          <span
                            key={pc.id}
                            className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          >
                            + {pc.text}
                          </span>
                        ))}
                        {cons.map(pc => (
                          <span
                            key={pc.id}
                            className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800"
                          >
                            - {pc.text}
                          </span>
                        ))}
                      </div>
                    )}

                    {review.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {review.tags.map(tag => (
                          <span
                            key={tag.id}
                            className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                          >
                            {tag.tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {review.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.images
                          .sort((a, b) => a.display_order - b.display_order)
                          .map(img => (
                            <div
                              key={img.id}
                              className="relative h-20 w-20 overflow-hidden rounded-lg"
                            >
                              <Image
                                src={img.url}
                                alt={img.alt_text ?? dish.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            !showForm && (
              <p className="text-sm italic text-neutral-400">
                {t('noReviewsYet')}
              </p>
            )
          )}

          {user && !hasReviewed && !showForm && reviews.length === 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={
                'mt-2 rounded-lg border-2 border-[var(--mainPink)] bg-white px-4 py-2 ' +
                'text-sm font-semibold text-[var(--mainPink)] transition-colors ' +
                'hover:bg-[var(--mainPink)] hover:text-white'
              }
            >
              {t('beFirst')}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
