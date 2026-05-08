'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faArrowTrendDown, faMinus, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';
import { formatCurrency } from '@/app/lib/utils/currency';
import { Tooltip } from '@/app/components/ui';
import type { DishTimeline, DishTimelineBucket } from '@/app/lib/types/social';

export interface DishEvolutionTimelineProps {
  timeline: DishTimeline;
  /** Nombre del plato — para narrar el estado vacío. */
  dishName: string;
}

/**
 * Línea de tiempo de la evolución del plato.
 *
 * Por qué importa: el gastronerd no quiere un promedio plano — quiere ver
 * cómo cambió el plato a lo largo de los trimestres. Este componente convierte
 * el archivo de reseñas (hoy una pila plana) en una historia.
 */
export default function DishEvolutionTimeline({
  timeline,
  dishName,
}: DishEvolutionTimelineProps) {
  const t = useTranslations('dish.evolution');
  const locale = useLocale();
  const { buckets } = timeline;
  const currencyCode = timeline.currencyCode ?? null;

  if (buckets.length === 0) {
    return (
      <section
        aria-labelledby="evolution-heading"
        className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6"
      >
        <Heading />
        <p className="mt-3 font-display italic text-base leading-relaxed text-text-secondary">
          {t.rich('emptyMessage', {
            dish: dishName,
            strong: (chunks) => (
              <span className="font-semibold not-italic text-text-primary">
                {chunks}
              </span>
            ),
          })}
        </p>
      </section>
    );
  }

  // Bucket único: no hay delta para narrar todavía.
  if (buckets.length === 1) {
    return (
      <section
        aria-labelledby="evolution-heading"
        className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6"
      >
        <Heading />
        <p className="mt-3 font-display italic text-base leading-relaxed text-text-secondary">
          {t('singleBucketMessage', {
            period: formatPeriodText(buckets[0].period, locale, t),
          })}
        </p>
        <div className="mt-4">
          <BucketCard
            bucket={buckets[0]}
            isFirst
            currencyCode={currencyCode}
            locale={locale}
          />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="evolution-heading"
      className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6"
    >
      <Heading />
      <ol className="mt-5 grid grid-flow-col auto-cols-[minmax(11rem,1fr)] gap-3 overflow-x-auto pb-2 sm:grid-flow-col">
        {buckets.map((bucket, idx) => (
          <li key={bucket.period}>
            <BucketCard
              bucket={bucket}
              isFirst={idx === 0}
              currencyCode={currencyCode}
              locale={locale}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

function Heading() {
  const t = useTranslations('dish.evolution');
  return (
    <div className="flex items-baseline gap-3">
      <FontAwesomeIcon
        icon={faClockRotateLeft}
        className="text-[color:var(--color-azafran)] text-[1rem]"
        aria-hidden
      />
      <div>
        <h2
          id="evolution-heading"
          className="m-0 font-display text-xl font-medium leading-tight text-text-primary sm:text-2xl"
        >
          {t('headingTitle')}
        </h2>
        <p className="mt-1 font-sans text-xs uppercase tracking-[0.16em] text-text-muted">
          {t('headingSubtitle')}
        </p>
      </div>
    </div>
  );
}

function BucketCard({
  bucket,
  isFirst,
  currencyCode,
  locale,
}: {
  bucket: DishTimelineBucket;
  isFirst: boolean;
  currencyCode: string | null;
  locale: string;
}) {
  const t = useTranslations('dish.evolution');
  const delta = bucket.deltaRating;
  const priceAvg = bucket.priceAvg;
  const priceDelta = bucket.deltaPriceAvg;
  return (
    <article className="flex h-full flex-col rounded-xl border border-border-subtle bg-surface-base p-3.5">
      <header className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          <PeriodLabel period={bucket.period} />
        </span>
        {!isFirst && delta !== null && delta !== undefined && (
          <DeltaPill delta={delta} />
        )}
      </header>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-medium tabular-nums text-action-primary">
          {bucket.avgRating.toFixed(1)}
        </span>
        <span className="font-sans text-xs text-text-muted">/ 5</span>
      </div>
      <p className="mt-0.5 font-sans text-xs text-text-muted">
        {bucket.reviewCount === 1
          ? t('reviewOne', { count: bucket.reviewCount })
          : t('reviewMany', { count: bucket.reviewCount })}
      </p>
      <div className="mt-3 flex flex-col gap-1.5">
        <PillarBar label={t('pillarPresentation')} value={bucket.presentationAvg} />
        <PillarBar label={t('pillarValue')} value={bucket.valuePropAvg} />
        <PillarBar label={t('pillarExecution')} value={bucket.executionAvg} />
      </div>
      {priceAvg != null && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-2">
          <div className="flex items-baseline gap-1.5">
            <Tooltip multiline label={t('priceAvgTooltip')}>
              <span
                tabIndex={0}
                className="cursor-help font-sans text-[10px] uppercase tracking-[0.08em] text-text-muted underline decoration-dotted decoration-text-muted/50 underline-offset-2"
              >
                {t('priceAvg')}
              </span>
            </Tooltip>
            <span className="font-display text-sm font-medium tabular-nums text-text-primary">
              {formatCurrency(priceAvg, currencyCode, locale)}
            </span>
          </div>
          {priceDelta != null && (
            <DeltaPill
              delta={priceDelta}
              formatValue={(d) =>
                formatCurrency(d, currencyCode, locale, { signDisplay: 'always' })
              }
              tooltipFormat={(d) =>
                t('priceDeltaTooltipChange', {
                  delta: formatCurrency(d, currencyCode, locale, {
                    signDisplay: 'always',
                  }),
                })
              }
              flatTooltip={t('priceDeltaTooltipFlat')}
            />
          )}
        </div>
      )}
    </article>
  );
}

function DeltaPill({
  delta,
  formatValue,
  tooltipFormat,
  flatTooltip,
}: {
  delta: number;
  /** Custom formatter para el label visible. Default: rating con 1 decimal. */
  formatValue?: (delta: number) => string;
  /** Custom formatter para el tooltip cuando hay cambio. */
  tooltipFormat?: (delta: number) => string;
  /** Tooltip cuando delta=0. Default: traducción `deltaTooltipFlat` (rating). */
  flatTooltip?: string;
}) {
  const t = useTranslations('dish.evolution');
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
      ? (flatTooltip ?? t('deltaTooltipFlat'))
      : (tooltipFormat
          ? tooltipFormat(delta)
          : t('deltaTooltipChange', {
              delta: `${delta > 0 ? '+' : ''}${delta.toFixed(2)}`,
            }));
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

function PillarBar({ label, value }: { label: string; value: number | null | undefined }) {
  // Pilares 1..3 — convertimos a porcentaje para la barra.
  const hasValue = value !== null && value !== undefined;
  const pct = hasValue ? Math.max(0, Math.min(100, ((value as number) / 3) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 font-sans text-[10.5px] text-text-muted">
      <span className="w-[5.25rem] truncate uppercase tracking-[0.08em]">{label}</span>
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
        {hasValue ? (value as number).toFixed(1) : '—'}
      </span>
    </div>
  );
}

function formatPeriodText(
  period: string,
  locale: string,
  t: ReturnType<typeof useTranslations<'dish.evolution'>>,
): string {
  const quarter = /^(\d{4})-Q([1-4])$/.exec(period);
  if (quarter) {
    return t('quarterFormat', { quarter: quarter[2], year: quarter[1] });
  }
  const month = /^(\d{4})-(\d{2})$/.exec(period);
  if (month) {
    const date = new Date(Number(month[1]), Number(month[2]) - 1, 1);
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
  return period;
}

function PeriodLabel({ period }: { period: string }) {
  const t = useTranslations('dish.evolution');
  const locale = useLocale();
  const quarter = /^(\d{4})-Q([1-4])$/.exec(period);
  if (quarter) {
    return <>{t('quarterFormat', { quarter: quarter[2], year: quarter[1] })}</>;
  }
  const month = /^(\d{4})-(\d{2})$/.exec(period);
  if (month) {
    const date = new Date(Number(month[1]), Number(month[2]) - 1, 1);
    return <>{new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date)}</>;
  }
  return <>{period}</>;
}
