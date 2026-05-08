'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Show the numeric value in Cormorant beside the stars. Only meaningful
   * when interactive (ignored when readonly). Default false. */
  showValue?: boolean;
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-3xl',
};

/** Interactive or display-only star picker (1–5). */
export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
}: StarRatingProps) {
  const t = useTranslations('restaurant.starRating');
  const [hovered, setHovered] = useState(0);
  const effective = hovered || value;

  // Padding only when interactive: bumps each tap target above 44px on mobile
  // without expanding the visual footprint of the read-only display variant.
  const paddingClass = readonly ? 'p-0' : 'p-1';

  const showNumericValue = showValue && !readonly && value > 0;

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-flex ${readonly ? 'gap-0.5' : 'gap-0'} ${sizeClasses[size]}`}
        aria-label={t('ariaValue', { value })}
        role={readonly ? 'img' : 'group'}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            aria-label={readonly ? undefined : t('starsAria', { count: star })}
            className={
              'leading-none transition-transform duration-100 ' +
              (readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110') +
              ' disabled:pointer-events-none bg-transparent border-none ' + paddingClass +
              ' focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] rounded'
            }
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
          >
            <span
              aria-hidden
              className={
                star <= effective
                  ? 'text-action-highlight'
                  : 'text-border-default'
              }
            >
              ★
            </span>
          </button>
        ))}
      </span>
      {showNumericValue && (
        <span
          aria-hidden
          className="font-display text-2xl tabular-nums leading-none text-text-primary"
        >
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}
