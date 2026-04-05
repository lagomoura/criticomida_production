'use client';

import React from 'react';
import Image from 'next/image';
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
  if (dish.cover_image_url) score += 2;
  return score;
}

export default function TopReviewsGrid({ items }: TopReviewsGridProps) {
  // Flatten and score all reviews
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
      <h2 className="mb-4 text-xl font-bold text-neutral-900">
        Destacados del restaurante
        <span className="ml-2 text-base font-normal text-neutral-400">
          Top {top.length}
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
  const photoUrl = dish.cover_image_url || FALLBACK;

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
      {/* Photo */}
      <Image
        src={photoUrl}
        alt={dish.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay — always visible at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Review info — bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {/* Stars + would order again */}
        <div className="mb-1 flex items-center gap-1.5">
          <StarRating value={review.rating} readonly size="sm" />
          {review.would_order_again === true && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
              Lo volvería a pedir
            </span>
          )}
        </div>

        {/* Dish name */}
        <p className="truncate text-sm font-bold leading-tight text-white">
          {dish.name}
        </p>

        {/* Review note */}
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/80">
          &ldquo;{review.note}&rdquo;
        </p>

        {/* User + date */}
        <p className="mt-1.5 text-[10px] text-white/60">
          {review.user_display_name ?? 'Anónimo'}
          {' · '}
          {new Date(review.date_tasted).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
