'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faGem, faFire, faPlus } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';
import type { MapSort } from '@/app/lib/types/discovery';

interface Props {
  sort: MapSort;
  onSortChange: (next: MapSort) => void;
  includeEmpty: boolean;
  onIncludeEmptyChange: (next: boolean) => void;
}

const SORT_OPTIONS: ReadonlyArray<{ value: MapSort; label: string; icon: typeof faStar }> = [
  { value: 'geek_score', label: 'Mejor cocina', icon: faStar },
  { value: 'value_prop', label: 'Mejor C/B', icon: faGem },
  { value: 'trending', label: 'Trending 48h', icon: faFire },
];

export default function MapLayerChips({
  sort,
  onSortChange,
  includeEmpty,
  onIncludeEmptyChange,
}: Props) {
  return (
    <div
      role="toolbar"
      aria-label="Capas del mapa"
      className="pointer-events-auto absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1.5"
    >
      {SORT_OPTIONS.map((opt) => {
        const active = opt.value === sort;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSortChange(opt.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-sans text-xs font-medium shadow-sm backdrop-blur transition-colors',
              active
                ? 'border-[color:var(--color-azafran)] bg-[color:var(--color-azafran)] text-white'
                : 'border-border-default bg-surface-card/95 text-text-primary hover:bg-surface-subtle',
            )}
          >
            <FontAwesomeIcon icon={opt.icon} className="text-[10px]" aria-hidden />
            {opt.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onIncludeEmptyChange(!includeEmpty)}
        aria-pressed={includeEmpty}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-sans text-xs font-medium shadow-sm backdrop-blur transition-colors',
          includeEmpty
            ? 'border-[color:var(--color-albahaca)] bg-[color:var(--color-albahaca)] text-white'
            : 'border-border-default bg-surface-card/95 text-text-primary hover:bg-surface-subtle',
        )}
        title="Mostrar locales sin reviews — sé el primero"
      >
        <FontAwesomeIcon icon={faPlus} className="text-[10px]" aria-hidden />
        Sin reviews
      </button>
    </div>
  );
}
