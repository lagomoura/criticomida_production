'use client';

import Link from 'next/link';
import Image from 'next/image';
import { RestaurantDetail } from '@/app/lib/types';
import StarRating from './StarRating';

interface RestaurantHeroProps {
  restaurant: RestaurantDetail;
  dishCount: number;
  backHref: string;
  backLabel: string;
}

export default function RestaurantHero({
  restaurant,
  dishCount,
  backHref,
  backLabel,
}: RestaurantHeroProps) {
  const hasCover = !!restaurant.cover_image_url;

  return (
    <div className="mb-6">
      {/* Cover image band */}
      {hasCover && (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl bg-neutral-100 sm:h-64">
          <Image
            src={restaurant.cover_image_url!}
            alt={`Foto de ${restaurant.name}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
          {/* Gradient overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Back button over image */}
          <Link
            href={backHref}
            className={
              'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-xl ' +
              'bg-white/90 px-3 py-1.5 text-sm font-semibold text-neutral-800 ' +
              'no-underline backdrop-blur-sm transition-colors hover:bg-white'
            }
          >
            <span aria-hidden className="text-base leading-none">←</span>
            {backLabel}
          </Link>
        </div>
      )}

      {/* When no cover: inline back button */}
      {!hasCover && (
        <Link
          href={backHref}
          className={
            'mb-3 inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 ' +
            'bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 no-underline ' +
            'transition-colors hover:bg-neutral-50'
          }
        >
          <span aria-hidden className="text-base leading-none">←</span>
          Volver a {backLabel}
        </Link>
      )}

      {/* Name + meta row */}
      <div className="flex flex-col gap-2">
        {restaurant.category && (
          <span className="w-fit rounded-full bg-[var(--mainPink)] px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
            {restaurant.category.name}
          </span>
        )}
        <h1 className="text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
          {restaurant.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-neutral-600">
          <span className="flex items-center gap-1">
            <span aria-hidden>📍</span>
            {restaurant.location_name}
          </span>
          {Number(restaurant.computed_rating) > 0 && (
            <span className="flex items-center gap-1.5">
              <StarRating value={Math.round(Number(restaurant.computed_rating))} readonly size="sm" />
              <span className="font-semibold text-neutral-800">
                {Number(restaurant.computed_rating).toFixed(1)}
              </span>
            </span>
          )}
          <span className="text-neutral-400">
            {restaurant.review_count} {restaurant.review_count === 1 ? 'reseña' : 'reseñas'}
          </span>
          {dishCount > 0 && (
            <span className="text-neutral-400">
              · {dishCount} {dishCount === 1 ? 'plato' : 'platos'}
            </span>
          )}
        </div>
        {restaurant.description && (
          <p className="mt-1 text-base leading-relaxed text-neutral-600">
            {restaurant.description}
          </p>
        )}
      </div>
    </div>
  );
}
