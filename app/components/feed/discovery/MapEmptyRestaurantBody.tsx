'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faPlus,
  faSeedling,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';
import type { MapRestaurantPin } from '@/app/lib/types/discovery';

interface Props {
  pin: MapRestaurantPin;
}

/**
 * Card mínima para pines de "missing spot" — locales sin reviews.
 * El CTA lleva a la ficha del restaurante donde el usuario puede agregar
 * el primer plato. No mostramos rating ni stats porque no hay nada que
 * mostrar; el foco es el llamado a la acción.
 */
export default function MapEmptyRestaurantBody({ pin }: Props) {
  const t = useTranslations('discovery.map');
  const cuisineLabel = formatCuisine(pin.cuisineTypes, pin.categoryName);
  return (
    <div className="w-[18rem] max-w-[78vw] overflow-x-hidden pb-1.5 font-sans text-text-primary">
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-dorado-pale)] px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-dorado)]">
        <FontAwesomeIcon icon={faSeedling} className="text-[10px]" aria-hidden />
        {t('noReviewsKicker')}
      </div>

      <h3 className="m-0 line-clamp-1 font-display text-lg font-medium leading-tight">{pin.name}</h3>

      {cuisineLabel && (
        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 font-sans text-[11px] text-text-muted">
          {cuisineLabel}
        </div>
      )}

      {pin.locationName && (
        <div className="mt-2 flex items-start gap-1.5 text-[11px] text-text-muted">
          <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 text-[10px]" aria-hidden />
          <span className="line-clamp-2">{pin.locationName}</span>
        </div>
      )}

      <p className="mt-3 m-0 font-sans text-xs text-text-muted">
        {t('addFirstDish')} <span className="font-semibold text-text-primary">{t('reputationBoost')}</span>.
      </p>

      <div className="mt-3 flex justify-end">
        <a
          href={`/restaurants/${pin.slug}`}
          className={cn(
            'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 font-sans text-xs font-semibold no-underline',
            'bg-[color:var(--color-dorado)] text-white transition-colors hover:bg-[color:var(--color-dorado-light)]',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          )}
        >
          <FontAwesomeIcon icon={faPlus} className="text-[10px]" aria-hidden />
          {t('beFirstCta')}
        </a>
      </div>
    </div>
  );
}

function formatCuisine(cuisineTypes: string[] | null, categoryName: string | null): string | null {
  if (cuisineTypes && cuisineTypes.length > 0) {
    return cuisineTypes[0]
      .replace(/_/g, ' ')
      .replace(/(^|\s)\w/g, (c) => c.toUpperCase());
  }
  return categoryName;
}
