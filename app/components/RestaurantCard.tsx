'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import RatingPill from '@/app/components/ui/RatingPill';
import { cn } from '@/app/lib/utils/cn';

interface RestaurantCardProps {
  name: string;
  image: string | null;
  location: string;
  /** 0–5 score from `computed_rating`. Internally scaled to 0–10 for RatingPill. */
  rating: number;
  description: string;
  reviewCount: number;
  categoryLabel?: string;
  /** Editorial layout: full card with image + meta panel. When false, renders only the image tile. */
  showInfo?: boolean;
  hasReservation?: boolean;
}

export default function RestaurantCard({
  name,
  image,
  location,
  rating: ratingProp,
  description,
  reviewCount,
  categoryLabel,
  showInfo = false,
  hasReservation = false,
}: RestaurantCardProps) {
  const [imgError, setImgError] = useState(false);
  const rating = Number(ratingProp);
  const ratingOver10 = rating > 0 ? rating * 2 : null;
  const t = useTranslations('restaurantCard');
  const showImage = !!image && !imgError;

  const ImageTile = (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden bg-surface-subtle',
        showInfo ? 'rounded-t-2xl' : 'rounded-2xl',
      )}
    >
      {showImage ? (
        // Covers vienen de hosts heterogéneos (Google Places HTTP, sitios del
        // restaurante, uploads). next/image requeriría whitelist por host;
        // <img> + onError es la elección pragmática.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image as string}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-canela)] via-[var(--color-azafran)] to-[var(--color-azafran-light)]"
        >
          <span className="font-display text-6xl font-medium italic text-white/95 drop-shadow-sm sm:text-7xl">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Bottom gradient veil — refuerza legibilidad de los chips inferiores y de la transición */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
      />

      {categoryLabel && (
        <span
          className={cn(
            'absolute left-3 top-3 z-[5] inline-flex items-center rounded-full',
            'bg-white/95 px-2.5 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-wider text-action-primary',
            'shadow-sm backdrop-blur-sm',
          )}
        >
          {categoryLabel}
        </span>
      )}

      {ratingOver10 !== null && (
        <RatingPill
          value={ratingOver10}
          size="sm"
          className="absolute right-3 top-3 z-[5] shadow-sm"
        />
      )}

      {hasReservation && (
        <span
          className={cn(
            'absolute bottom-3 left-3 z-[5] inline-flex items-center gap-1.5 rounded-full',
            'bg-[var(--color-albahaca)] px-2.5 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-wider text-white',
            'shadow-sm',
          )}
        >
          <FontAwesomeIcon icon={faCalendarCheck} className="h-2.5 w-2.5" aria-hidden />
          {t('onlineReservation')}
        </span>
      )}
    </div>
  );

  if (!showInfo) {
    return <div className="group block">{ImageTile}</div>;
  }

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card',
        'shadow-[0_2px_8px_rgba(26,23,20,0.06)] transition-shadow duration-[var(--duration-standard)]',
        'hover:shadow-[var(--shadow-elevated)]',
      )}
    >
      {ImageTile}

      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
        <h3 className="m-0 font-display text-xl font-medium leading-snug text-text-primary line-clamp-2 sm:text-[1.375rem]">
          {name}
        </h3>

        {location && (
          <p className="m-0 font-sans text-xs uppercase tracking-[0.14em] text-text-muted line-clamp-1">
            {location}
          </p>
        )}

        {description && (
          <p className="m-0 font-sans text-sm leading-relaxed text-text-secondary line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
          <span className="font-sans text-xs text-text-muted">
            {t('reviewCount', { count: reviewCount })}
          </span>
          <span
            aria-hidden
            className="font-sans text-sm font-medium text-action-primary transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </div>
      </div>
    </article>
  );
}
