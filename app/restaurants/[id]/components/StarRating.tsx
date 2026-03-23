'use client';

import React, { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
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
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const effective = hovered || value;

  return (
    <span
      className={`inline-flex gap-0.5 ${sizeClasses[size]}`}
      aria-label={`${value} de 5 estrellas`}
      role={readonly ? 'img' : 'group'}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          aria-label={readonly ? undefined : `${star} estrellas`}
          className={
            'leading-none transition-transform duration-100 ' +
            (readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110') +
            ' disabled:pointer-events-none bg-transparent border-none p-0'
          }
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
        >
          <span
            aria-hidden
            className={
              star <= effective
                ? 'text-amber-400'
                : 'text-neutral-300'
            }
          >
            ★
          </span>
        </button>
      ))}
    </span>
  );
}
