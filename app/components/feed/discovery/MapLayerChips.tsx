'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faGem, faFire, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';
import type { MapSort } from '@/app/lib/types/discovery';

interface Props {
  sort: MapSort;
  onSortChange: (next: MapSort) => void;
  includeEmpty: boolean;
  onIncludeEmptyChange: (next: boolean) => void;
  chefOnly: boolean;
  onChefOnlyChange: (next: boolean) => void;
}

export default function MapLayerChips({
  sort,
  onSortChange,
  includeEmpty,
  onIncludeEmptyChange,
  chefOnly,
  onChefOnlyChange,
}: Props) {
  const t = useTranslations('discovery.map');
  const SORT_OPTIONS: ReadonlyArray<{ value: MapSort; label: string; icon: typeof faStar }> = [
    { value: 'geek_score', label: t('sortGeekScore'), icon: faStar },
    { value: 'value_prop', label: t('sortValueProp'), icon: faGem },
    { value: 'trending', label: t('sortTrending'), icon: faFire },
  ];
  return (
    <div
      role="toolbar"
      aria-label={t('toolbarLabel')}
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
        onClick={() => onChefOnlyChange(!chefOnly)}
        aria-pressed={chefOnly}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-sans text-xs font-medium shadow-sm backdrop-blur transition-colors',
          chefOnly
            ? 'border-[color:var(--color-azafran)] bg-[color:var(--color-azafran)] text-white'
            : 'border-border-default bg-surface-card/95 text-text-primary hover:bg-surface-subtle',
        )}
        title={t('chefOnlyTitle')}
      >
        <span aria-hidden>👨‍🍳</span>
        {t('chefOnlyLabel')}
      </button>
      <button
        type="button"
        onClick={() => onIncludeEmptyChange(!includeEmpty)}
        aria-pressed={includeEmpty}
        disabled={chefOnly}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-sans text-xs font-medium shadow-sm backdrop-blur transition-colors',
          includeEmpty
            ? 'border-[color:var(--color-albahaca)] bg-[color:var(--color-albahaca)] text-white'
            : 'border-border-default bg-surface-card/95 text-text-primary hover:bg-surface-subtle',
          chefOnly && 'opacity-50 cursor-not-allowed',
        )}
        title={
          chefOnly
            ? t('includeEmptyDisabled')
            : t('includeEmptyEnabled')
        }
      >
        <FontAwesomeIcon icon={faPlus} className="text-[10px]" aria-hidden />
        {t('includeEmptyLabel')}
      </button>
    </div>
  );
}
