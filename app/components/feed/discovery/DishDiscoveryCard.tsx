'use client';

import Image from 'next/image';
import { Link } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import WantToTryButton from '@/app/components/dishes/WantToTryButton';
import type { DiscoveryDishItem, DuelPillar } from '@/app/lib/types/social';

export interface DishDiscoveryCardProps {
  dish: DiscoveryDishItem;
  /** Habilita el CTA Quiero probarlo (hide cuando hay viewer anónimo). */
  onToggleWantToTry?: (dishId: string, next: boolean) => void;
  /** Pilar a destacar visualmente (ring dorado) en el card. Usado por el duelo. */
  highlightedPillar?: DuelPillar;
}

/**
 * Card unitaria de los rails de Descubrir. Muestra:
 * - foto de portada
 * - nombre del plato + restaurante
 * - chip Geek Score
 * - mini-bars de los 3 pilares (en escala 1..3)
 * - distancia (cuando está disponible)
 * - CTA Quiero probarlo
 */
export default function DishDiscoveryCard({
  dish,
  onToggleWantToTry,
  highlightedPillar,
}: DishDiscoveryCardProps) {
  const t = useTranslations('discovery.card');
  const ratingHighlighted = highlightedPillar === 'overall_rating';
  return (
    <article className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-3 shadow-sm sm:w-72">
      <Link
        href={`/dishes/${dish.dishId}`}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-subtle"
      >
        {dish.coverImageUrl ? (
          <Image
            src={dish.coverImageUrl}
            alt={dish.dishName}
            fill
            sizes="288px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-sans text-xs text-text-muted">
            {t('noPhoto')}
          </div>
        )}
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-terracota)] px-2 py-1 font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-text-inverse shadow">
          {Math.round(dish.geekScore)} <span className="opacity-80">{t('geekChip')}</span>
        </span>
      </Link>

      <div className="flex flex-col gap-1">
        <Link
          href={`/dishes/${dish.dishId}`}
          className="line-clamp-2 font-display text-base font-semibold text-text-primary no-underline hover:underline"
        >
          {dish.dishName}
        </Link>
        <Link
          href={`/restaurants/${encodeURIComponent(dish.restaurantSlug)}`}
          className="truncate font-sans text-xs text-text-muted no-underline hover:underline"
        >
          {dish.restaurantName}
          {dish.restaurantCity ? ` · ${dish.restaurantCity}` : ''}
        </Link>
      </div>

      <PillarMiniBars dish={dish} t={t} highlightedPillar={highlightedPillar} />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 font-sans text-xs text-text-muted">
          <span
            className={
              ratingHighlighted
                ? 'inline-flex items-center gap-1 rounded-full bg-[var(--color-dorado)]/15 px-2 py-0.5 font-semibold text-text-primary ring-1 ring-[var(--color-dorado)]'
                : undefined
            }
          >
            <span aria-hidden>★</span> {dish.computedRating.toFixed(1)}
          </span>
          <span>{t('reviews', { count: dish.reviewCount })}</span>
          {dish.distanceKm !== null && (
            <span className="inline-flex items-center gap-1">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="h-3 w-3"
                aria-hidden
              />
              {formatDistance(dish.distanceKm)}
            </span>
          )}
        </div>
      </div>

      {onToggleWantToTry && (
        <WantToTryButton
          dishId={dish.dishId}
          active={dish.wantToTry}
          onToggle={onToggleWantToTry}
          size="sm"
          className="self-stretch"
        />
      )}
    </article>
  );
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function PillarMiniBars({
  dish,
  t,
  highlightedPillar,
}: {
  dish: DiscoveryDishItem;
  t: ReturnType<typeof useTranslations<'discovery.card'>>;
  highlightedPillar?: DuelPillar;
}) {
  const pillars: Array<{
    key: DuelPillar;
    label: string;
    avg: number | null;
    n: number;
  }> = [
    {
      key: 'execution',
      label: t('pillarExec'),
      avg: dish.pillars.executionAvg,
      n: dish.pillars.executionN,
    },
    {
      key: 'value_prop',
      label: t('pillarValue'),
      avg: dish.pillars.valuePropAvg,
      n: dish.pillars.valuePropN,
    },
    {
      key: 'presentation',
      label: t('pillarPres'),
      avg: dish.pillars.presentationAvg,
      n: dish.pillars.presentationN,
    },
  ];
  return (
    <div className="flex gap-2">
      {pillars.map((p) => {
        const active = highlightedPillar === p.key;
        return (
          <div
            key={p.key}
            className={
              active
                ? 'flex flex-1 flex-col gap-1 rounded-lg border border-[var(--color-dorado)] bg-[var(--color-dorado)]/10 px-2 py-1.5 ring-1 ring-[var(--color-dorado)]/40'
                : 'flex flex-1 flex-col gap-1 rounded-lg border border-border-subtle bg-surface-subtle px-2 py-1.5'
            }
          >
            <span className="font-sans text-[0.65rem] uppercase tracking-wider text-text-muted">
              {p.label}
            </span>
            <PillarBar avg={p.avg} active={active} />
            <span className="font-sans text-[0.65rem] text-text-muted">
              {p.avg !== null ? p.avg.toFixed(1) : '—'}/3 · {p.n}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PillarBar({ avg, active = false }: { avg: number | null; active?: boolean }) {
  if (avg === null) {
    return <span className="block h-1.5 rounded-full bg-border-subtle" />;
  }
  // 1..3 → 0..100%.
  const pct = Math.max(0, Math.min(100, ((avg - 1) / 2) * 100));
  return (
    <span className="block h-1.5 overflow-hidden rounded-full bg-border-subtle">
      <span
        className={
          active
            ? 'block h-full rounded-full bg-[var(--color-dorado)] transition-[width]'
            : 'block h-full rounded-full bg-[var(--color-terracota)] transition-[width]'
        }
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}
