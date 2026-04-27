import type { RestaurantAggregates, RatingDimensionKey } from '@/app/lib/types/restaurant';

interface RatingsRadarProps {
  aggregates: RestaurantAggregates;
}

const DIMENSIONS: Array<{ key: RatingDimensionKey; label: string }> = [
  { key: 'food_quality', label: 'Comida' },
  { key: 'service', label: 'Servicio' },
  { key: 'ambiance', label: 'Ambiente' },
  { key: 'cleanliness', label: 'Limpieza' },
  { key: 'value', label: 'Precio/calidad' },
];

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 24;
const MAX_SCORE = 5;

export default function RatingsRadar({ aggregates }: RatingsRadarProps) {
  const points = DIMENSIONS.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
    const dimAvg = aggregates.dimension_averages[dim.key];
    const score = dimAvg?.average ? Number(dimAvg.average) : 0;
    const r = (score / MAX_SCORE) * RADIUS;
    const x = CENTER + Math.cos(angle) * r;
    const y = CENTER + Math.sin(angle) * r;
    const labelX = CENTER + Math.cos(angle) * (RADIUS + 16);
    const labelY = CENTER + Math.sin(angle) * (RADIUS + 16);
    return { dim, score, count: dimAvg?.count ?? 0, x, y, labelX, labelY, angle };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ');
  const hasData = points.some((p) => p.score > 0);

  return (
    <section
      id="ratings"
      className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 shadow-sm sm:p-8"
    >
      <header className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)] sm:text-3xl">
          Cómo lo calificó la comunidad
        </h2>
        <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
          Promedios por dimensión a partir de las valoraciones de los visitantes.
        </p>
      </header>

      <div className="grid items-center gap-6 sm:grid-cols-[auto,1fr] sm:gap-8">
        <div className="mx-auto" aria-hidden>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img">
            {/* concentric grid */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <polygon
                key={ratio}
                points={DIMENSIONS.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
                  const r = RADIUS * ratio;
                  return `${CENTER + Math.cos(angle) * r},${CENTER + Math.sin(angle) * r}`;
                }).join(' ')}
                fill="none"
                stroke="var(--color-crema-darker)"
                strokeWidth={1}
              />
            ))}
            {/* spokes */}
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
            {/* data polygon */}
            {hasData && (
              <polygon
                points={polygon}
                fill="var(--color-azafran)"
                fillOpacity={0.18}
                stroke="var(--color-azafran)"
                strokeWidth={2}
                strokeLinejoin="round"
              />
            )}
            {/* dots */}
            {hasData &&
              points.map((p, i) => (
                <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3.5} fill="var(--color-azafran)" />
              ))}
            {/* labels */}
            {points.map((p, i) => (
              <text
                key={`lbl-${i}`}
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[var(--color-carbon-mid)]"
                fontSize={11}
                fontWeight={600}
              >
                {p.dim.label}
              </text>
            ))}
          </svg>
        </div>

        <ul className="space-y-3">
          {points.map((p) => {
            const pct = (p.score / MAX_SCORE) * 100;
            return (
              <li key={p.dim.key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm font-medium text-[var(--color-carbon-mid)]">
                  {p.dim.label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-crema-dark)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-azafran)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-sm font-semibold text-[var(--color-carbon)]">
                  {p.score > 0 ? p.score.toFixed(1) : '–'}
                  <span className="ml-1 text-xs font-normal text-[var(--color-carbon-soft)]">
                    ({p.count})
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {!hasData && (
        <p className="mt-4 text-sm italic text-[var(--color-carbon-soft)]">
          Aún no hay valoraciones por dimensión. Sé el primero en calificar.
        </p>
      )}
    </section>
  );
}
