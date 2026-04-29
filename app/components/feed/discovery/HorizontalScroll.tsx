'use client';

import type { ReactNode } from 'react';

interface HorizontalScrollProps {
  children: ReactNode;
}

/** Carrusel horizontal con scroll-snap suave. Usado por todos los rails. */
export default function HorizontalScroll({ children }: HorizontalScrollProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:thin]">
      <div className="flex snap-x snap-mandatory gap-3">
        {children}
      </div>
    </div>
  );
}
