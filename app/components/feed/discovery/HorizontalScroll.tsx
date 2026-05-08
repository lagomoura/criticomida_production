'use client';

import type { ReactNode } from 'react';

interface HorizontalScrollProps {
  children: ReactNode;
  /** Accesibilidad: label semántico de la región. Requerido para screen readers. */
  ariaLabel?: string;
}

/**
 * Carrusel horizontal con scroll-snap suave. Usado por todos los rails.
 * - role="region" + aria-label para screen readers.
 * - Fade gradient en el borde derecho para señalizar scroll (affordance).
 */
export default function HorizontalScroll({ children, ariaLabel }: HorizontalScrollProps) {
  return (
    <div
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel}
      className="relative -mx-4"
    >
      {/* Fade gradient derecho — affordance visual de scroll */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface-page to-transparent"
      />
      <div className="overflow-x-auto px-4 pb-1 [scrollbar-width:thin]">
        <div className="flex snap-x snap-mandatory gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
