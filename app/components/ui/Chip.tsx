import type { ReactNode } from 'react';
import { cn } from '@/app/lib/utils/cn';

export interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

/**
 * Compact label used for tags, category filters and active-filter indicators.
 * - If `onClick` is set, the chip becomes a button (toggles `selected` by convention).
 * - If `onRemove` is set, renders a trailing close affordance with its own a11y label.
 */
export default function Chip({
  children,
  selected = false,
  onClick,
  onRemove,
  removeLabel = 'Quitar',
  className,
}: ChipProps) {
  const base = cn(
    'inline-flex h-7 items-center gap-1 rounded-full border px-3 font-sans text-xs transition-colors',
    selected
      ? 'border-transparent bg-action-primary text-text-inverse'
      : 'border-border-default bg-surface-card text-text-secondary hover:bg-surface-subtle',
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-current hover:bg-black/10"
        >
          ×
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={cn(base, 'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]')}
      >
        {content}
      </button>
    );
  }

  return <span className={base}>{content}</span>;
}
