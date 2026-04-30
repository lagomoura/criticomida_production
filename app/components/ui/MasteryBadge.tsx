import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSeedling, faWineGlass, faCrown } from '@fortawesome/free-solid-svg-icons';
import type { MasteryLevel } from '@/app/lib/types/social';
import { cn } from '@/app/lib/utils/cn';

export interface MasteryBadgeProps {
  level: MasteryLevel;
  /** 'compact' = solo título ("Sommelier"). 'full' = "Sommelier de Pizza".
   *  En compact, `category` no se renderiza y puede omitirse. */
  variant?: 'compact' | 'full';
  category?: string;
  className?: string;
}

const COPY: Record<MasteryLevel, { title: string; tooltip: string }> = {
  apprentice: {
    title: 'Aprendiz',
    tooltip: 'Aprendiz · 3+ reseñas con buen criterio en esta categoría.',
  },
  sommelier: {
    title: 'Sommelier',
    tooltip: 'Sommelier · 10+ reseñas y promedio sólido. Voz reconocida en la categoría.',
  },
  master: {
    title: 'Maestro',
    tooltip: 'Maestro · 25+ reseñas con promedio alto. Autoridad indiscutida en la categoría.',
  },
};

const ICON: Record<MasteryLevel, typeof faSeedling> = {
  apprentice: faSeedling,
  sommelier: faWineGlass,
  master: faCrown,
};

/** Estilo escalonado: aprendiz suave (canela), sommelier azafrán, maestro azafrán fuerte. */
const STYLE: Record<MasteryLevel, string> = {
  apprentice:
    'border-[color:var(--color-canela)]/35 bg-[color:var(--color-canela)]/10 text-[color:var(--color-canela)]',
  sommelier:
    'border-[color:var(--color-azafran)]/40 bg-[color:var(--color-azafran)]/12 text-[color:var(--color-azafran)]',
  master:
    'border-[color:var(--color-azafran)] bg-[color:var(--color-azafran)] text-white shadow-[0_1px_0_rgba(0,0,0,0.05)]',
};

export default function MasteryBadge({
  level,
  category,
  variant = 'full',
  className,
}: MasteryBadgeProps) {
  const { title, tooltip } = COPY[level];
  const label =
    variant === 'compact' || !category ? title : `${title} de ${category}`;
  // Sin `title` HTML: si el caller quiere un tooltip visible, envuelve con
  // <Tooltip>. Mantener el title nativo se duplicaba con el tooltip externo
  // del FeaturedTitleBadge en hover lento. La descripción queda en aria-label
  // para que screen readers la lean.
  return (
    <span
      role="img"
      aria-label={`${label}. ${tooltip}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.08em]',
        STYLE[level],
        className,
      )}
    >
      <FontAwesomeIcon icon={ICON[level]} className="h-2.5 w-2.5" aria-hidden />
      <span className="leading-none">{label}</span>
    </span>
  );
}
