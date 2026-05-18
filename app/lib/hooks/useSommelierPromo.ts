'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { getMyUIState, dismissTour } from '@/app/lib/api/uiState';
import { listMyConversations } from '@/app/lib/api/chat';

/**
 * Pseudo-tour-id reusado dentro del set genérico ``dismissed_tours``
 * (backend valida ``^[a-z0-9_]+$`` ≤64 y dedupea en SQL). No es un
 * tour real — es la fuente de verdad cross-device de "ya vio / cerró
 * la promo del Sommelier". Cero cambios de backend.
 */
export const SOMMELIER_PROMO_KEY = 'sommelier_promo_v1';

/** Evento DOM desacoplado: cualquier superficie de promo lo emite para
 *  abrir el drawer del Sommelier sin acoplarse al ChatLauncher. */
export const SOMMELIER_OPEN_EVENT = 'palato:sommelier:open';

// localStorage scoped por usuario, mismo esquema que TourProvider para
// no mezclar el estado entre cuentas del mismo navegador. Valor "1".
function storageKey(userId: string | null): string {
  return userId
    ? `palato_sommelier_promo_u_${userId}`
    : 'palato_sommelier_promo_anon';
}

function readLocalDismissed(userId: string | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(storageKey(userId)) === '1';
  } catch {
    return false;
  }
}

function writeLocalDismissed(userId: string | null) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(userId), '1');
  } catch {
    /* quota / private mode — el server queda como fuente de verdad */
  }
}

export interface SommelierPromoState {
  /** True cuando hay que mostrar la promo: user logueado, nunca abrió
   *  el Sommelier y no la descartó. Falso hasta ``resolved``. */
  shouldShow: boolean;
  /** Las verificaciones (ui-state + conversaciones) ya respondieron.
   *  Las superficies esperan esto para no flickear. */
  resolved: boolean;
  /** Cierra la promo para siempre (optimista local + best-effort server). */
  dismiss: () => void;
  /** Igual que ``dismiss`` — alias semántico para "abrió el chat". */
  markOpenedAndDismiss: () => void;
}

/**
 * Estado compartido de la promoción del Sommelier (coachmark + card
 * spotlight). Targeting: solo usuarios logueados que NUNCA abrieron el
 * Sommelier. ``listMyConversations({agent:'sommelier'})`` vacío ⇒ nunca
 * lo usó (también suprime la promo para usuarios preexistentes que ya
 * chatearon antes de que esta feature existiera).
 */
export function useSommelierPromo(): SommelierPromoState {
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const userId = user?.id ?? null;

  const [dismissed, setDismissed] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [resolved, setResolved] = useState(false);

  // Reset al cambiar de cuenta: cada user resuelve su propio estado.
  const lastUserRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (lastUserRef.current !== userId) {
      lastUserRef.current = userId;
      setDismissed(false);
      setEverOpened(false);
      setResolved(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!userId) {
      // Anónimo: la promo no aplica. Resolvemos sin mostrar.
      setResolved(true);
      return;
    }

    // Atajo offline: si el flag local está, ni tocamos la red.
    if (readLocalDismissed(userId)) {
      setDismissed(true);
      setResolved(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const [uiState, convs] = await Promise.allSettled([
        getMyUIState(),
        listMyConversations({ agent: 'sommelier', limit: 1 }),
      ]);
      if (cancelled) return;
      if (
        uiState.status === 'fulfilled' &&
        uiState.value.dismissed_tours.includes(SOMMELIER_PROMO_KEY)
      ) {
        setDismissed(true);
      }
      if (convs.status === 'fulfilled' && convs.value.length > 0) {
        setEverOpened(true);
      }
      setResolved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoading]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    writeLocalDismissed(userId);
    // Best-effort: idempotente y deduped en SQL. Sin red, localStorage
    // actúa de fallback y el próximo mount con red detecta el drift.
    void dismissTour(SOMMELIER_PROMO_KEY).catch(() => undefined);
  }, [userId]);

  const shouldShow =
    !isAuthLoading && !!user && resolved && !dismissed && !everOpened;

  return {
    shouldShow,
    resolved: resolved && !isAuthLoading,
    dismiss,
    markOpenedAndDismiss: dismiss,
  };
}
