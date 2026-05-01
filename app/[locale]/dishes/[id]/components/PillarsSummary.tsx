'use client';

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import type { DishPillarBreakdown, DishPillarsAggregates } from '@/app/lib/types/social';

interface PillarsSummaryProps {
  pillars: DishPillarsAggregates;
}

type Tone = 'negative' | 'neutral' | 'positive';

interface PillarOption {
  value: 1 | 2 | 3;
  emoji: string;
  label: string;
  tone: Tone;
}

interface PillarMeta {
  key: 'presentation' | 'valueProp' | 'execution';
  title: string;
  hint: string;
  options: [PillarOption, PillarOption, PillarOption];
}

const PILLARS: PillarMeta[] = [
  {
    key: 'presentation',
    title: 'Presentación',
    hint: 'Cómo se ve el plato',
    options: [
      { value: 1, emoji: '📸', label: 'Pobre', tone: 'negative' },
      { value: 2, emoji: '🆗', label: 'Normal', tone: 'neutral' },
      { value: 3, emoji: '🌟', label: 'Increíble', tone: 'positive' },
    ],
  },
  {
    key: 'valueProp',
    title: 'Costo / Beneficio',
    hint: 'Lo que pagás vs. lo que recibís',
    options: [
      { value: 1, emoji: '💸', label: 'Caro', tone: 'negative' },
      { value: 2, emoji: '⚖️', label: 'Justo', tone: 'neutral' },
      { value: 3, emoji: '💎', label: 'Ganga', tone: 'positive' },
    ],
  },
  {
    key: 'execution',
    title: 'Ejecución técnica',
    hint: 'Cómo está cocinado',
    options: [
      { value: 1, emoji: '❌', label: 'Falló', tone: 'negative' },
      { value: 2, emoji: '🥣', label: 'Correcta', tone: 'neutral' },
      { value: 3, emoji: '👨‍🍳', label: 'Perfección', tone: 'positive' },
    ],
  },
];

const SEGMENT_BG: Record<Tone, string> = {
  negative: 'bg-rose-500',
  neutral: 'bg-amber-400',
  positive: 'bg-emerald-500',
};

const TONE_TEXT: Record<Tone, string> = {
  negative: 'text-rose-600',
  neutral: 'text-amber-600',
  positive: 'text-emerald-600',
};

const TONE_BG_PALE: Record<Tone, string> = {
  negative: 'bg-rose-50 dark:bg-rose-500/10',
  neutral: 'bg-amber-50 dark:bg-amber-500/10',
  positive: 'bg-emerald-50 dark:bg-emerald-500/10',
};

export default function PillarsSummary({ pillars }: PillarsSummaryProps) {
  const totalAnswered =
    pillars.presentation.answered +
    pillars.valueProp.answered +
    pillars.execution.answered;

  // No mostrar si nadie contestó ningún pilar.
  if (totalAnswered === 0) return null;

  return (
    <section className="rounded-3xl border border-border-default bg-surface-card p-6 sm:p-8">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action-primary">
            Pilares técnicos · Resumen
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-medium text-text-primary sm:text-3xl">
            Cómo lo califican
          </h2>
          <p className="mt-1 font-sans text-sm text-text-muted">
            Tres dimensiones que los comensales evaluaron en sus reseñas.
          </p>
        </div>
        <span
          className="hidden shrink-0 items-center gap-1.5 rounded-full bg-color-azafran-pale px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-color-canela sm:inline-flex"
          aria-label="Sello editorial"
        >
          <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" aria-hidden />
          Sello editorial
        </span>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {PILLARS.map((meta) => (
          <PillarCard
            key={meta.key}
            meta={meta}
            data={pillars[meta.key]}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------- ---------- */

function PillarCard({ meta, data }: { meta: PillarMeta; data: DishPillarBreakdown }) {
  if (data.answered === 0) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-border-default bg-surface-page px-4 py-5">
        <p className="m-0 font-sans text-[10.5px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          {meta.title}
        </p>
        <p className="m-0 font-sans text-xs italic text-text-muted">
          Aún sin calificaciones.
        </p>
      </div>
    );
  }

  // Choice dominante: la opción con más votos. Empate → preferir el valor más alto.
  const counts: [number, number, number] = [data.one, data.two, data.three];
  let dominantIdx = 0;
  for (let i = 1; i < 3; i++) {
    if (counts[i] >= counts[dominantIdx]) dominantIdx = i;
  }
  const dominant = meta.options[dominantIdx];
  const dominantPct = Math.round((counts[dominantIdx] / data.answered) * 100);

  return (
    <article
      className={[
        'flex flex-col gap-3 rounded-2xl border border-border-subtle p-4',
        TONE_BG_PALE[dominant.tone],
      ].join(' ')}
    >
      <header className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          {meta.title}
        </span>
        <span className="font-sans text-[10.5px] text-text-muted">{meta.hint}</span>
      </header>

      {/* Dominante: emoji + label + % */}
      <div className="flex items-center gap-3">
        <span className="text-3xl leading-none" aria-hidden>{dominant.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className={['m-0 font-display text-xl font-medium leading-tight', TONE_TEXT[dominant.tone]].join(' ')}>
            {dominant.label}
          </p>
          <p className="m-0 font-sans text-xs text-text-muted">
            {dominantPct}% lo eligió
          </p>
        </div>
      </div>

      {/* Distribución */}
      <DistributionBar
        counts={counts}
        total={data.answered}
        options={meta.options}
      />

      <p className="m-0 font-sans text-[11px] text-text-muted">
        {data.answered} de los reviewers calificaron este pilar
        {data.avg !== null && (
          <>
            {' · '}
            promedio <strong className="font-semibold text-text-secondary">{data.avg.toFixed(1)}</strong>/3
          </>
        )}
      </p>
    </article>
  );
}

function DistributionBar({
  counts,
  total,
  options,
}: {
  counts: [number, number, number];
  total: number;
  options: [PillarOption, PillarOption, PillarOption];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const pcts: [number, number, number] = [
    total === 0 ? 0 : (counts[0] / total) * 100,
    total === 0 ? 0 : (counts[1] / total) * 100,
    total === 0 ? 0 : (counts[2] / total) * 100,
  ];

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div
        className="relative flex h-2 overflow-hidden rounded-full bg-surface-subtle"
        role="img"
        aria-label={`${counts[2]} positivos, ${counts[1]} neutros, ${counts[0]} negativos`}
      >
        {options.map((opt, i) => (
          <span
            key={opt.value}
            aria-hidden
            className={[
              'h-full',
              SEGMENT_BG[opt.tone],
              'motion-safe:transition-[width] motion-safe:duration-[700ms] motion-safe:[transition-timing-function:var(--ease-spoon)]',
            ].join(' ')}
            style={{ width: visible ? `${pcts[i]}%` : '0%' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between font-sans text-[10px] text-text-muted">
        {options.map((opt) => (
          <span key={opt.value} className="inline-flex items-center gap-1">
            <span aria-hidden className={['h-1.5 w-1.5 rounded-full', SEGMENT_BG[opt.tone]].join(' ')} />
            <span>{opt.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
