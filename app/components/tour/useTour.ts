'use client';

import { createContext, useContext } from 'react';

export type TourStatus = 'idle' | 'running' | 'completed';

export interface TourContextValue {
  status: TourStatus;
  activeTourId: string | null;
  stepIndex: number;
  /** Cantidad total de steps del tour activo (0 si idle). */
  totalSteps: number;
  /** True mientras el TourProvider está re-resolviendo el target en el DOM. */
  isResolving: boolean;
  start: (tourId: string) => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  complete: () => void;
  /** Vuelve a habilitar un tour ya descartado y lo arranca. */
  restart: (tourId: string) => Promise<void>;
}

export const TourContext = createContext<TourContextValue | undefined>(undefined);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTour debe usarse dentro de <TourProvider>');
  }
  return ctx;
}
