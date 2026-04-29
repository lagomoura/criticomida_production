'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faStar, faGem, faPlus } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';
import type { MapRestaurantPin } from '@/app/lib/types/discovery';

interface Props {
  pin: MapRestaurantPin;
  selected?: boolean;
}

export default function RestaurantMapPin({ pin, selected }: Props) {
  const score = Math.round(pin.topGeekScore);

  if (pin.isEmpty) {
    return (
      <div
        className={cn(
          'group relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-[1.5px]',
          'border-dashed border-text-muted/70 bg-surface-card/95 text-text-muted shadow',
          'transition-transform',
          selected
            ? 'scale-110 ring-2 ring-[color:var(--color-albahaca)] ring-offset-2 ring-offset-surface-card'
            : 'hover:scale-110',
        )}
        role="button"
        aria-label={`${pin.name} — sin reviews aún`}
      >
        <FontAwesomeIcon icon={faPlus} className="text-[10px]" aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full',
        'border-2 bg-surface-card text-[color:var(--color-albahaca)] shadow-[var(--shadow-elevated)]',
        'border-[color:var(--color-albahaca)] transition-transform',
        selected ? 'scale-110 ring-2 ring-[color:var(--color-azafran)] ring-offset-2 ring-offset-surface-card' : 'hover:scale-110',
      )}
      role="button"
      aria-label={`${pin.name} — geek score ${score}`}
    >
      <FontAwesomeIcon icon={faUtensils} className="text-sm" aria-hidden />
      {pin.hasChefBadge && (
        <span
          aria-hidden
          className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-azafran)] text-white shadow"
          title="Tiene un plato con ejecución técnica alta"
        >
          <FontAwesomeIcon icon={faStar} className="text-[8px]" />
        </span>
      )}
      {pin.hasGemBadge && (
        <span
          aria-hidden
          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-albahaca)] text-white shadow"
          title="Tiene un plato con excelente costo/beneficio"
        >
          <FontAwesomeIcon icon={faGem} className="text-[8px]" />
        </span>
      )}
    </div>
  );
}
