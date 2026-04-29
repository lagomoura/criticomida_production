'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faGem,
  faUtensils,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';
import type { MapDishHighlight, MapRestaurantPin } from '@/app/lib/types/discovery';

interface Props {
  pin: MapRestaurantPin;
}

/**
 * Card compacta que se renderiza dentro del Google InfoWindow al tocar un pin.
 * Diseñada para que el usuario decida en 2-3 segundos si quiere abrir la ficha:
 * hero visual → stats clave (rating · price · cuisine) → 2 platos destacados.
 *
 * Importante: los Links no cierran el InfoWindow en su onClick — `setState`
 * sincrónico ahí desmonta el portal antes que Next termine de capturar el
 * click y rompe la navegación. La navegación misma desmonta el mapa.
 */
export default function MapRestaurantPreviewBody({ pin }: Props) {
  const cuisineLabel = formatCuisine(pin.cuisineTypes, pin.categoryName);
  return (
    <div className="w-[22rem] max-w-[80vw] overflow-x-hidden pb-1.5 font-sans text-text-primary">
      {pin.coverImageUrl && (
        <div className="relative mb-2 h-24 w-full overflow-hidden rounded-md bg-surface-subtle">
          <Image
            src={pin.coverImageUrl}
            alt=""
            fill
            unoptimized
            sizes="352px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
            {pin.hasChefBadge && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-azafran)] px-2 py-0.5 text-[10px] font-semibold text-white shadow"
                title="Tiene un plato con ejecución técnica alta"
              >
                <FontAwesomeIcon icon={faStar} className="text-[9px]" aria-hidden /> Chef
              </span>
            )}
            {pin.hasGemBadge && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-albahaca)] px-2 py-0.5 text-[10px] font-semibold text-white shadow"
                title="Tiene un plato con excelente costo/beneficio"
              >
                <FontAwesomeIcon icon={faGem} className="text-[9px]" aria-hidden /> Ganga
              </span>
            )}
          </div>
        </div>
      )}

      <h3 className="m-0 line-clamp-1 font-display text-lg font-medium leading-tight">{pin.name}</h3>

      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
          <FontAwesomeIcon icon={faStar} className="text-[10px] text-[color:var(--color-azafran)]" aria-hidden />
          {pin.computedRating.toFixed(1)}
        </span>
        {pin.reviewCount > 0 && (
          <span>· {pin.reviewCount} {pin.reviewCount === 1 ? 'reseña' : 'reseñas'}</span>
        )}
        {pin.priceLevel !== null && (
          <span title={`Nivel de precio ${pin.priceLevel}/4`}>
            ·{' '}
            <span className="font-semibold text-text-primary">
              {'$'.repeat(Math.max(1, Math.min(4, pin.priceLevel)))}
            </span>
            <span className="text-text-muted/60">
              {'$'.repeat(Math.max(0, 4 - pin.priceLevel))}
            </span>
          </span>
        )}
        {cuisineLabel && (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5">
            {cuisineLabel}
          </span>
        )}
      </div>

      {pin.locationName && (
        <div className="mt-1 flex items-start gap-1.5 text-[11px] text-text-muted">
          <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 text-[10px]" aria-hidden />
          <span className="line-clamp-1">{pin.locationName}</span>
        </div>
      )}

      <div className="mt-3 grid gap-1.5">
        <DishHighlightRow
          label="Plato estrella"
          labelIcon={faStar}
          dish={pin.goldenDish}
          pillar="execution"
        />
        <DishHighlightRow
          label="Mejor C/B"
          labelIcon={faGem}
          dish={pin.bestValueDish}
          pillar="value"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <a
          href={`/restaurants/${pin.slug}`}
          className={cn(
            'inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold no-underline',
            'bg-action-primary text-text-inverse transition-colors hover:bg-action-primary-hover',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          )}
        >
          Ver ficha completa
        </a>
      </div>
    </div>
  );
}

interface DishHighlightRowProps {
  label: string;
  labelIcon: typeof faStar;
  dish: MapDishHighlight | null;
  pillar: 'execution' | 'value';
}

function DishHighlightRow({ label, labelIcon, dish, pillar }: DishHighlightRowProps) {
  const inner = (
    <>
      {dish?.coverImageUrl ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-card">
          <Image src={dish.coverImageUrl} alt="" fill unoptimized sizes="40px" className="object-cover" />
        </div>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-card text-text-muted">
          <FontAwesomeIcon icon={faUtensils} className="text-xs" aria-hidden />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          <FontAwesomeIcon icon={labelIcon} className="text-[9px]" aria-hidden />
          {label}
        </div>
        <div className="truncate text-[13px] font-semibold leading-tight">
          {dish?.name ?? <span className="text-text-muted">Sin datos suficientes</span>}
        </div>
      </div>
      {dish && (
        <PillarPill pillar={pillar} value={pillar === 'execution' ? dish.executionAvg : dish.valuePropAvg} />
      )}
    </>
  );

  const baseClass =
    'flex items-center gap-2.5 rounded-lg border border-border-default bg-surface-subtle p-1.5';

  if (!dish) {
    return <div className={baseClass}>{inner}</div>;
  }

  return (
    <a
      href={`/dishes/${dish.dishId}`}
      className={cn(
        baseClass,
        'group cursor-pointer no-underline transition-colors hover:bg-surface-card hover:border-[color:var(--color-azafran)]/40',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
      )}
    >
      {inner}
    </a>
  );
}

function PillarPill({ pillar, value }: { pillar: 'execution' | 'value'; value: number | null }) {
  if (value === null) return null;
  const tone = pillar === 'execution'
    ? 'bg-[color:var(--color-azafran-pale)] text-[color:var(--color-azafran)]'
    : 'bg-[color:var(--color-albahaca-pale)] text-[color:var(--color-albahaca)]';
  return (
    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', tone)}>
      {value.toFixed(1)}
    </span>
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
