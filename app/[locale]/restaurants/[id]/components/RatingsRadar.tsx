'use client';

import { useTranslations } from 'next-intl';
import type { RestaurantAggregates, RatingDimensionKey } from '@/app/lib/types/restaurant';

interface RatingsRadarProps {
  aggregates: RestaurantAggregates;
}

const DIMENSION_KEYS: RatingDimensionKey[] = [
  'food_quality',
  'service',
  'ambiance',
  'cleanliness',
  'value',
];

const DIM_LABEL_KEY: Record<RatingDimensionKey, string> = {
  food_quality: 'dimFood',
  service: 'dimService',
  ambiance: 'dimAmbiance',
  cleanliness: 'dimCleanliness',
  value: 'dimValue',
};

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 24;
const MAX_SCORE = 5;

export default function RatingsRadar({ aggregates }: RatingsRadarProps) {
  const t = useTranslations('restaurant.ratings');

  const points = DIMENSION_KEYS.map((dimKey, i) => {
    const angle = (Math.PI * 2 * i) / DIMENSION_KEYS.length - Math.PI / 2;
    const dimAvg = aggregates.dimension_averages[dimKey];
    const score = dimAvg?.average ? Number(dimAvg.average) : 0;
    const r = (score / MAX_SCORE) * RADIUS;
    const x = CENTER + Math.cos(angle) * r;
    const y = CENTER + Math.sin(angle) * r;
    const labelX = CENTER + Math.cos(angle) * (RADIUS + 16);
    const labelY = CENTER + Math.sin(angle) * (RADIUS + 16);
    return {
      key: dimKey,
      label: t(DIM_LABEL_KEY[dimKey]),
      score,
      count: dimAvg?.count ?? 0,
      x,
      y,
      labelX,
      labelY,
      angle,
    };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ');
  const hasData = points.some((p) => p.score > 0);

  return (
    <section
      id="ratings"
      className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] p-6 shadow-sm sm:p-8"
    >
      <header className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-espresso)] sm:text-3xl">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-espresso-soft)]">
          {t('subtitle')}
        </p>
      </header>

      <div className="grid items-center gap-6 sm:grid-cols-[auto,1fr] sm:gap-8">
        <div className="mx-auto" aria-hidden>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img">
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <polygon
                key={ratio}
                points={DIMENSION_KEYS.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / DIMENSION_KEYS.length - Math.PI / 2;
                  const r = RADIUS * ratio;
                  return `${CENTER + Math.cos(angle) * r},${CENTER + Math.sin(angle) * r}`;
                }).join(' ')}
                fill="none"
                stroke="var(--color-crema-darker)"
                strokeWidth={1}
              />
            ))}
            {points.map((p, i) => (
              <line
                key={`spoke-${i}`}
                x1={CENTER}
                y1={CENTER}
                x2={CENTER + Math.cos(p.angle) * RADIUS}
                y2={CENTER + Math.sin(p.angle) * RADIUS}
                stroke="var(--color-crema-darker)"
                strokeWidth={1}
              />
            ))}
            {hasData && (
              <polygon
                points={polygon}
                fill="var(--color-terracota)"
                fillOpacity={0.18}
                stroke="var(--color-terracota)"
                strokeWidth={2}
                strokeLinejoin="round"
              />
            )}
            {hasData &&
              points.map((p, i) => (
                <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3.5} fill="var(--color-terracota)" />
              ))}
            {points.map((p, i) => (
              <text
                key={`lbl-${i}`}
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[var(--color-espresso-mid)]"
                fontSize={11}
                fontWeight={600}
              >
                {p.label}
              </text>
            ))}
          </svg>
        </div>

        <ul className="space-y-3">
          {points.map((p) => {
            const pct = (p.score / MAX_SCORE) * 100;
            return (
              <li key={p.key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm font-medium text-[var(--color-espresso-mid)]">
                  {p.label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-crema-dark)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-terracota)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-sm font-semibold text-[var(--color-espresso)]">
                  {p.score > 0 ? p.score.toFixed(1) : '–'}
                  <span className="ml-1 text-xs font-normal text-[var(--color-espresso-soft)]">
                    ({p.count})
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {!hasData && (
        <p className="mt-4 text-sm italic text-[var(--color-espresso-soft)]">
          {t('noData')}
        </p>
      )}
    </section>
  );
}
