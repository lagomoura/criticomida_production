'use client';

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/app/lib/utils/cn';

type Side = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  label: ReactNode;
  /** Side relative to the trigger. Default 'top'. */
  side?: Side;
  /** Delay before showing (ms). Default 250ms — feels responsive without being noisy. */
  delay?: number;
  /** Cuando true, permite envolver texto largo en lugar de mantenerlo en una sola línea.
   * Limita el ancho a ~280px y alinea a la izquierda. Útil para descripciones de sellos / badges. */
  multiline?: boolean;
  /** Cuando true, el tooltip se renderiza en `document.body` via Portal con
   * posicionamiento fixed. Necesario cuando el trigger está dentro de un
   * overlay con clipping/z-index propio (Google Maps markers, modales, etc.). */
  portal?: boolean;
  children: ReactElement;
}

const sideClass: Record<Side, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
};

export default function Tooltip({
  label,
  side = 'top',
  delay = 250,
  multiline = false,
  portal = false,
  children,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<
    { top: number; left: number; resolvedSide: Side } | null
  >(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeCoords = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();

    // Estimación generosa para multiline (texto largo puede crecer hasta ~120px).
    // Si no hay espacio en el lado pedido, flippeamos al opuesto para evitar
    // que el tooltip se renderice fuera del viewport (un problema típico de
    // pines cerca del borde del mapa).
    const TIP_HEIGHT = multiline ? 120 : 36;
    const MARGIN = 8;
    let resolvedSide: Side = side;
    if (side === 'top' && rect.top < TIP_HEIGHT + MARGIN) {
      resolvedSide = 'bottom';
    } else if (
      side === 'bottom' &&
      rect.bottom + TIP_HEIGHT + MARGIN > window.innerHeight
    ) {
      resolvedSide = 'top';
    }

    const x = rect.left + rect.width / 2;
    const top =
      resolvedSide === 'top'
        ? rect.top
        : resolvedSide === 'bottom'
          ? rect.bottom
          : rect.top + rect.height / 2;
    const left =
      resolvedSide === 'left'
        ? rect.left
        : resolvedSide === 'right'
          ? rect.right
          : x;
    setCoords({ top, left, resolvedSide });
  }, [side, multiline]);

  const show = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (portal) computeCoords();
      setOpen(true);
    }, delay);
  }, [delay, portal, computeCoords]);

  const hide = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setOpen(false);
  }, []);

  // Si el trigger está dentro de un mapa que panea / scrollea, recalculamos
  // mientras el tooltip está abierto. Bajo costo: solo se ejecuta cuando hay
  // tooltip visible.
  useEffect(() => {
    if (!open || !portal) return;
    const update = () => computeCoords();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, portal, computeCoords]);

  if (!isValidElement(children)) return children;

  const triggerProps = (children.props ?? {}) as Record<string, unknown>;
  const cloned = cloneElement(children as ReactElement<Record<string, unknown>>, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: (e: unknown) => {
      (triggerProps.onMouseEnter as ((ev: unknown) => void) | undefined)?.(e);
      show();
    },
    onMouseLeave: (e: unknown) => {
      (triggerProps.onMouseLeave as ((ev: unknown) => void) | undefined)?.(e);
      hide();
    },
    onFocus: (e: unknown) => {
      (triggerProps.onFocus as ((ev: unknown) => void) | undefined)?.(e);
      show();
    },
    onBlur: (e: unknown) => {
      (triggerProps.onBlur as ((ev: unknown) => void) | undefined)?.(e);
      hide();
    },
  });

  const tooltipBody = (
    <span
      role="tooltip"
      id={id}
      className={cn(
        // inline-block es necesario porque cuando se renderiza vía portal,
        // el span queda fuera de su contexto flex original y por default es
        // inline — los inline no respetan max-width y el texto multiline
        // se estira en una sola línea larga.
        'pointer-events-none inline-block rounded-md px-2 py-1 font-sans text-xs font-medium',
        // `text-text-inverse` está hardcodeado a blanco en ambos temas; en dark
        // el fondo (`bg-text-primary`) se vuelve claro → texto blanco ilegible.
        // `text-surface-page` invierte correctamente con `text-primary` y mantiene
        // contraste alto en light y dark.
        'bg-text-primary text-surface-page shadow-[var(--shadow-elevated)]',
        'motion-safe:animate-[tooltip-in_140ms_var(--ease-standard)]',
        multiline
          ? 'w-max max-w-[18rem] whitespace-normal text-left leading-snug'
          : 'whitespace-nowrap',
      )}
    >
      {label}
    </span>
  );

  return (
    <span ref={wrapperRef} className="relative inline-flex">
      {cloned}
      {open && !portal && (
        <span className={cn('pointer-events-none absolute z-50', sideClass[side])}>
          {tooltipBody}
        </span>
      )}
      {open && portal && coords && typeof document !== 'undefined' &&
        createPortal(
          <span
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform:
                coords.resolvedSide === 'top'
                  ? 'translate(-50%, calc(-100% - 8px))'
                  : coords.resolvedSide === 'bottom'
                    ? 'translate(-50%, 8px)'
                    : coords.resolvedSide === 'left'
                      ? 'translate(calc(-100% - 8px), -50%)'
                      : 'translate(8px, -50%)',
              // z-index máximo razonable. Google Maps usa valores altos en sus
              // overlays — esto se asegura de quedar encima de cualquier capa.
              zIndex: 2147483647,
            }}
          >
            {tooltipBody}
          </span>,
          document.body,
        )}
      <style>{`
        @keyframes tooltip-in {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}
