import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/app/lib/utils/cn';

type Variant = 'flat' | 'elevated' | 'editorial';
type Padding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  /** When true, applies hover lift + shadow upgrade. Use only on clickable cards. */
  interactive?: boolean;
  children?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  flat: 'rounded-xl border border-border-subtle bg-surface-card',
  elevated:
    'rounded-xl border border-border-subtle bg-surface-card shadow-[var(--shadow-base)]',
  editorial:
    'border border-border-subtle bg-surface-card shadow-[var(--shadow-base)]',
};

const paddingClass: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  variant = 'elevated',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        variantClass[variant],
        paddingClass[padding],
        'transition-[transform,box-shadow] duration-[var(--duration-standard)]',
        'motion-safe:[transition-timing-function:var(--ease-standard)]',
        interactive &&
          'cursor-pointer hover:-translate-y-[3px] hover:shadow-[var(--shadow-elevated)] focus-within:shadow-[var(--shadow-elevated)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
