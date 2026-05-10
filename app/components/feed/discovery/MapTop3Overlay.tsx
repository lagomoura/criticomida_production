'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faChevronDown,
  faChevronUp,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';
import type { MapRestaurantPin, MapSort } from '@/app/lib/types/discovery';

interface Props {
  pins: MapRestaurantPin[];
  sort: MapSort;
  onSelect?: (pin: MapRestaurantPin) => void;
}

function pinScore(pin: MapRestaurantPin, sort: MapSort): number {
  if (sort === 'value_prop') return pin.bestValueDish?.valuePropAvg ?? 0;
  if (sort === 'trending') return pin.trendingCount;
  return pin.goldenDish?.geekScore ?? pin.topGeekScore;
}

function pinDishName(pin: MapRestaurantPin, sort: MapSort): string | null {
  if (sort === 'value_prop') return pin.bestValueDish?.name ?? pin.goldenDish?.name ?? null;
  return pin.goldenDish?.name ?? null;
}

function pinDishCover(pin: MapRestaurantPin, sort: MapSort): string | null {
  if (sort === 'value_prop')
    return pin.bestValueDish?.coverImageUrl ?? pin.goldenDish?.coverImageUrl ?? null;
  return pin.goldenDish?.coverImageUrl ?? null;
}

export default function MapTop3Overlay({ pins, sort, onSelect }: Props) {
  const t = useTranslations('discovery.map');
  const [collapsed, setCollapsed] = useState(false);
  const SORT_LABEL: Record<MapSort, string> = {
    geek_score: t('top3HeadingGeek'),
    value_prop: t('top3HeadingValue'),
    trending: t('top3HeadingTrending'),
  };

  const top3 = useMemo(() => {
    return [...pins]
      .filter((p) => !p.isEmpty)
      .sort((a, b) => pinScore(b, sort) - pinScore(a, sort))
      .slice(0, 3);
  }, [pins, sort]);

  if (top3.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute right-3 top-14 z-10 w-[15rem] max-w-[60vw] overflow-hidden rounded-xl border border-border-default bg-surface-card/95 shadow-[var(--shadow-elevated)] backdrop-blur">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-2 border-b border-border-default px-3 py-2 text-left font-sans text-xs font-semibold text-text-primary hover:bg-surface-subtle"
      >
        <FontAwesomeIcon icon={faTrophy} className="text-[color:var(--color-terracota)] text-xs" aria-hidden />
        <span className="flex-1 truncate">{SORT_LABEL[sort]}</span>
        <FontAwesomeIcon
          icon={collapsed ? faChevronDown : faChevronUp}
          className="text-[10px] text-text-muted"
          aria-hidden
        />
      </button>
      {!collapsed && (
        <ol className="m-0 grid list-none gap-px bg-border-default p-0">
          {top3.map((pin, idx) => {
            const dishName = pinDishName(pin, sort);
            const cover = pinDishCover(pin, sort);
            const score = pinScore(pin, sort);
            return (
              <li key={pin.restaurantId} className="m-0">
                <button
                  type="button"
                  onClick={() => onSelect?.(pin)}
                  className="flex w-full items-center gap-2.5 bg-surface-card px-3 py-2 text-left transition-colors hover:bg-surface-subtle"
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                      idx === 0
                        ? 'bg-[color:var(--color-terracota)] text-white'
                        : 'bg-surface-subtle text-text-primary',
                    )}
                  >
                    {idx + 1}
                  </span>
                  {cover ? (
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-surface-subtle">
                      <Image src={cover} alt="" fill unoptimized sizes="36px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-text-muted">
                      <FontAwesomeIcon icon={faUtensils} className="text-xs" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-sans text-[12px] font-semibold leading-tight text-text-primary">
                      {dishName ?? pin.name}
                    </div>
                    <div className="truncate font-sans text-[11px] text-text-muted">
                      {pin.name}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[color:var(--color-terracota-pale)] px-1.5 py-0.5 font-sans text-[11px] font-semibold text-[color:var(--color-terracota)]">
                    {sort === 'trending'
                      ? `${Math.round(score)}↑`
                      : sort === 'value_prop'
                      ? score.toFixed(1)
                      : Math.round(score)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
