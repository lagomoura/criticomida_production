import { cn } from '@/app/lib/utils/cn';

type Shape = 'box' | 'circle' | 'line';

export interface SkeletonProps {
  shape?: Shape;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * Presentational skeleton block. Parents compose these to build post-card,
 * comment, notification skeletons (see §6.8.6 of brand-identity-v2.md).
 */
export default function Skeleton({ shape = 'box', width, height, className }: SkeletonProps) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'line' ? 'rounded-full h-3' : 'rounded-md';
  return (
    <span
      aria-hidden
      className={cn('block animate-pulse bg-surface-subtle', shapeClass, className)}
      style={{ width, height }}
    />
  );
}
