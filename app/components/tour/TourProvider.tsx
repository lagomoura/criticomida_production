'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from '@/app/lib/i18n/navigation';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import {
  dismissTour as dismissTourApi,
  getMyUIState,
  restoreTour as restoreTourApi,
} from '@/app/lib/api/uiState';
import { TourContext, type TourStatus } from './useTour';
import {
  ALL_TOURS,
  HOME_TOUR,
  dispatchRequireFeedTab,
} from './tour-steps';
import TourOverlay from './TourOverlay';

// localStorage scoped por usuario: si compartiéramos una sola key entre
// cuentas del mismo navegador, dismissar el tour como user A heredaría
// el dismiss al user B la próxima vez que entre. Anónimos van a una
// key propia que jamás se mezcla con la de un user con sesión.
function storageKey(userId: string | null): string {
  return userId ? `palato_dismissed_tours_u_${userId}` : 'palato_dismissed_tours_anon';
}

// Limpieza one-shot de la key legacy global (antes del fix existía
// "palato_dismissed_tours" compartido). La borramos si la encontramos
// para que nunca contamine a un user nuevo.
function purgeLegacyKey() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('palato_dismissed_tours');
  } catch {
    /* ignore */
  }
}

function readLocalDismissed(userId: string | null): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeLocalDismissed(userId: string | null, values: Iterable<string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(Array.from(values)));
  } catch {
    /* quota / private mode — ignorar; el server queda como fuente de verdad */
  }
}

export default function TourProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  const userId = user?.id ?? null;

  const [status, setStatus] = useState<TourStatus>('idle');
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  // Hasta que esto sea true no disparamos el auto-arranque — sin esto el
  // tour aparecería un instante antes de que llegue el server con la
  // lista real de descartados, generando un flicker visible.
  const [dismissedLoaded, setDismissedLoaded] = useState(false);

  /** Persiste el dismiss localmente (scoped al user actual) y best-effort
   *  en el server. */
  const persistDismiss = useCallback(
    async (tourId: string) => {
      const next = new Set<string>();
      setDismissed((prev) => {
        prev.forEach((id) => next.add(id));
        next.add(tourId);
        writeLocalDismissed(userId, next);
        return next;
      });
      try {
        await dismissTourApi(tourId);
      } catch {
        // Sin red / sin sesión: localStorage actúa de fallback y el
        // próximo mount con red detecta el drift y reintenta.
      }
    },
    [userId],
  );

  // ─────────────────────────────────────────────────────────────────
  //   Carga inicial scoped al user actual.
  //
  //   Para usuarios logueados, el SERVER es la fuente de verdad: si
  //   el comensal nunca dismissed el tour, su `dismissed_tours` viene
  //   vacío y el tour debe aparecer aunque otra cuenta lo haya cerrado
  //   antes en este mismo navegador. localStorage entra solo como
  //   fallback offline + drift recovery, pero ya scoped por user_id.
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthLoading) return;
    // Limpieza one-shot de la key legacy global (pre-fix). Si quedó
    // del tour anterior, podría contaminar a un user nuevo.
    purgeLegacyKey();

    if (!userId) {
      // Anónimos: solo localStorage anon. No se dispara el tour igual
      // (auto-trigger exige user), pero mantenemos el set por consistencia.
      setDismissed(new Set(readLocalDismissed(null)));
      setDismissedLoaded(true);
      return;
    }

    let cancelled = false;
    const local = new Set(readLocalDismissed(userId));

    (async () => {
      try {
        const server = await getMyUIState();
        if (cancelled) return;
        const serverSet = new Set<string>(server.dismissed_tours);
        // Drift recovery: ids que el cliente cerró offline y nunca
        // llegaron al server. Solo aplica entre local y server DEL
        // MISMO user_id (ya están scoped) — nunca cross-cuenta.
        const driftIds = Array.from(local).filter((id) => !serverSet.has(id));
        for (const id of driftIds) {
          void dismissTourApi(id)
            .then(() => undefined)
            .catch(() => undefined);
          serverSet.add(id);
        }
        // Re-escribir localStorage con el set final (server ∪ drift).
        // Si server lo borró (re-trigger) y local no, el server gana:
        // la unión NO incluye el id que el server quitó.
        writeLocalDismissed(userId, serverSet);
        setDismissed(serverSet);
      } catch {
        // Sin red: fallback a local (del user actual).
        if (!cancelled) setDismissed(local);
      } finally {
        if (!cancelled) setDismissedLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoading]);

  // ─────────────────────────────────────────────────────────────────
  //   Auto-arranque del home_v1 en la home con usuario logueado.
  //   Reset al cambiar de cuenta: cada user merece su propia chance.
  // ─────────────────────────────────────────────────────────────────
  const autoStartedRef = useRef(false);
  useEffect(() => {
    autoStartedRef.current = false;
  }, [userId]);

  useEffect(() => {
    if (autoStartedRef.current) return;
    if (status !== 'idle') return;
    if (!dismissedLoaded) return;
    if (isAuthLoading) return;
    if (!user) return;
    if (pathname !== '/') return;
    if (dismissed.has(HOME_TOUR.id)) return;
    autoStartedRef.current = true;
    setActiveTourId(HOME_TOUR.id);
    setStepIndex(0);
    setStatus('running');
  }, [status, dismissedLoaded, isAuthLoading, user, pathname, dismissed]);

  // ─────────────────────────────────────────────────────────────────
  //   Si requireFeedTab del step ≠ tab activo del FeedClient,
  //   despachar el evento para que se cambie antes del render.
  //   FeedClient ignora si ya está en ese tab (idempotente).
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'running' || !activeTourId) return;
    const def = ALL_TOURS[activeTourId];
    if (!def) return;
    const step = def.steps[stepIndex];
    if (!step) return;
    if (step.requireFeedTab) {
      dispatchRequireFeedTab(step.requireFeedTab);
    }
  }, [status, activeTourId, stepIndex]);

  // ─────────────────────────────────────────────────────────────────
  //   Navegación a otra ruta durante el tour ⇒ tratar como skip.
  //   El usuario eligió irse; no queremos arrastrarlo de vuelta.
  // ─────────────────────────────────────────────────────────────────
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    if (status === 'running' && activeTourId) {
      void persistDismiss(activeTourId);
      setStatus('idle');
      setActiveTourId(null);
      setStepIndex(0);
    }
  }, [pathname, status, activeTourId, persistDismiss]);

  // ─────────────────────────────────────────────────────────────────
  //   Logout durante el tour ⇒ pausar (no dismiss).
  //   El usuario no eligió saltar — re-aparece cuando vuelva a entrar.
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'running' && !user && !isAuthLoading) {
      setStatus('idle');
      setActiveTourId(null);
      setStepIndex(0);
    }
  }, [user, isAuthLoading, status]);

  // ─────────────────────────────────────────────────────────────────
  //   Actions
  // ─────────────────────────────────────────────────────────────────
  const start = useCallback((tourId: string) => {
    const def = ALL_TOURS[tourId];
    if (!def) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[tour] tour desconocido: ${tourId}`);
      }
      return;
    }
    setActiveTourId(tourId);
    setStepIndex(0);
    setStatus('running');
  }, []);

  const totalSteps = useMemo(() => {
    if (!activeTourId) return 0;
    return ALL_TOURS[activeTourId]?.steps.length ?? 0;
  }, [activeTourId]);

  const next = useCallback(() => {
    if (!activeTourId) return;
    const def = ALL_TOURS[activeTourId];
    if (!def) return;
    setStepIndex((i) => {
      const lastIndex = def.steps.length - 1;
      if (i >= lastIndex) {
        // Completar — dismiss + idle.
        void persistDismiss(def.id);
        setStatus('completed');
        return i;
      }
      return i + 1;
    });
  }, [activeTourId, persistDismiss]);

  const prev = useCallback(() => {
    setStepIndex((i) => (i > 0 ? i - 1 : 0));
  }, []);

  const skip = useCallback(() => {
    if (!activeTourId) return;
    void persistDismiss(activeTourId);
    setStatus('idle');
    setActiveTourId(null);
    setStepIndex(0);
  }, [activeTourId, persistDismiss]);

  const complete = useCallback(() => {
    if (!activeTourId) return;
    void persistDismiss(activeTourId);
    setStatus('completed');
  }, [activeTourId, persistDismiss]);

  const restart = useCallback(
    async (tourId: string) => {
      const next = new Set(dismissed);
      next.delete(tourId);
      setDismissed(next);
      writeLocalDismissed(userId, next);
      try {
        await restoreTourApi(tourId);
      } catch {
        // Sin red: localStorage ya lo borró; el próximo mount con
        // server detecta el drift y lo persiste.
      }
      autoStartedRef.current = false;
      // Solo arrancar acá si el usuario ya está en la home. Si está
      // en /me/preferencias o similar, navegamos a / y dejamos que
      // el auto-trigger del effect lo arranque en el mount del home
      // (donde los targets sí existen).
      if (pathname === '/') {
        start(tourId);
      } else {
        router.push('/');
      }
    },
    [dismissed, start, pathname, router, userId],
  );

  const value = useMemo(
    () => ({
      status,
      activeTourId,
      stepIndex,
      totalSteps,
      isResolving: false,
      start,
      next,
      prev,
      skip,
      complete,
      restart,
    }),
    [status, activeTourId, stepIndex, totalSteps, start, next, prev, skip, complete, restart],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
}
