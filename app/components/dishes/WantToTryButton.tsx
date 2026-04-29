'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';

export interface WantToTryButtonProps {
  dishId: string;
  /** Estado actual desde el viewer state. */
  active: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Cuando active=false → user quiere agregarlo. Cuando active=true → quitar. */
  onToggle: (dishId: string, next: boolean) => void;
  className?: string;
}

/**
 * CTA para sumar el plato a la wishlist 'Quiero probarlo'. Es el funnel de
 * conversión a vuelta-a-la-app: el usuario abre el viernes, mira su lista,
 * sabe qué pedir.
 *
 * Convive con el bookmark de reviews (icono separado en PostActions) — el
 * bookmark guarda la reseña, esto guarda el plato.
 *
 * Componente presentacional: el parent posee el estado optimista, igual que
 * FollowButton.
 */
export default function WantToTryButton({
  dishId,
  active,
  loading = false,
  disabled = false,
  size = 'sm',
  onToggle,
  className,
}: WantToTryButtonProps) {
  return (
    <Button
      variant={active ? 'secondary' : 'outline'}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={(e) => {
        // Evitar que el click suba al overlay del PostCard.
        e.stopPropagation();
        e.preventDefault();
        onToggle(dishId, !active);
      }}
      aria-pressed={active}
      leftIcon={
        <FontAwesomeIcon
          icon={active ? faCheck : faBookmark}
          className="h-3.5 w-3.5"
        />
      }
      className={className}
    >
      {active ? 'En tu lista' : 'Quiero probarlo'}
    </Button>
  );
}
