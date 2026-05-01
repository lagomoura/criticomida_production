'use client';

import { useEffect, useRef, useState } from 'react';
import type { DishAggregates } from '@/app/lib/types/social';

interface TasteProfileProps {
  aggregates: DishAggregates;
}

export default function TasteProfile({ aggregates }: TasteProfileProps) {
  const { tagsTop, prosTop, consTop } = aggregates;
  const hasTags = tagsTop.length > 0;
  const hasPros = prosTop.length > 0;
  const hasCons = consTop.length > 0;
  if (!hasTags && !hasPros && !hasCons) return null;

  const maxTagCount = Math.max(1, ...tagsTop.map((t) => t.count));

  return (
    <section className="rounded-3xl border border-border-default bg-surface-card p-6 sm:p-8">
      <header className="mb-5">
        <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action-primary">
          El paladar colectivo
        </p>
        <h2 className="mt-1.5 font-display text-2xl font-medium text-text-primary sm:text-3xl">
          Lo que dicen del plato
        </h2>
        <p className="mt-1 font-sans text-sm text-text-muted">
          Etiquetas y atributos extraídos de las reseñas.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            Cómo lo describen
          </h3>
          {hasTags ? (
            <ul className="mt-4 flex flex-col gap-2.5">
              {tagsTop.slice(0, 8).map((t) => (
                <TasteBar key={t.tag} label={t.tag} count={t.count} max={maxTagCount} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-border-default px-4 py-3 font-sans text-xs text-text-muted">
              Aún no hay etiquetas suficientes.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-action-secondary">
              Pros más repetidos
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {hasPros ? (
                prosTop.slice(0, 6).map((p) => (
                  <li
                    key={p.text}
                    className="inline-flex items-center gap-1 rounded-full border border-action-secondary/30 bg-action-secondary/10 px-3 py-1 font-sans text-xs text-action-secondary"
                  >
                    {p.text}
                    <span className="rounded-full bg-action-secondary/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      {p.count}
                    </span>
                  </li>
                ))
              ) : (
                <li className="font-sans text-xs text-text-muted">Sin pros aún.</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-action-danger">
              Contras más repetidos
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {hasCons ? (
                consTop.slice(0, 6).map((c) => (
                  <li
                    key={c.text}
                    className="inline-flex items-center gap-1 rounded-full border border-action-danger/30 bg-action-danger/10 px-3 py-1 font-sans text-xs text-action-danger"
                  >
                    {c.text}
                    <span className="rounded-full bg-action-danger/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      {c.count}
                    </span>
                  </li>
                ))
              ) : (
                <li className="font-sans text-xs text-text-muted">Sin contras señalados.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function TasteBar({ label, count, max }: { label: string; count: number; max: number }) {
  const ref = useRef<HTMLLIElement | null>(null);
  const [visible, setVisible] = useState(false);
  const widthPct = Math.round((count / max) * 100);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <li ref={ref} className="flex items-center gap-3">
      <span className="w-32 shrink-0 font-sans text-sm font-medium capitalize text-text-primary sm:w-40">
        {label}
      </span>
      <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-subtle">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full bg-action-primary motion-safe:transition-[width] motion-safe:duration-[700ms] motion-safe:[transition-timing-function:var(--ease-spoon)]"
          style={{ width: visible ? `${widthPct}%` : '0%' }}
        />
      </span>
      <span className="w-8 shrink-0 text-right font-display text-base font-medium tabular-nums text-action-primary">
        {count}
      </span>
    </li>
  );
}
