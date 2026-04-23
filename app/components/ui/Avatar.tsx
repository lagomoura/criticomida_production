import Image from 'next/image';
import { cn } from '@/app/lib/utils/cn';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: Size;
  className?: string;
}

const sizePx: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
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
 */
export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const px = sizePx[size];
  const initials = getInitials(name);

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
          className="h-full w-full object-cover"
          unoptimized
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
