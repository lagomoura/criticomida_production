'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTour } from './useTour';
import { ALL_TOURS, type TourPlacement, type TourStep } from './tour-steps';
import TourSpotlight, { type SpotlightRect } from './TourSpotlight';
import TourTooltip, { type TooltipPosition } from './TourTooltip';

const TOOLTIP_WIDTH = 360;
const TOOLTIP_HEIGHT_EST = 260;
const GAP = 16;
const MARGIN = 16;
const TARGET_TIMEOUT_MS = 2000;

type SidePlacement = 'top' | 'bottom' | 'left' | 'right';

function resolveTarget(tourId: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const candidates = document.querySelectorAll<HTMLElement>(`[data-tour-id="${tourId}"]`);
  for (const el of Array.from(candidates)) {
    // checkVisibility() es lo más confiable en navegadores modernos
    // (Chrome 105+, Safari 17.4+, Firefox 125+). Cubre display:none
    // de ancestros, opacity 0 y visibility hidden — algo que
    // offsetParent solo no hace bien con position:fixed (caso de
    // BottomNav en mobile).
    if (typeof el.checkVisibility === 'function') {
      try {
        if (el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) return el;
        }
        continue;
      } catch {
        /* fallthrough al fallback */
      }
    }
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && el.offsetParent !== null) return el;
  }
  return null;
}

function pickAutoPlacement(rect: DOMRect, isMobile: boolean): SidePlacement {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const spaceBottom = vh - rect.bottom - GAP;
  const spaceTop = rect.top - GAP;
  const spaceRight = vw - rect.right - GAP;
  const spaceLeft = rect.left - GAP;

  if (spaceBottom >= TOOLTIP_HEIGHT_EST + MARGIN) return 'bottom';
  if (spaceTop >= TOOLTIP_HEIGHT_EST + MARGIN) return 'top';
  if (!isMobile) {
    if (spaceRight >= TOOLTIP_WIDTH + MARGIN) return 'right';
    if (spaceLeft >= TOOLTIP_WIDTH + MARGIN) return 'left';
  }
  // Fallback: poner arriba si el target está en la mitad inferior
  // (caso típico del BottomNav), bottom si no.
  return rect.top > vh / 2 ? 'top' : 'bottom';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computeTooltipPosition(
  rect: DOMRect | null,
  placement: TourPlacement,
  width: number,
): TooltipPosition {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const isMobile = vw < 768;

  if (!rect || placement === 'center') {
    return {
      top: Math.max((vh - TOOLTIP_HEIGHT_EST) / 2, MARGIN),
      left: Math.max((vw - width) / 2, MARGIN),
      transformOrigin: 'center',
    };
  }

  const resolved: SidePlacement =
    placement === 'auto' ? pickAutoPlacement(rect, isMobile) : placement;

  switch (resolved) {
    case 'bottom': {
      const left = clamp(
        rect.left + rect.width / 2 - width / 2,
        MARGIN,
        vw - width - MARGIN,
      );
      return {
        top: rect.bottom + GAP,
        left,
        transformOrigin: 'top center',
      };
    }
    case 'top': {
      const left = clamp(
        rect.left + rect.width / 2 - width / 2,
        MARGIN,
        vw - width - MARGIN,
      );
      return {
        top: Math.max(rect.top - TOOLTIP_HEIGHT_EST - GAP, MARGIN),
        left,
        transformOrigin: 'bottom center',
      };
    }
    case 'right': {
      const top = clamp(
        rect.top + rect.height / 2 - TOOLTIP_HEIGHT_EST / 2,
        MARGIN,
        vh - TOOLTIP_HEIGHT_EST - MARGIN,
      );
      return {
        top,
        left: Math.min(rect.right + GAP, vw - width - MARGIN),
        transformOrigin: 'center left',
      };
    }
    case 'left': {
      const top = clamp(
        rect.top + rect.height / 2 - TOOLTIP_HEIGHT_EST / 2,
        MARGIN,
        vh - TOOLTIP_HEIGHT_EST - MARGIN,
      );
      return {
        top,
        left: Math.max(rect.left - width - GAP, MARGIN),
        transformOrigin: 'center right',
      };
    }
  }
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

function useViewportWidth(): number {
  // Inicial estable entre SSR y primer client render para evitar
  // hydration mismatch; el efecto pisa con el valor real.
  const [w, setW] = useState(1024);
  useEffect(() => {
    setW(window.innerWidth);
    const handler = () => setW(window.innerWidth);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);
  return w;
}

/** Aplica ``inert`` a todos los siblings del overlay para neutralizar
 *  focus/hover/click fuera del card mientras el tour corre. */
function useInertSiblings(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (typeof document === 'undefined') return;
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el.dataset.tourRoot === undefined,
    );
    const restored: Array<{ el: HTMLElement; had: boolean }> = [];
    for (const el of siblings) {
      const had = el.hasAttribute('inert');
      el.setAttribute('inert', '');
      restored.push({ el, had });
    }
    return () => {
      for (const { el, had } of restored) {
        if (!had) el.removeAttribute('inert');
      }
    };
  }, [active]);
}

export default function TourOverlay() {
  const { status, activeTourId, stepIndex, totalSteps, next, prev, skip } = useTour();
  const viewportWidth = useViewportWidth();
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [targetMissing, setTargetMissing] = useState(false);
  const targetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = status === 'running' && Boolean(activeTourId);
  useInertSiblings(isActive);

  const step: TourStep | null = useMemo(() => {
    if (!activeTourId) return null;
    const def = ALL_TOURS[activeTourId];
    if (!def) return null;
    return def.steps[stepIndex] ?? null;
  }, [activeTourId, stepIndex]);

  // ─────────────────────────────────────────────────────────────────
  //   Resolver target + medirlo. Re-medición en scroll/resize/mutation.
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || !step) {
      setRect(null);
      setTargetMissing(false);
      return;
    }
    if (!step.targetTourId) {
      // Step centrado: sin target, sin medición.
      setRect(null);
      setTargetMissing(false);
      return;
    }

    let frame = 0;
    let targetEl: HTMLElement | null = null;
    let resizeObs: ResizeObserver | null = null;
    let mutObs: MutationObserver | null = null;

    const measure = () => {
      if (!targetEl) return;
      setRect(targetEl.getBoundingClientRect());
    };

    const scheduleMeasure = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const tryResolve = () => {
      const found = resolveTarget(step.targetTourId!);
      if (!found) {
        return false;
      }
      if (found === targetEl) {
        measure();
        return true;
      }
      // Nuevo target — re-armar observers
      if (resizeObs) resizeObs.disconnect();
      targetEl = found;
      setTargetMissing(false);

      // Scroll al centro del viewport si está fuera.
      try {
        targetEl.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      } catch {
        /* viejos navegadores que ignoran options */
      }

      resizeObs = new ResizeObserver(scheduleMeasure);
      resizeObs.observe(targetEl);
      measure();
      return true;
    };

    // Primer intento sincrónico.
    const resolved = tryResolve();

    // Si no se resolvió, observar el DOM hasta que aparezca o time out.
    if (!resolved) {
      mutObs = new MutationObserver(() => {
        if (tryResolve() && mutObs) {
          mutObs.disconnect();
          mutObs = null;
        }
      });
      mutObs.observe(document.body, { childList: true, subtree: true });

      if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
      targetTimerRef.current = setTimeout(() => {
        if (!targetEl) {
          setTargetMissing(true);
          if (mutObs) {
            mutObs.disconnect();
            mutObs = null;
          }
        }
      }, TARGET_TIMEOUT_MS);
    }

    const onScroll = () => scheduleMeasure();
    const onResize = () => scheduleMeasure();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (resizeObs) resizeObs.disconnect();
      if (mutObs) mutObs.disconnect();
      if (targetTimerRef.current) {
        clearTimeout(targetTimerRef.current);
        targetTimerRef.current = null;
      }
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isActive, step, reducedMotion]);

  // Si el target no aparece después del timeout, avanzar al siguiente step.
  useEffect(() => {
    if (!targetMissing) return;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[tour] target no encontrado para step ${step?.id} — avanzando`);
    }
    setTargetMissing(false);
    next();
  }, [targetMissing, next, step?.id]);

  // ESC ⇒ skip.
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        skip();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [isActive, skip]);

  if (!mounted || !isActive || !step) return null;

  const tooltipWidth = Math.min(TOOLTIP_WIDTH, viewportWidth - 32);
  const position = computeTooltipPosition(rect, step.placement, tooltipWidth);
  const spotlightRect: SpotlightRect | null =
    rect && step.targetTourId
      ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      : null;

  return createPortal(
    <div data-tour-root="">
      <TourSpotlight rect={spotlightRect} reducedMotion={reducedMotion} />
      <TourTooltip
        titleKey={step.i18nKey}
        bodyKey={step.i18nKey}
        currentStep={stepIndex}
        totalSteps={totalSteps}
        isFirst={stepIndex === 0}
        isLast={stepIndex === totalSteps - 1}
        position={position}
        reducedMotion={reducedMotion}
        onPrev={prev}
        onNext={next}
        onSkip={skip}
      />
    </div>,
    document.body,
  );
}
