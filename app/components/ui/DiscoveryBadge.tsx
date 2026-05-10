import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompass } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';

export interface DiscoveryBadgeProps {
  rank: 1 | 2 | 3;
  /** 'compact' = "#1", 'full' = "Cronista #1". */
  variant?: 'compact' | 'full';
  className?: string;
}

/** Oro / plata / bronce. #1 es el premio narrativo: el cronista fundador. */
const STYLE: Record<1 | 2 | 3, string> = {
  1: 'border-[color:var(--color-terracota)] bg-[color:var(--color-terracota)] text-white',
  2: 'border-[color:var(--color-espresso-soft)]/40 bg-[color:var(--color-crema-darker)] text-[color:var(--color-espresso-mid)]',
  3: 'border-[color:var(--color-terracota-deep)]/45 bg-[color:var(--color-terracota-deep)]/15 text-[color:var(--color-terracota-deep)]',
};

const TOOLTIP: Record<1 | 2 | 3, string> = {
  1: 'Cronista fundador · primer reseñador del plato.',
  2: 'Segundo cronista · entre los primeros 3 en reseñar este plato.',
  3: 'Tercer cronista · entre los primeros 3 en reseñar este plato.',
};

export default function DiscoveryBadge({
  rank,
  variant = 'full',
  className,
}: DiscoveryBadgeProps) {
  const label = variant === 'compact' ? `#${rank}` : `Cronista #${rank}`;
  return (
    <span
      role="img"
      aria-label={`${label}. ${TOOLTIP[rank]}`}
      title={TOOLTIP[rank]}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-sans text-[10.5px] font-semibold uppercase tracking-[0.1em]',
        STYLE[rank],
        className,
      )}
    >
      <FontAwesomeIcon icon={faCompass} className="h-2.5 w-2.5" aria-hidden />
      <span className="leading-none">{label}</span>
    </span>
  );
}
