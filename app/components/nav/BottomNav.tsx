'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBell,
  faHouse,
  faMagnifyingGlass,
  faPlus,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import Avatar from '@/app/components/ui/Avatar';
import Badge from '@/app/components/ui/Badge';
import { cn } from '@/app/lib/utils/cn';

export interface BottomNavProps {
  onOpenAuthModal: () => void;
  unreadCount?: number;
}

export default function BottomNav({ onOpenAuthModal, unreadCount = 0 }: BottomNavProps) {
  const { user, isLoading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (pattern: string) => {
    if (pattern === '/') return pathname === '/';
    return pathname.startsWith(pattern);
  };

  const requiresAuth = !user && !isLoading;

  const handleCompose = () => {
    if (user) router.push('/compose');
    else onOpenAuthModal();
  };

  const handleNotifications = () => {
    if (requiresAuth) onOpenAuthModal();
    else router.push('/notifications');
  };

  const handleProfile = () => {
    if (requiresAuth) onOpenAuthModal();
    else if (user) router.push(`/u/${user.id}`);
  };

  return (
    <nav
      aria-label="Navegación inferior"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-surface-page/95 backdrop-blur md:hidden',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="grid grid-cols-5 items-center" role="list">
        <BottomItem href="/" icon={faHouse} label="Inicio" active={isActive('/')} />
        <BottomItem href="/search" icon={faMagnifyingGlass} label="Buscar" active={isActive('/search')} />

        {/* Crear — slot central destacado */}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={handleCompose}
            aria-label="Publicar una reseña"
            className={cn(
              '-mt-3 inline-flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-transform',
              'bg-action-primary text-text-inverse hover:bg-action-primary-hover active:scale-95',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            )}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden className="h-4 w-4" />
          </button>
        </li>

        <BottomButton
          icon={faBell}
          label="Notificaciones"
          active={isActive('/notifications')}
          badge={unreadCount > 0 ? unreadCount : undefined}
          onClick={handleNotifications}
        />

        {user ? (
          <li>
            <Link
              href={`/u/${user.id}`}
              aria-label="Mi perfil"
              aria-current={isActive(`/u/${user.id}`) ? 'page' : undefined}
              className={cn(
                'flex min-h-[56px] flex-col items-center justify-center gap-0.5 font-sans text-[10px]',
                isActive(`/u/${user.id}`) ? 'text-text-primary' : 'text-text-muted',
              )}
            >
              <Avatar src={user.avatar_url} name={user.display_name || user.email} size="xs" />
              <span>Perfil</span>
            </Link>
          </li>
        ) : (
          <BottomButton icon={faUser} label="Perfil" active={false} onClick={handleProfile} />
        )}
      </ul>
    </nav>
  );
}

function BottomItem({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: IconDefinition;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 font-sans text-[10px]',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
        )}
      >
        <span className="relative">
          <FontAwesomeIcon icon={icon} aria-hidden className="h-5 w-5" />
          {typeof badge === 'number' && badge > 0 && (
            <Badge variant="danger" size="sm" className="absolute -right-2 -top-1">
              {badge > 99 ? '99+' : badge}
            </Badge>
          )}
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

function BottomButton({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: IconDefinition;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 font-sans text-[10px]',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
        )}
      >
        <span className="relative">
          <FontAwesomeIcon icon={icon} aria-hidden className="h-5 w-5" />
          {typeof badge === 'number' && badge > 0 && (
            <Badge variant="danger" size="sm" className="absolute -right-2 -top-1">
              {badge > 99 ? '99+' : badge}
            </Badge>
          )}
        </span>
        <span>{label}</span>
      </button>
    </li>
  );
}
