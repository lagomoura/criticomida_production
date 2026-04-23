import type { ReactNode } from 'react';
import { cn } from '@/app/lib/utils/cn';

type Variant = 'neutral' | 'brand' | 'danger' | 'success';
type Size = 'sm' | 'md';

export interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClass: Record<Variant, string> = {
  neutral: 'bg-surface-subtle text-text-secondary',
  brand: 'bg-action-primary text-text-inverse',
  danger: 'bg-action-danger text-text-inverse',
  success: 'bg-action-secondary text-text-inverse',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-4 min-w-4 px-1 text-[10px]',
  md: 'h-5 min-w-5 px-1.5 text-xs',
};

export default function Badge({ children, variant = 'neutral', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-sans font-medium tabular-nums leading-none',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
