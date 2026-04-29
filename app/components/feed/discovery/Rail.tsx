'use client';

import type { ReactNode } from 'react';

interface RailProps {
  /** Pretitle pequeño (todo en mayúsculas tracked). */
  kicker?: string;
  title: string;
  /** Bajada corta, debajo del título. */
  subtitle?: string;
  /** Acción opcional al lado derecho del header (ej. "Ver más"). */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Wrapper visual común para los rails del feed Descubrir. No impone scroll
 * horizontal — cada rail decide si su contenido es grid, scroll o split.
 */
export default function Rail({ kicker, title, subtitle, action, children }: RailProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          {kicker && (
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-text-muted">
              {kicker}
            </p>
          )}
          <h2 className="font-display text-xl font-semibold text-text-primary sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="font-sans text-sm text-text-muted">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}
