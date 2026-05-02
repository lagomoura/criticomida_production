'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';
import type { DishSummary } from '@/app/lib/types/social';

export interface DishDecisionBlockProps {
  dish: DishSummary;
  score: number;
  onOpenDish?: (dishId: string) => void;
  onOpenRestaurant?: (restaurantId: string) => void;
  className?: string;
}

export default function DishDecisionBlock({
  dish,
  score,
  onOpenDish,
  onOpenRestaurant,
  className,
}: DishDecisionBlockProps) {
  const t = useTranslations('social.dishDecision');
  const tPost = useTranslations('social.post');
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
        {t('kicker')}
      </p>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {onOpenDish ? (
            <button
              type="button"
              onClick={() => onOpenDish(dish.id)}
              className="block max-w-full truncate text-left font-display text-2xl font-medium leading-[1.05] text-text-primary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] sm:text-[28px]"
            >
              {dish.name}
            </button>
          ) : (
            <h3 className="truncate font-display text-2xl font-medium leading-[1.05] text-text-primary sm:text-[28px]">
              {dish.name}
            </h3>
          )}
          <p className="mt-1.5 truncate font-sans text-[13px] text-text-muted">
            <span className="text-text-muted/70">{t('atRestaurant')}</span>
            {onOpenRestaurant ? (
              <button
                type="button"
                onClick={() => onOpenRestaurant(dish.restaurantId)}
                className="font-medium text-text-secondary hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                {dish.restaurantName}
              </button>
            ) : (
              <span className="font-medium text-text-secondary">{dish.restaurantName}</span>
            )}
            {dish.category && (
              <>
                <span className="mx-1.5 text-text-muted/60" aria-hidden>·</span>
                <span className="uppercase tracking-[0.08em] text-[11px] text-text-muted">
                  {dish.category}
                </span>
              </>
            )}
          </p>
        </div>
        <ScoreBadge score={score} ariaLabel={tPost('scoreLabel', { score: score.toFixed(1) })} />
      </div>

      <div
        aria-hidden
        className="mt-1 h-px w-12 bg-[color:var(--color-azafran)]/45"
      />
    </div>
  );
}

function ScoreBadge({ score, ariaLabel }: { score: number; ariaLabel: string }) {
  const tone = score >= 4.5 ? 'text-action-secondary' : 'text-text-primary';
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        'shrink-0 rounded-full border border-border-default bg-surface-card px-3 py-1 font-display text-xl font-medium leading-none tabular-nums',
        tone,
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}
