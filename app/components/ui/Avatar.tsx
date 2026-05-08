import Image from 'next/image';
import { cn } from '@/app/lib/utils/cn';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: Size;
  className?: string;
  /** Pass true when this avatar is the LCP image (e.g. profile hero at size="xl"). */
  priority?: boolean;
}

const sizePx: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

/**
 * `sizes` hint for next/image: we know the rendered CSS size is fixed, so
 * we describe it explicitly to avoid the browser downloading a full-width image.
 */
const sizesHint: Record<Size, string> = {
  xs: '24px',
  sm: '32px',
  md: '40px',
  lg: '56px',
  xl: '80px',
};

const sizeTextClass: Record<Size, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
};

/**
 * Circular user avatar. Falls back to initials over a warm surface when no `src`.
 * `alt` is derived from `name` for image accessibility.
 *
 * - `priority`: set to true when this is the LCP candidate (auto-applied for size="xl").
 * - `sizes`: always passed so next/image can pick the correct source size.
 */
export default function Avatar({ src, name, size = 'md', className, priority }: AvatarProps) {
  const px = sizePx[size];
  const initials = getInitials(name);
  // xl avatars are typically LCP (profile hero); propagate priority automatically.
  const isPriority = priority ?? size === 'xl';

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-subtle font-sans font-medium text-text-secondary',
        sizeTextClass[size],
        className,
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          sizes={sizesHint[size]}
          priority={isPriority}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
