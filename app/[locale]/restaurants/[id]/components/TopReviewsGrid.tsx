'use client';

import React from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import { Dish, DishReview } from '@/app/lib/types';
import StarRating from './StarRating';

interface DishWithReviews {
  dish: Dish;
  reviews: DishReview[];
}

interface TopReviewsGridProps {
  items: DishWithReviews[];
}

const FALLBACK = '/img/food-fallback.jpg';
const TOP_N = 8;

function relevanceScore(review: DishReview, dish: Dish): number {
  let score = review.rating * 10;
  if (review.note?.trim().length > 30) score += 5;
  if (review.pros_cons?.length > 0) score += 3;
  // Imagen propia de la reseña pesa más que el cover del plato:
  // refleja la experiencia real del crítico.
  if (review.images?.length > 0) score += 4;
  if (dish.cover_image_url) score += 2;
  return score;
}

export default function TopReviewsGrid({ items }: TopReviewsGridProps) {
  const t = useTranslations('restaurant.topReviews');
  const candidates = items.flatMap(({ dish, reviews }) =>
    reviews
      .filter((r) => r.note?.trim())
      .map((r) => ({ review: r, dish }))
  );

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => relevanceScore(b.review, b.dish) - relevanceScore(a.review, a.dish));
  const top = candidates.slice(0, TOP_N);

  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-2xl font-medium text-[var(--color-carbon)]">
        {t('title')}
        <span className="ml-2 font-sans text-base font-normal text-text-muted">
          {t('topN', { count: top.length })}
        </span>
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {top.map(({ review, dish }) => (
          <ReviewCard key={review.id} review={review} dish={dish} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review, dish }: { review: DishReview; dish: Dish }) {
  const t = useTranslations('restaurant.topReviews');
  const locale = useLocale();
  // Preferimos la foto que el crítico subió en la reseña: representa lo que
  // efectivamente comió. Si no hay, caemos al cover del plato y por último
  // al mock genérico.
  const reviewImage = [...review.images]
    .sort((a, b) => a.display_order - b.display_order)
    .find((img) => !!img.url);
  const photoUrl = reviewImage?.url || dish.cover_image_url || FALLBACK;
  const altText = reviewImage?.alt_text || dish.name;

  return (
    <Link
      href={`/reviews/${review.id}`}
      aria-label={t('cardAria', { dish: dish.name, author: review.user_display_name ?? t('anonymous') })}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--color-crema-dark)] shadow-sm no-underline transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-azafran)] focus-visible:ring-offset-2"
    >
      <Image
        src={photoUrl}
        alt={altText}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="mb-1 flex items-center gap-1.5">
          <StarRating value={review.rating} readonly size="sm" />
          {review.would_order_again === true && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
              {t('wouldOrderAgain')}
            </span>
          )}
        </div>

        <p className="truncate text-sm font-bold leading-tight text-white">
          {dish.name}
        </p>

        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/80">
          &ldquo;{review.note}&rdquo;
        </p>

        <p className="mt-1.5 text-[10px] text-white/60">
          {review.user_display_name ?? t('anonymous')}
          {' · '}
          {new Date(review.date_tasted).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  );
}
