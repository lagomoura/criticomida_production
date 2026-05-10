'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faGem, faPlus, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';
import Tooltip from '@/app/components/ui/Tooltip';
import type { MapRestaurantPin } from '@/app/lib/types/discovery';

interface Props {
  pin: MapRestaurantPin;
  selected?: boolean;
}

/**
 * Photo-first 3D marker. El pin del restaurante ES la foto del plato
 * estrella del local — comunica "acá hay comida" sin texto. Encima orbitan
 * los halos de Chef/Gem, en una esquina flota un chip con el Geek Score
 * (con tooltip explicativo), y debajo un teardrop ancla el marker al mapa.
 *
 * Sombra de doble capa (close + ambient) para sensación de elevación.
 * Sin foto disponible: fallback a un círculo azafrán pálido con utensilios.
 */
export default function RestaurantMapPin({ pin, selected = false }: Props) {
  const t = useTranslations('discovery.map');
  if (pin.isEmpty) {
    return <EmptyPin name={pin.name} selected={selected} />;
  }

  const score = Math.round(pin.topGeekScore);
  const cover = pin.goldenDish?.coverImageUrl ?? null;
  const dishName = pin.goldenDish?.name ?? t('pinDefaultDish');

  return (
    <div
      role="button"
      aria-label={t('pinAriaLabelDish', { name: pin.name, score, dish: dishName })}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center transition-transform',
        'motion-safe:[transition-timing-function:var(--ease-standard)] motion-safe:duration-150',
        selected ? 'scale-110' : 'hover:-translate-y-1 hover:scale-105',
      )}
    >
      {/* Halos arriba — orbitan separados, no compiten con la foto */}
      {(pin.hasChefBadge || pin.hasGemBadge) && (
        <div className="pointer-events-auto mb-1.5 flex items-center gap-1">
          {pin.hasChefBadge && <ChefHalo />}
          {pin.hasGemBadge && <GemHalo />}
        </div>
      )}

      {/* Cuerpo del pin: foto circular del golden dish con sombra 3D.
          El Geek Score no se muestra en el pin (el número solo no comunica) —
          aparece como chip etiquetado al lado del nombre del restaurante en
          el preview que se abre al click. */}
      <div
        className={cn(
          'relative h-16 w-16 overflow-hidden rounded-full border-[3px] border-surface-card',
          'bg-[color:var(--color-terracota-pale)] text-[color:var(--color-terracota)]',
          // Doble sombra: contacto + ambient. Da sensación de objeto flotando
          // sobre el mapa en lugar de pegado.
          'shadow-[0_8px_18px_-6px_rgba(0,0,0,0.35),0_3px_6px_-2px_rgba(0,0,0,0.18)]',
          'transition-shadow',
          selected && 'shadow-[0_12px_24px_-8px_rgba(0,0,0,0.45),0_4px_8px_-2px_rgba(0,0,0,0.22)]',
          selected && 'ring-[3px] ring-[color:var(--color-terracota)]',
        )}
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            unoptimized
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FontAwesomeIcon icon={faUtensils} className="text-lg" aria-hidden />
          </div>
        )}
      </div>

      {/* Anchor teardrop: triángulo apuntando al punto exacto del mapa */}
      <span
        aria-hidden
        className="-mt-1 inline-block h-0 w-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid var(--color-terracota)',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
        }}
      />
    </div>
  );
}

function ChefHalo() {
  const t = useTranslations('discovery.map');
  return (
    <Tooltip
      portal
      multiline
      label={
        <>
          <strong className="font-semibold">{t('chefBadge')}.</strong>{' '}
          {t('chefBadgeDescription')}
        </>
      }
    >
      <span
        tabIndex={0}
        aria-label={t('chefBadge')}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-terracota)] text-white shadow-md ring-2 ring-surface-card"
      >
        <FontAwesomeIcon icon={faStar} className="text-[11px]" aria-hidden />
      </span>
    </Tooltip>
  );
}

function GemHalo() {
  const t = useTranslations('discovery.map');
  return (
    <Tooltip
      portal
      multiline
      label={
        <>
          <strong className="font-semibold">{t('gemBadge')}.</strong>{' '}
          {t('gemBadgeDescription')}
        </>
      }
    >
      <span
        tabIndex={0}
        aria-label={t('gemBadge')}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-dorado)] text-white shadow-md ring-2 ring-surface-card"
      >
        <FontAwesomeIcon icon={faGem} className="text-[11px]" aria-hidden />
      </span>
    </Tooltip>
  );
}

interface EmptyPinProps {
  name: string;
  selected: boolean;
}

/**
 * Pin "missing spot" para restaurantes sin reviews. Mismo lenguaje visual
 * (círculo + teardrop) pero en tono neutro, dashed, con "+" como invitación
 * a ser el primero en reseñar.
 */
function EmptyPin({ name, selected }: EmptyPinProps) {
  const t = useTranslations('discovery.map');
  return (
    <div
      role="button"
      aria-label={t('emptyPinAria', { name })}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center transition-transform',
        'motion-safe:duration-150',
        selected ? 'scale-110' : 'hover:-translate-y-0.5 hover:scale-105',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed bg-surface-card text-text-muted',
          'border-text-muted/60',
          'shadow-[0_4px_10px_-3px_rgba(0,0,0,0.25)]',
          selected &&
            'ring-[3px] ring-[color:var(--color-dorado)]',
        )}
      >
        <FontAwesomeIcon icon={faPlus} className="text-xs" aria-hidden />
      </div>
      <span
        aria-hidden
        className="-mt-0.5 inline-block h-0 w-0"
        style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '6px solid rgba(0,0,0,0.25)',
        }}
      />
    </div>
  );
}
