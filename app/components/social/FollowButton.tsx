'use client';

import Button from '@/app/components/ui/Button';

export interface FollowButtonProps {
  userId: string;
  following: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onToggle: (userId: string, next: boolean) => void;
}

/**
 * Presentational follow toggle. Parent owns optimistic state via `useFollow`
 * (Fase 7). Uses `secondary` (Albahaca) when active to read as "hecho" without
 * competing with primary CTAs on the same screen.
 */
export default function FollowButton({
  userId,
  following,
  loading = false,
  disabled = false,
  size = 'md',
  onToggle,
}: FollowButtonProps) {
  return (
    <Button
      variant={following ? 'secondary' : 'primary'}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={() => onToggle(userId, !following)}
      aria-pressed={following}
    >
      {following ? 'Siguiendo' : 'Seguir'}
    </Button>
  );
}
