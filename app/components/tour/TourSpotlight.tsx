'use client';

import type { CSSProperties } from 'react';

/**
 * Backdrop oscuro semitransparente con un "agujero" rectangular
 * alrededor del target. Técnica: un `<div>` absoluto del tamaño del
 * target + ``box-shadow: 0 0 0 9999px <espresso/0.7>`` que pinta
 * el resto de la pantalla.
 *
 * Sin target ⇒ backdrop full-screen sin agujero (steps "welcome"/
 * "closing" centrados).
 *
 * ``pointer-events: auto`` para que clicks fuera del tooltip queden
 * tragados por el backdrop — el target no debe ser clickable durante
 * el tour.
 */

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourSpotlightProps {
  rect: SpotlightRect | null;
  /** Padding visual alrededor del target. Default 8px. */
  padding?: number;
  /** Si true, deshabilita la transición — para prefers-reduced-motion. */
  reducedMotion?: boolean;
}

const Z_INDEX = 2147483646;
const BACKDROP_COLOR = 'rgba(42, 33, 28, 0.72)';

export default function TourSpotlight({
  rect,
  padding = 8,
  reducedMotion = false,
}: TourSpotlightProps) {
  if (!rect) {
    return (
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: BACKDROP_COLOR,
          pointerEvents: 'auto',
          zIndex: Z_INDEX,
        }}
      />
    );
  }

  const top = Math.max(rect.top - padding, 0);
  const left = Math.max(rect.left - padding, 0);
  const width = rect.width + padding * 2;
  const height = rect.height + padding * 2;

  // Glow cálido en tono Terracota-light + halo más difuso color crema-rosa,
  // apilado sobre el backdrop oscuro. El primer shadow se pinta más cerca
  // del borde del agujero: da la sensación de "luz que sale del spotlight"
  // sin gritar amarillo. Coherente con el degradé del FeedWelcome
  // ("Cada plato, su reseña").
  const style: CSSProperties = {
    position: 'fixed',
    top,
    left,
    width,
    height,
    borderRadius: 12,
    boxShadow: [
      '0 0 18px 2px rgba(224, 122, 95, 0.70)',
      '0 0 36px 10px rgba(255, 210, 188, 0.40)',
      `0 0 0 9999px ${BACKDROP_COLOR}`,
    ].join(', '),
    border: '2px solid var(--color-terracota-light)',
    pointerEvents: 'auto',
    zIndex: Z_INDEX,
    transition: reducedMotion
      ? 'none'
      : 'top 220ms var(--ease-standard), left 220ms var(--ease-standard), width 220ms var(--ease-standard), height 220ms var(--ease-standard)',
  };

  return <div aria-hidden style={style} />;
}
