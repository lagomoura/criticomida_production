'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUserMinus, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';

export interface FollowButtonProps {
  userId: string;
  following: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onToggle: (userId: string, next: boolean) => void;
}

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-11 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-base',
};

export default function FollowButton({
  userId,
  following,
  loading = false,
  disabled = false,
  size = 'md',
  onToggle,
}: FollowButtonProps) {
  const t = useTranslations('social.follow');
  // Hover state: solo para dispositivos pointer:fine (mouse).
  // En touch (pointer:coarse) el estado destructivo se muestra directamente.
  const [hovered, setHovered] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    setIsCoarsePointer(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const isDisabled = disabled || loading;

  // En touch: si ya sigue, mostrar el estado destructivo directamente (sin hover).
  // En mouse: mostrar destructivo solo en hover.
  const showUnfollow = following && (isCoarsePointer || hovered);

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-pressed={following}
      aria-label={following ? t('followingHint') : undefined}
      onClick={() => onToggle(userId, !following)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // onFocus no activa hovered — el focus-visible ring se encarga del estado de foco;
      // el cambio de label/ícono es exclusivo del hover con mouse (DMMT: no affordance falsa).
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-sans font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        sizeClass[size],
        following
          ? showUnfollow
            ? 'border border-action-danger bg-transparent text-action-danger hover:bg-[color:var(--color-paprika-pale)]'
            : 'border border-border-strong bg-transparent text-text-primary hover:border-action-danger'
          : 'bg-action-primary text-text-inverse hover:bg-action-primary-hover',
      )}
    >
      {loading ? (
        <span
          aria-hidden
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : following ? (
        <FontAwesomeIcon
          icon={showUnfollow ? faUserMinus : faCheck}
          aria-hidden
          className={cn(
            'h-3.5 w-3.5',
            // cc-pop-on-select pattern: motion-safe animación de entrada al ícono check
            !showUnfollow && 'motion-safe:animate-[follow-pop_220ms_var(--ease-spoon)_both]',
          )}
        />
      ) : (
        <FontAwesomeIcon icon={faUserPlus} aria-hidden className="h-3.5 w-3.5" />
      )}
      {following
        ? showUnfollow
          ? t('unfollow')
          : t('following')
        : t('follow')}
    </button>
  );
}
