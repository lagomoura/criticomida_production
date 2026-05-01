import type { DishAggregates } from '@/app/lib/types/social';

interface DishStatsPanelProps {
  aggregates: DishAggregates;
  averageScore: number;
  reviewCount: number;
}

const PORTION_LABELS = {
  small: 'Pequeña',
  medium: 'Mediana',
  large: 'Grande',
} as const;

export default function DishStatsPanel({
  aggregates,
  averageScore,
  reviewCount,
}: DishStatsPanelProps) {
  const { ratingHistogram, portionDistribution, wouldOrderAgain } = aggregates;
  const totalRatings = (['1', '2', '3', '4', '5'] as const).reduce(
    (acc, k) => acc + ratingHistogram[k],
    0,
  );
  const totalPortions =
    portionDistribution.small + portionDistribution.medium + portionDistribution.large;
  const woaTotal = wouldOrderAgain.yes + wouldOrderAgain.no;

  return (
    <section className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 sm:p-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)]">
            En números
          </h2>
          <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
            Distribución de las {reviewCount} reseñas registradas.
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-4xl font-medium tabular-nums text-[var(--color-azafran)]">
            {averageScore.toFixed(1)}
          </span>
          <span className="text-sm text-[var(--color-carbon-soft)]">/ 5</span>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-carbon-soft)]">
            Calificaciones
          </h3>
          <ul className="mt-3 space-y-1.5">
            {(['5', '4', '3', '2', '1'] as const).map((bucket) => {
              const value = ratingHistogram[bucket];
              const pct = totalRatings > 0 ? Math.round((value / totalRatings) * 100) : 0;
              return (
                <li key={bucket} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-right tabular-nums text-[var(--color-carbon-soft)]">
                    {bucket}★
                  </span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-crema-dark)]">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-azafran)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 tabular-nums text-[var(--color-carbon-soft)]">{value}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-carbon-soft)]">
            Porción
          </h3>
          {totalPortions > 0 ? (
            <ul className="mt-3 space-y-2">
              {(['small', 'medium', 'large'] as const).map((k) => {
                const v = portionDistribution[k];
                const pct = Math.round((v / totalPortions) * 100);
                return (
                  <li key={k}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-carbon)]">{PORTION_LABELS[k]}</span>
                      <span className="tabular-nums text-[var(--color-carbon-soft)]">
                        {pct}% · {v}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-crema-dark)]">
                      <span
                        className="block h-full rounded-full bg-[var(--color-canela)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 rounded-2xl border border-dashed border-[var(--color-crema-darker)] px-3 py-3 text-xs text-[var(--color-carbon-soft)]">
              Sin datos de porción.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-carbon-soft)]">
            ¿Volverían a pedirlo?
          </h3>
          {woaTotal > 0 ? (
            <div className="mt-3 space-y-3">
              <p className="font-[family-name:var(--font-display)] text-4xl font-medium tabular-nums text-[var(--color-albahaca)]">
                {wouldOrderAgain.pct?.toFixed(0) ?? 0}%
              </p>
              <div className="flex h-3 overflow-hidden rounded-full bg-[var(--color-crema-dark)]">
                <span
                  className="bg-[var(--color-albahaca)]"
                  style={{ width: `${(wouldOrderAgain.yes / woaTotal) * 100}%` }}
                />
                <span
                  className="bg-[var(--color-paprika)]"
                  style={{ width: `${(wouldOrderAgain.no / woaTotal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[var(--color-carbon-soft)]">
                {wouldOrderAgain.yes} sí · {wouldOrderAgain.no} no
                {wouldOrderAgain.noAnswer > 0 ? ` · ${wouldOrderAgain.noAnswer} sin responder` : null}
              </p>
            </div>
          ) : (
            <p className="mt-3 rounded-2xl border border-dashed border-[var(--color-crema-darker)] px-3 py-3 text-xs text-[var(--color-carbon-soft)]">
              Pocos respondieron esta pregunta todavía.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
