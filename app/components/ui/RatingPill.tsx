import type { HTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl';

export interface RatingPillProps extends HTMLAttributes<HTMLSpanElement> {
  /** 0–10. NaN/undefined renders an em-dash placeholder. */
  value: number | null | undefined;
  size?: Size;
  /** Maximum scale (default 10). Affects the "/10" suffix when shown. */
  max?: number;
  /** Show the "/10" suffix in DM Sans next to the value. Default false. */
  showMax?: boolean;
  /** Render as a flat number (no pill background). Default false. */
  bare?: boolean;
}

const sizeClass: Record<Size, { wrapper: string; value: string; suffix: string }> = {
  sm: { wrapper: 'h-7 px-2.5 gap-1', value: 'text-base', suffix: 'text-[0.65rem]' },
  md: { wrapper: 'h-9 px-3 gap-1.5', value: 'text-xl', suffix: 'text-xs' },
  lg: { wrapper: 'h-11 px-4 gap-2', value: 'text-2xl', suffix: 'text-sm' },
  xl: { wrapper: 'h-14 px-5 gap-2', value: 'text-4xl', suffix: 'text-base' },
};

/** Returns saffron/basil/charcoal class pair for the given score. */
function tone(value: number | null | undefined): { bg: string; fg: string } {
  if (value == null || Number.isNaN(value)) {
    return { bg: 'bg-surface-subtle', fg: 'text-text-muted' };
  }
  if (value >= 9) return { bg: 'bg-[var(--color-albahaca-pale)]', fg: 'text-[var(--color-albahaca)]' };
  if (value >= 7) return { bg: 'bg-[var(--color-azafran-pale)]', fg: 'text-[var(--color-azafran)]' };
  return { bg: 'bg-surface-subtle', fg: 'text-text-secondary' };
}

function format(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return Number.isInteger(value) ? value.toFixed(1) : value.toFixed(1);
}

export default function RatingPill({
  value,
  size = 'md',
  max = 10,
  showMax = false,
  bare = false,
  className,
  ...rest
}: RatingPillProps) {
  const sc = sizeClass[size];
  const t = tone(value);
  const display = format(value);
  const ariaLabel =
    value == null || Number.isNaN(value)
      ? 'Sin puntuación'
      : `Puntuación ${display} sobre ${max}`;

  if (bare) {
    return (
      <span
        {...rest}
        aria-label={ariaLabel}
        className={cn('inline-flex items-baseline gap-1 font-display font-medium', t.fg, sc.value, className)}
      >
        <span className="leading-none tabular-nums">{display}</span>
        {showMax && <span className={cn('font-sans font-normal text-text-muted', sc.suffix)}>/{max}</span>}
      </span>
    );
  }

  return (
    <span
      {...rest}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'font-display font-medium leading-none tabular-nums',
        sc.wrapper,
        t.bg,
        t.fg,
        className,
      )}
    >
      <span className={sc.value}>{display}</span>
      {showMax && <span className={cn('font-sans font-normal opacity-70', sc.suffix)}>/{max}</span>}
    </span>
  );
}
