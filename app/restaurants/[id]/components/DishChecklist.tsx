'use client';

import React from 'react';
import { Dish, DishReview } from '@/app/lib/types';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import DishChecklistItem from './DishChecklistItem';

interface DishWithReviews {
  dish: Dish;
  reviews: DishReview[];
}

interface DishChecklistProps {
  items: DishWithReviews[];
  currentUserId: string | null;
  onReviewAdded: (dishId: string, review: DishReview) => void;
}

export default function DishChecklist({
  items,
  currentUserId,
  onReviewAdded,
}: DishChecklistProps) {
  const { user } = useAuthContext();

  function dispatchAddDish() {
    window.dispatchEvent(new CustomEvent('cc:add-dish'));
  }
  function dispatchPublishReview() {
    window.dispatchEvent(new CustomEvent('cc:publish-review'));
  }

  const reviewedCount = currentUserId
    ? items.filter(({ reviews }) =>
        reviews.some(r => r.user_id === currentUserId)
      ).length
    : 0;

  return (
    <section aria-labelledby="dish-checklist-heading" className="mb-8">
      {/* Section header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="dish-checklist-heading"
            className="text-xl font-bold text-neutral-900 sm:text-2xl"
          >
            Platos del menú
          </h2>
          {items.length > 0 && (
            <p className="mt-0.5 text-sm text-neutral-500">
              {items.length} {items.length === 1 ? 'plato' : 'platos'}
              {currentUserId && reviewedCount > 0 && (
                <span className="ml-1 font-semibold text-emerald-600">
                  · {reviewedCount} revisado{reviewedCount !== 1 ? 's' : ''} por vos
                </span>
              )}
            </p>
          )}
        </div>
        {user && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={dispatchPublishReview}
              className={
                'flex items-center gap-2 rounded-xl border-2 border-[var(--mainPink)] ' +
                'bg-[var(--mainPink)] px-4 py-2 text-sm font-semibold text-white ' +
                'transition-colors hover:opacity-90'
              }
            >
              <span aria-hidden className="text-base leading-none">★</span>
              Publicar reseña
            </button>
            <button
              type="button"
              onClick={dispatchAddDish}
              className={
                'flex items-center gap-2 rounded-xl border-2 border-[var(--mainPink)] ' +
                'bg-white px-4 py-2 text-sm font-semibold text-[var(--mainPink)] ' +
                'transition-colors hover:bg-pink-50'
              }
            >
              <span aria-hidden className="text-base leading-none">+</span>
              Agregar plato
            </button>
          </div>
        )}
      </div>

      {/* Progress bar — only when user is logged in and there are dishes */}
      {user && currentUserId && items.length > 0 && (
        <div
          className="mb-4 overflow-hidden rounded-full bg-neutral-100"
          role="progressbar"
          aria-valuenow={reviewedCount}
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-label={`${reviewedCount} de ${items.length} platos revisados`}
        >
          <div
            className="h-2 rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${(reviewedCount / items.length) * 100}%` }}
          />
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-12 text-center">
          <p className="text-4xl" aria-hidden>🍽️</p>
          <h3 className="mt-2 font-semibold text-neutral-700">Sin platos registrados</h3>
          <p className="mt-1 text-sm text-neutral-500">
            {user
              ? 'Sé el primero en agregar un plato a este menú.'
              : 'Todavía no hay platos en el menú de este restaurante.'}
          </p>
          {user && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={dispatchPublishReview}
                className={
                  'rounded-xl border-2 border-[var(--mainPink)] bg-[var(--mainPink)] px-5 py-2.5 ' +
                  'font-semibold text-white transition hover:opacity-90'
                }
              >
                Publicar primera reseña
              </button>
              <button
                type="button"
                onClick={dispatchAddDish}
                className={
                  'rounded-xl border-2 border-[var(--mainPink)] bg-white px-5 py-2.5 ' +
                  'font-semibold text-[var(--mainPink)] transition-colors ' +
                  'hover:bg-pink-50'
                }
              >
                Agregar plato
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Lista de platos">
          {items.map(({ dish, reviews }) => (
            <DishChecklistItem
              key={dish.id}
              dish={dish}
              reviews={reviews}
              currentUserId={currentUserId}
              onReviewAdded={onReviewAdded}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
