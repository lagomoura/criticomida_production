'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/app/lib/i18n/navigation';
import { formatCurrency } from '@/app/lib/utils/currency';
import StarRating from './StarRating';
import type { DishReview } from '@/app/lib/types';

interface PreviousReviewRecallProps {
  /** Última review del usuario sobre este plato (la más reciente por
   * `created_at`). Puede ser cualquier review previa, no se exige misma
   * fecha de tasting. */
  review: DishReview;
  currencyCode: string | null;
}

/**
 * Panel colapsable mostrado dentro de DishReviewForm cuando el usuario está
 * por reseñar un plato que ya reseñó antes. No bloquea — sólo recuerda
 * qué dijo la última vez para reducir la fricción de "¿qué cambió?".
 */
export default function PreviousReviewRecall({
  review,
  currencyCode,
}: PreviousReviewRecallProps) {
  const t = useTranslations('restaurant.previousReviewRecall');
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const dateLabel = formatDate(review.date_tasted, locale);

  return (
    <section
      className="rounded-2xl border border-color-azafran/30 bg-color-azafran-pale/40 p-3 sm:p-4"
      aria-label={t('regionLabel')}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] rounded-xl"
      >
        <FontAwesomeIcon
          icon={faClockRotateLeft}
          className="text-[color:var(--color-azafran)] h-4 w-4 shrink-0"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.16em] text-color-canela">
            {t('kicker')}
          </span>
          <span className="truncate font-sans text-sm text-text-primary">
            {t('headerLabel', { rating: review.rating.toFixed(1), date: dateLabel })}
          </span>
        </div>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={
            'h-3 w-3 shrink-0 text-text-muted transition-transform ' +
            (open ? 'rotate-180' : 'rotate-0')
          }
          aria-hidden
        />
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2 border-t border-color-azafran/20 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <StarRating value={Math.round(review.rating)} readonly size="sm" />
            <span className="font-display text-lg font-medium tabular-nums text-text-primary">
              {review.rating.toFixed(1)}
            </span>
            {review.price_paid != null && (
              <span className="font-sans text-xs text-text-muted">
                {t('priceLabel', {
                  price: formatCurrency(review.price_paid, currencyCode, locale),
                })}
              </span>
            )}
          </div>

          {review.note.trim() && (
            <p className="m-0 font-sans text-sm leading-relaxed text-text-secondary">
              {review.note.trim()}
            </p>
          )}

          <button
            type="button"
            onClick={() => router.push(`/reviews/${review.id}`)}
            className="self-start cursor-pointer rounded-full font-sans text-xs font-semibold text-color-canela hover:text-color-azafran focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {t('viewFullReview')} →
          </button>

          <p className="m-0 font-sans text-[11px] italic text-text-muted">
            {t('whatChangedHint')}
          </p>
        </div>
      )}
    </section>
  );
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
