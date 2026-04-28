import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/app/lib/utils/cn';

export type IconButtonIntent = 'like' | 'save' | 'follow' | 'neutral';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  icon: ReactNode;
  ariaLabel: string;
  intent?: IconButtonIntent;
  selected?: boolean;
  loading?: boolean;
  count?: number;
}

/**
 * - Hit area 44×44 (meets WCAG 2.5.5 AAA).
 * - When `count` is set, renders a compact inline count to the right.
 * - `selected` applies the intent color to the icon/surface.
 * - `aria-pressed` is set for toggle intents (like, save, follow).
 */
export default function IconButton({
  icon,
  ariaLabel,
  intent = 'neutral',
  selected = false,
  loading = false,
  disabled,
  count,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const isToggle = intent !== 'neutral';
  const selectedTint = selectedTintFor(intent, selected);
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-pressed={isToggle ? selected : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-2 text-sm transition-colors',
        'hover:bg-surface-subtle active:opacity-85',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        selectedTint,
        className,
      )}
    >
      <span
        aria-hidden
        key={`${intent}-${selected ? 'on' : 'off'}`}
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center',
          intent === 'like' && selected && 'cc-pop-on-select',
        )}
      >
        {loading ? <Spinner /> : icon}
      </span>
      {typeof count === 'number' && (
        <span className="font-sans text-xs tabular-nums text-text-muted">{count}</span>
      )}
    </button>
  );
}

function selectedTintFor(intent: IconButtonIntent, selected: boolean): string {
  if (!selected) return 'text-text-muted';
  switch (intent) {
    case 'like':
      return 'text-[var(--state-like-on)]';
    case 'save':
      return 'text-[var(--state-save-on)]';
    case 'follow':
      return 'text-[var(--state-follow-on)]';
    default:
      return 'text-text-primary';
  }
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
