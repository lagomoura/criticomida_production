'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
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
  /** ISO 4217 del restaurante. Se propaga al form inline de review. */
  currencyCode?: string | null;
}

export default function DishChecklist({
  items,
  currentUserId,
  onReviewAdded,
  currencyCode = null,
}: DishChecklistProps) {
  const { user } = useAuthContext();
  const t = useTranslations('restaurant.checklist');

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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="dish-checklist-heading"
            className="font-display text-xl font-medium text-[var(--color-carbon)] sm:text-2xl"
          >
            {t('heading')}
          </h2>
          {items.length > 0 && (
            <p className="mt-0.5 text-sm text-text-muted">
              {items.length === 1
                ? t('countOne', { count: items.length })
                : t('countMany', { count: items.length })}
              {currentUserId && reviewedCount > 0 && (
                <span className="ml-1 font-semibold text-[var(--color-albahaca)]">
                  {reviewedCount === 1
                    ? t('reviewedByYou', { count: reviewedCount })
                    : t('reviewedByYouMany', { count: reviewedCount })}
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
                'flex items-center gap-2 rounded-xl border-2 border-[var(--color-azafran)] ' +
                'bg-[var(--color-azafran)] px-4 py-2 text-sm font-semibold text-[var(--color-carbon)] ' +
                'transition-colors hover:bg-[var(--color-canela)] hover:text-white hover:border-[var(--color-canela)]'
              }
            >
              <span aria-hidden className="text-base leading-none">★</span>
              {t('publishReview')}
            </button>
            <button
              type="button"
              onClick={dispatchAddDish}
              className={
                'flex items-center gap-2 rounded-xl border-2 border-[var(--color-azafran)] ' +
                'bg-surface-card px-4 py-2 text-sm font-semibold text-[var(--color-azafran)] ' +
                'transition-colors hover:bg-[var(--color-azafran-pale)]'
              }
            >
              <span aria-hidden className="text-base leading-none">+</span>
              {t('addDish')}
            </button>
          </div>
        )}
      </div>

      {user && currentUserId && items.length > 0 && (
        <div
          className="mb-4 overflow-hidden rounded-full bg-[var(--color-crema-dark)]"
          role="progressbar"
          aria-valuenow={reviewedCount}
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-label={t('progressLabel', { reviewed: reviewedCount, total: items.length })}
        >
          <div
            className="h-2 rounded-full bg-[var(--color-albahaca)] motion-safe:transition-all motion-safe:duration-500"
            style={{ width: `${(reviewedCount / items.length) * 100}%` }}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-default py-12 text-center">
          <p className="text-4xl" aria-hidden>🍽️</p>
          <h3 className="mt-2 font-semibold text-text-primary">{t('emptyTitle')}</h3>
          <p className="mt-1 text-sm text-text-muted">
            {user ? t('emptyAuth') : t('emptyAnon')}
          </p>
          {user && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={dispatchPublishReview}
                className={
                  'rounded-xl border-2 border-[var(--color-azafran)] bg-[var(--color-azafran)] px-5 py-2.5 ' +
                  'font-semibold text-[var(--color-carbon)] transition hover:opacity-90'
                }
              >
                {t('publishFirstReview')}
              </button>
              <button
                type="button"
                onClick={dispatchAddDish}
                className={
                  'rounded-xl border-2 border-[var(--color-azafran)] bg-surface-card px-5 py-2.5 ' +
                  'font-semibold text-[var(--color-azafran)] transition-colors ' +
                  'hover:bg-[var(--color-azafran-pale)]'
                }
              >
                {t('addDish')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3" aria-label={t('listLabel')}>
          {items.map(({ dish, reviews }) => (
            <DishChecklistItem
              key={dish.id}
              dish={dish}
              reviews={reviews}
              currentUserId={currentUserId}
              onReviewAdded={onReviewAdded}
              currencyCode={currencyCode}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
