import { fetchApi } from './client';

/**
 * Per-user UI state — fuente de verdad cross-device para flags de
 * onboarding y similares. Hoy expone únicamente ``dismissed_tours``;
 * el contrato puede crecer sin migrar usuarios existentes (defaults
 * son siempre "vacío / no descartado").
 */
export interface UIState {
  dismissed_tours: string[];
}

export async function getMyUIState(): Promise<UIState> {
  return fetchApi<UIState>('/api/users/me/ui-state');
}

/**
 * Descarta un tour de forma idempotente. El backend dedupea en SQL,
 * así que llamar dos veces con el mismo ``tour_id`` deja el set igual.
 */
export async function dismissTour(tourId: string): Promise<UIState> {
  return fetchApi<UIState>('/api/users/me/ui-state/dismiss-tour', {
    method: 'POST',
    body: JSON.stringify({ tour_id: tourId }),
  });
}

/**
 * Saca un tour del set de descartados — habilita el auto-trigger del
 * tour en el próximo mount. Usado por el botón "Volver a ver el
 * recorrido" en ``/me/preferencias``.
 */
export async function restoreTour(tourId: string): Promise<UIState> {
  return fetchApi<UIState>(
    `/api/users/me/ui-state/dismissed-tours/${encodeURIComponent(tourId)}`,
    { method: 'DELETE' },
  );
}
