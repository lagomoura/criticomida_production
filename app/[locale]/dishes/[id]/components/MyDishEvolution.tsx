'use client';

import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faMinus,
  faClockRotateLeft,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/app/lib/i18n/navigation';
import { cn } from '@/app/lib/utils/cn';
import { formatCurrency } from '@/app/lib/utils/currency';
import StarRating from '@/app/[locale]/restaurants/[id]/components/StarRating';
import type { DishReview, PillarScore } from '@/app/lib/types';

interface MyDishEvolutionProps {
  /** Reviews del usuario sobre este plato, ordenadas ASC por `date_tasted`,
   * con un único entry por día (la última edición del día gana). */
  myReviews: DishReview[];
  dishName: string;
  /** ISO 4217 heredado del restaurante. Null cuando no se conoce. */
  currencyCode: string | null;
}

interface VisitEntry {
  review: DishReview;
  /** Diferencia con la visita inmediatamente anterior. */
  deltaRating: number | null;
  deltaPrice: number | null;
  deltaPresentation: number | null;
  deltaValueProp: number | null;
  deltaExecution: number | null;
}

const PILLAR_LABELS = {
  presentation: 'pillarPresentation',
  value_prop: 'pillarValue',
  execution: 'pillarExecution',
} as const;

export default function MyDishEvolution({
  myReviews,
  dishName,
  currencyCode,
}: MyDishEvolutionProps) {
  const t = useTranslations('dish.myEvolution');
  const locale = useLocale();

  const visits = useMemo<VisitEntry[]>(
    () =>
      myReviews.map((review, idx) => {
        const prev = idx > 0 ? myReviews[idx - 1] : null;
        return {
          review,
          deltaRating:
            prev != null ? round1(review.rating - prev.rating) : null,
          deltaPrice:
            prev != null && prev.price_paid != null && review.price_paid != null
              ? Math.round(review.price_paid - prev.price_paid)
              : null,
          deltaPresentation: pillarDelta(review.presentation, prev?.presentation),
          deltaValueProp: pillarDelta(review.value_prop, prev?.value_prop),
          deltaExecution: pillarDelta(review.execution, prev?.execution),
        };
      }),
    [myReviews],
  );

  if (visits.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="my-evolution-heading"
      className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6"
    >
      <header className="flex items-baseline gap-3">
        <FontAwesomeIcon
          icon={faClockRotateLeft}
          className="text-[color:var(--color-azafran)] text-[1rem]"
          aria-hidden
        />
        <div>
          <h2
            id="my-evolution-heading"
            className="m-0 font-display text-xl font-medium leading-tight text-text-primary sm:text-2xl"
          >
            {t('headingTitle')}
          </h2>
          <p className="mt-1 font-sans text-xs uppercase tracking-[0.16em] text-text-muted">
            {t('headingSubtitle', { dish: dishName })}
          </p>
        </div>
      </header>

      {visits.length === 1 ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="m-0 font-display italic text-base leading-relaxed text-text-secondary">
            {t('singleVisitMessage', { dish: dishName })}
          </p>
          <VisitCard
            visit={visits[0]}
            visitNumber={1}
            currencyCode={currencyCode}
            locale={locale}
          />
        </div>
      ) : (
        <ol className="mt-5 grid grid-flow-col auto-cols-[minmax(13rem,1fr)] gap-3 overflow-x-auto pb-2">
          {visits.map((visit, idx) => (
            <li key={visit.review.id}>
              <VisitCard
                visit={visit}
                visitNumber={idx + 1}
                currencyCode={currencyCode}
                locale={locale}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function VisitCard({
  visit,
  visitNumber,
  currencyCode,
  locale,
}: {
  visit: VisitEntry;
  visitNumber: number;
  currencyCode: string | null;
  locale: string;
}) {
  const t = useTranslations('dish.myEvolution');
  const router = useRouter();
  const [noteExpanded, setNoteExpanded] = useState(false);
  const { review, deltaRating, deltaPrice } = visit;
  const isFirst = visitNumber === 1;

  const dateLabel = formatDate(review.date_tasted, locale);
  const trimmedNote = review.note.trim();
  const NOTE_LIMIT = 160;
  const noteIsLong = trimmedNote.length > NOTE_LIMIT;
  const noteToShow =
    noteExpanded || !noteIsLong
      ? trimmedNote
      : `${trimmedNote.slice(0, NOTE_LIMIT).trimEnd()}…`;

  return (
    <article className="flex h-full flex-col rounded-xl border border-border-subtle bg-surface-base p-3.5">
      <header className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {t('visitNumber', { n: visitNumber })}
        </span>
        {!isFirst && deltaRating !== null && (
          <DeltaPill
            delta={deltaRating}
            formatValue={(d) => `${d > 0 ? '+' : ''}${d.toFixed(1)}`}
            tooltipFormat={(d) =>
              t('deltaRatingTooltipChange', {
                delta: `${d > 0 ? '+' : ''}${d.toFixed(2)}`,
              })
            }
            flatTooltip={t('deltaRatingTooltipFlat')}
          />
        )}
      </header>

      <p className="mt-1 m-0 font-sans text-[11px] text-text-muted">
        {dateLabel}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <StarRating value={Math.round(review.rating)} readonly size="sm" />
        <span className="font-display text-2xl font-medium tabular-nums text-action-primary">
          {review.rating.toFixed(1)}
        </span>
        <span className="font-sans text-[11px] text-text-muted">/ 5</span>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <PillarLine
          labelKey={PILLAR_LABELS.presentation}
          value={review.presentation}
          delta={visit.deltaPresentation}
          isFirst={isFirst}
        />
        <PillarLine
          labelKey={PILLAR_LABELS.value_prop}
          value={review.value_prop}
          delta={visit.deltaValueProp}
          isFirst={isFirst}
        />
        <PillarLine
          labelKey={PILLAR_LABELS.execution}
          value={review.execution}
          delta={visit.deltaExecution}
          isFirst={isFirst}
        />
      </div>

      {review.price_paid != null && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-text-muted">
              {t('pricePaid')}
            </span>
            <span className="font-display text-sm font-medium tabular-nums text-text-primary">
              {formatCurrency(review.price_paid, currencyCode, locale)}
            </span>
          </div>
          {!isFirst && deltaPrice != null && (
            <DeltaPill
              delta={deltaPrice}
              formatValue={(d) =>
                formatCurrency(d, currencyCode, locale, {
                  signDisplay: 'always',
                })
              }
              tooltipFormat={(d) =>
                t('deltaPriceTooltipChange', {
                  delta: formatCurrency(d, currencyCode, locale, {
                    signDisplay: 'always',
                  }),
                })
              }
              flatTooltip={t('deltaPriceTooltipFlat')}
            />
          )}
        </div>
      )}

      {trimmedNote && (
        <div className="mt-3 border-t border-border-subtle pt-2">
          <p className="m-0 font-sans text-xs leading-relaxed text-text-secondary">
            {noteToShow}
            {noteIsLong && (
              <button
                type="button"
                onClick={() => setNoteExpanded((v) => !v)}
                className="ml-1 inline font-semibold text-color-azafran hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                {noteExpanded ? t('noteCollapse') : t('noteReadMore')}
              </button>
            )}
          </p>
        </div>
      )}

      <div className="mt-auto pt-3">
        <button
          type="button"
          onClick={() => router.push(`/reviews/${review.id}`)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full font-sans text-[11px] font-semibold text-color-canela hover:text-color-azafran focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="h-2.5 w-2.5" aria-hidden />
          {t('viewVisit')}
        </button>
      </div>
    </article>
  );
}

function PillarLine({
  labelKey,
  value,
  delta,
  isFirst,
}: {
  labelKey: 'pillarPresentation' | 'pillarValue' | 'pillarExecution';
  value: PillarScore | null;
  delta: number | null;
  isFirst: boolean;
}) {
  const t = useTranslations('dish.myEvolution');
  const hasValue = value !== null && value !== undefined;
  const pct = hasValue ? Math.max(0, Math.min(100, (value / 3) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 font-sans text-[10.5px] text-text-muted">
      <span className="w-[5.5rem] truncate uppercase tracking-[0.08em]">
        {t(labelKey)}
      </span>
      <span
        className="relative block h-1 flex-1 overflow-hidden rounded-full bg-surface-subtle"
        aria-hidden
      >
        {hasValue && (
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-[color:var(--color-azafran)]"
            style={{ width: `${pct}%` }}
          />
        )}
      </span>
      <span className="w-7 text-right font-semibold tabular-nums text-text-primary">
        {hasValue ? value.toFixed(0) : '—'}
      </span>
      {!isFirst && delta !== null && delta !== 0 && (
        <FontAwesomeIcon
          icon={delta > 0 ? faArrowTrendUp : faArrowTrendDown}
          className={cn(
            'h-2.5 w-2.5 shrink-0',
            delta > 0
              ? 'text-[color:var(--color-albahaca)]'
              : 'text-[color:var(--color-paprika)]',
          )}
          title={t('pillarDeltaTooltipChange', { delta })}
          aria-label={t('pillarDeltaTooltipChange', { delta })}
        />
      )}
    </div>
  );
}

function DeltaPill({
  delta,
  formatValue,
  tooltipFormat,
  flatTooltip,
}: {
  delta: number;
  formatValue?: (delta: number) => string;
  tooltipFormat?: (delta: number) => string;
  flatTooltip?: string;
}) {
  const t = useTranslations('dish.myEvolution');
  const sign = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const icon =
    sign === 'up' ? faArrowTrendUp : sign === 'down' ? faArrowTrendDown : faMinus;
  const color =
    sign === 'up'
      ? 'text-[color:var(--color-albahaca)] bg-[color:var(--color-albahaca-pale)]'
      : sign === 'down'
        ? 'text-[color:var(--color-paprika)] bg-[color:var(--color-paprika-pale)]'
        : 'text-text-muted bg-surface-subtle';
  const formattedValue = formatValue
    ? formatValue(delta)
    : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`;
  const label = sign === 'flat' ? t('deltaFlat') : formattedValue;
  const tooltip =
    sign === 'flat'
      ? (flatTooltip ?? t('deltaRatingTooltipFlat'))
      : tooltipFormat
        ? tooltipFormat(delta)
        : `${delta > 0 ? '+' : ''}${delta.toFixed(2)}`;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-sans text-[10px] font-semibold tabular-nums',
        color,
      )}
      title={tooltip}
    >
      <FontAwesomeIcon icon={icon} className="h-2.5 w-2.5" aria-hidden />
      {label}
    </span>
  );
}

function pillarDelta(
  curr: PillarScore | null | undefined,
  prev: PillarScore | null | undefined,
): number | null {
  if (curr == null || prev == null) return null;
  return curr - prev;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
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
