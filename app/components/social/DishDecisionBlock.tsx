import { cn } from '@/app/lib/utils/cn';
import type { DishSummary } from '@/app/lib/types/social';

export interface DishDecisionBlockProps {
  dish: DishSummary;
  score: number;
  onOpenDish?: (dishId: string) => void;
  onOpenRestaurant?: (restaurantId: string) => void;
  className?: string;
}

/**
 * The "qué pedir" block. Always visible in PostCard and review detail.
 * Dish name (Cormorant 500), restaurant meta, score pill.
 */
export default function DishDecisionBlock({
  dish,
  score,
  onOpenDish,
  onOpenRestaurant,
  className,
}: DishDecisionBlockProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        {onOpenDish ? (
          <button
            type="button"
            onClick={() => onOpenDish(dish.id)}
            className="block max-w-full truncate text-left font-display text-xl font-medium text-text-primary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] sm:text-2xl"
          >
            {dish.name}
          </button>
        ) : (
          <h3 className="truncate font-display text-xl font-medium text-text-primary sm:text-2xl">
            {dish.name}
          </h3>
        )}
        <p className="mt-0.5 truncate font-sans text-sm text-text-muted">
          en{' '}
          {onOpenRestaurant ? (
            <button
              type="button"
              onClick={() => onOpenRestaurant(dish.restaurantId)}
              className="hover:text-text-secondary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {dish.restaurantName}
            </button>
          ) : (
            <span>{dish.restaurantName}</span>
          )}
          {dish.category && <span className="text-text-muted"> · {dish.category}</span>}
        </p>
      </div>
      <ScoreBadge score={score} />
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  // Score ≥4.5 surfaces albahaca (positive highlight); the rest keeps warm carbon.
  const tone = score >= 4.5 ? 'text-action-secondary' : 'text-text-primary';
  return (
    <span
      aria-label={`Puntaje ${score.toFixed(1)} de 5`}
      className={cn(
        'shrink-0 rounded-full border border-border-default bg-surface-card px-3 py-1 font-display text-xl font-medium leading-none tabular-nums',
        tone,
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}
