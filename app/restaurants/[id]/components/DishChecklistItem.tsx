'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dish, DishReview } from '@/app/lib/types';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import StarRating from './StarRating';
import DishReviewForm from './DishReviewForm';

interface DishChecklistItemProps {
  dish: Dish;
  reviews: DishReview[];
  currentUserId: string | null;
  onReviewAdded: (dishId: string, review: DishReview) => void;
}

export default function DishChecklistItem({
  dish,
  reviews,
  currentUserId,
  onReviewAdded,
}: DishChecklistItemProps) {
  const { user } = useAuthContext();
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imgError, setImgError] = useState(false);

  const userReview = currentUserId
    ? reviews.find(r => r.user_id === currentUserId)
    : null;
  const hasReviewed = !!userReview;

  const imageSrc =
    !imgError && dish.cover_image_url ? dish.cover_image_url : '/img/food-fallback.jpg';

  const displayRating = Number(dish.computed_rating);
  const reviewCount = dish.review_count;

  function handleReviewSuccess(review: DishReview) {
    onReviewAdded(dish.id, review);
    setShowForm(false);
    setExpanded(true);
  }

  const portionLabels: Record<string, string> = {
    small: 'Pequeña',
    medium: 'Mediana',
    large: 'Grande',
  };

  return (
    <li
      className={
        'overflow-hidden rounded-xl border transition-shadow duration-200 ' +
        (hasReviewed
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-neutral-200 bg-white')
      }
      aria-label={`Plato: ${dish.name}`}
    >
      {/* Summary row — always visible */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-amber-50 sm:h-20 sm:w-20">
          <Image
            src={imageSrc}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-1">
            <h3 className="text-base font-semibold leading-tight text-neutral-900 sm:text-lg">
              {dish.name}
            </h3>
            {/* Reviewed badge */}
            {hasReviewed && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Revisado
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
              <span className="italic text-neutral-400">Sin calificaciones aún</span>
            )}
            {reviewCount > 0 && (
              <span className="text-neutral-400">
                · {reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}
              </span>
            )}
            {dish.price_tier && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                {dish.price_tier}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          {user && !hasReviewed && !showForm && (
            <button
              type="button"
              onClick={() => { setShowForm(true); setExpanded(true); }}
              className={
                'rounded-lg border-2 border-[var(--mainPink)] bg-white px-3 py-1.5 ' +
                'text-xs font-semibold text-[var(--mainPink)] transition-colors ' +
                'hover:bg-[var(--mainPink)] hover:text-white sm:text-sm'
              }
            >
              Reseñar
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
              {expanded ? 'Ocultar' : 'Ver reseñas'}
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

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-neutral-100 px-3 pb-4 pt-3 sm:px-4">
          {/* Inline review form */}
          {showForm && user && !hasReviewed && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-neutral-700">Tu reseña de {dish.name}</p>
              <DishReviewForm
                dishId={dish.id}
                onSuccess={handleReviewSuccess}
                onCancel={() => { setShowForm(false); }}
              />
            </div>
          )}

          {/* Existing reviews */}
          {reviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => {
                const pros = review.pros_cons.filter(pc => pc.type === 'pro');
                const cons = review.pros_cons.filter(pc => pc.type === 'con');
                const date = new Date(review.date_tasted).toLocaleDateString('es-AR', {
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
                    {/* Review header */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-800">
                        {review.user_display_name ?? 'Anónimo'}
                      </span>
                      {isOwn && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Tu reseña
                        </span>
                      )}
                      <StarRating value={review.rating} readonly size="sm" />
                      <span className="ml-auto text-xs text-neutral-400">{date}</span>
                    </div>

                    {/* Would order again + portion */}
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
                          {review.would_order_again ? 'Lo pediría de nuevo' : 'No lo pediría de nuevo'}
                        </span>
                      )}
                      {review.portion_size && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          Porción {portionLabels[review.portion_size] ?? review.portion_size}
                        </span>
                      )}
                      {review.visited_with && (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                          Con {review.visited_with}
                        </span>
                      )}
                    </div>

                    {/* Note */}
                    {review.note && (
                      <p className="mb-2 text-sm leading-relaxed text-neutral-700">
                        {review.note}
                      </p>
                    )}

                    {/* Pros / Cons */}
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

                    {/* Tags */}
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

                    {/* Review images */}
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
                Todavía no hay reseñas para este plato.
              </p>
            )
          )}

          {/* Show "write review" CTA if authenticated and hasn't reviewed yet, form not open */}
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
              Sé el primero en reseñar
            </button>
          )}
        </div>
      )}
    </li>
  );
}
