'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faArrowTrendDown, faMinus, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';
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
  const { buckets } = timeline;

  if (buckets.length === 0) {
    return (
      <section
        aria-labelledby="evolution-heading"
        className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6"
      >
        <Heading />
        <p className="mt-3 font-display italic text-base leading-relaxed text-text-secondary">
          Aún no hay suficiente historia para reconstruir cómo cambió{' '}
          <span className="font-semibold not-italic text-text-primary">{dishName}</span> en
          el tiempo. Sé uno de los primeros cronistas.
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
          La historia recién empieza: hay reseñas en{' '}
          <PeriodLabel period={buckets[0].period} />, pero hace falta otro trimestre para
          saber si la cocina mantiene el nivel.
        </p>
        <div className="mt-4">
          <BucketCard bucket={buckets[0]} isFirst />
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
            <BucketCard bucket={bucket} isFirst={idx === 0} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function Heading() {
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
          Cómo cambió este plato
        </h2>
        <p className="mt-1 font-sans text-xs uppercase tracking-[0.16em] text-text-muted">
          Evolución por trimestre · rating promedio y pilares técnicos
        </p>
      </div>
    </div>
  );
}

function BucketCard({ bucket, isFirst }: { bucket: DishTimelineBucket; isFirst: boolean }) {
  const delta = bucket.deltaRating;
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
        {bucket.reviewCount} reseña{bucket.reviewCount === 1 ? '' : 's'}
      </p>
      <div className="mt-3 flex flex-col gap-1.5">
        <PillarBar label="Presentación" value={bucket.presentationAvg} />
        <PillarBar label="Costo/Beneficio" value={bucket.valuePropAvg} />
        <PillarBar label="Ejecución" value={bucket.executionAvg} />
      </div>
    </article>
  );
}

function DeltaPill({ delta }: { delta: number }) {
  const sign = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const icon =
    sign === 'up' ? faArrowTrendUp : sign === 'down' ? faArrowTrendDown : faMinus;
  const color =
    sign === 'up'
      ? 'text-[color:var(--color-albahaca)] bg-[color:var(--color-albahaca-pale)]'
      : sign === 'down'
        ? 'text-[color:var(--color-paprika)] bg-[color:var(--color-paprika-pale)]'
        : 'text-text-muted bg-surface-subtle';
  const label = sign === 'flat' ? 'Sin cambios' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-sans text-[10px] font-semibold tabular-nums',
        color,
      )}
      title={
        sign === 'flat'
          ? 'Mismo rating que el bucket anterior.'
          : `Cambio en estrellas vs. el bucket anterior: ${delta > 0 ? '+' : ''}${delta.toFixed(2)}.`
      }
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

function PeriodLabel({ period }: { period: string }) {
  // Acepta "YYYY-Qn" o "YYYY-MM". Lo formateamos legible.
  const quarter = /^(\d{4})-Q([1-4])$/.exec(period);
  if (quarter) {
    return <>{`Q${quarter[2]} ${quarter[1]}`}</>;
  }
  const month = /^(\d{4})-(\d{2})$/.exec(period);
  if (month) {
    const date = new Date(Number(month[1]), Number(month[2]) - 1, 1);
    return <>{new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' }).format(date)}</>;
  }
  return <>{period}</>;
}
