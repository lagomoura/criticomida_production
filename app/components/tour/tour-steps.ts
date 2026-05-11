/**
 * Configuración declarativa del tour "home_v1".
 *
 * Cada step es puro data: el motor (`TourProvider` + `TourOverlay`)
 * los recorre y resuelve el target en runtime con
 * `document.querySelector('[data-tour-id="X"]')`. Mantener este
 * archivo libre de JSX permite testearlo aislado y agregar tours
 * nuevos sin tocar el motor.
 */

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'center';

export type FeedTabId = 'for_you' | 'following' | 'map';

export interface TourStep {
  /** Identificador estable del step (para analytics si se agrega). */
  id: string;
  /** Selector ``[data-tour-id="..."]``. Sin target → step modal centrado. */
  targetTourId?: string;
  /** Clave i18n bajo ``tour.steps``. */
  i18nKey: string;
  placement: TourPlacement;
  /** Tab del feed que tiene que estar activo para que el target exista. */
  requireFeedTab?: FeedTabId;
}

export interface TourDefinition {
  id: string;
  steps: TourStep[];
}

/**
 * Tour de bienvenida en la home. Cobertura: tabs del feed → duelo →
 * discovery rails geográficos → acciones globales del nav (publicar,
 * notificaciones, perfil). 8 pasos, ~30s leídos.
 */
export const HOME_TOUR: TourDefinition = {
  id: 'home_v1',
  steps: [
    { id: 'welcome', i18nKey: 'welcome', placement: 'center' },
    {
      id: 'feed_tabs',
      i18nKey: 'feedTabs',
      targetTourId: 'feed_tabs',
      placement: 'bottom',
    },
    {
      id: 'dish_duel',
      i18nKey: 'dishDuel',
      targetTourId: 'dish_duel',
      placement: 'top',
      requireFeedTab: 'for_you',
    },
    {
      id: 'discovery_geo',
      i18nKey: 'discoveryGeo',
      targetTourId: 'discovery_geo',
      placement: 'top',
      requireFeedTab: 'for_you',
    },
    {
      id: 'publish',
      i18nKey: 'publish',
      targetTourId: 'publish',
      placement: 'auto',
    },
    {
      id: 'notifications',
      i18nKey: 'notifications',
      targetTourId: 'notifications',
      placement: 'auto',
    },
    {
      id: 'profile',
      i18nKey: 'profile',
      targetTourId: 'profile',
      placement: 'auto',
    },
    { id: 'closing', i18nKey: 'closing', placement: 'center' },
  ],
};

export const ALL_TOURS: Record<string, TourDefinition> = {
  [HOME_TOUR.id]: HOME_TOUR,
};

/**
 * Evento DOM custom usado para pedir al `FeedClient` que cambie el
 * tab activo antes de mostrar un step que depende de un rail de
 * "Para ti". Mantiene al TourProvider desacoplado del feed.
 */
export const TOUR_REQUIRE_FEED_TAB_EVENT = 'palato:tour:require-feed-tab';

export function dispatchRequireFeedTab(tabId: FeedTabId): void {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(
    new CustomEvent(TOUR_REQUIRE_FEED_TAB_EVENT, { detail: { tabId } }),
  );
}
