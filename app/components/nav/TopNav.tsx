'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faBell,
  faHouse,
  faMagnifyingGlass,
  faPlus,
  faRightToBracket,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import Avatar from '@/app/components/ui/Avatar';
import Badge from '@/app/components/ui/Badge';
import Button from '@/app/components/ui/Button';
import ThemeToggle from '@/app/components/ThemeToggle';
import { cn } from '@/app/lib/utils/cn';

export interface TopNavProps {
  onOpenAuthModal: () => void;
  unreadCount?: number;
}

export default function TopNav({ onOpenAuthModal, unreadCount = 0 }: TopNavProps) {
  const { user, isLoading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (pattern: string) => {
    if (pattern === '/') return pathname === '/';
    return pathname.startsWith(pattern);
  };

  const handleCompose = () => {
    if (user) {
      router.push('/compose');
    } else {
      onOpenAuthModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border-default bg-surface-page/85 backdrop-blur md:block">
      <nav
        aria-label="Navegación principal"
        className="cc-container flex h-16 items-center gap-3"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md no-underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <Image src="/img/logosm.png" alt="" width={36} height={36} aria-hidden />
          <span className="font-display text-xl font-medium text-text-primary">CritiComida</span>
        </Link>

        <ul className="mx-auto flex list-none items-center gap-1 p-0" role="list">
          <NavLink href="/" icon={faHouse} label="Inicio" active={isActive('/')} />
          <NavLink href="/search" icon={faMagnifyingGlass} label="Buscar" active={isActive('/search')} />
          <NavLink href="/trending" icon={faArrowTrendUp} label="Trending" active={isActive('/trending')} />
          <li>
            <button
              type="button"
              onClick={handleCompose}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full px-4 font-sans text-sm font-medium transition-colors',
                'bg-action-primary text-text-inverse hover:bg-action-primary-hover',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              )}
            >
              <FontAwesomeIcon icon={faPlus} aria-hidden className="h-3.5 w-3.5" />
              Crear
            </button>
          </li>
          <NavLink
            href="/notifications"
            icon={faBell}
            label="Notificaciones"
            active={isActive('/notifications')}
            badge={unreadCount > 0 ? unreadCount : undefined}
            requiresAuth={!user && !isLoading}
            onRequireAuth={onOpenAuthModal}
          />
          {user ? (
            <li>
              <Link
                href={`/u/${user.id}`}
                aria-label="Mi perfil"
                aria-current={isActive(`/u/${user.id}`) ? 'page' : undefined}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-full px-2 transition-colors',
                  'hover:bg-surface-subtle',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  isActive(`/u/${user.id}`) && 'bg-surface-subtle',
                )}
              >
                <Avatar src={user.avatar_url} name={user.display_name || user.email} size="sm" />
                <span className="font-sans text-sm text-text-primary">
                  {user.display_name?.split(' ')[0] ?? 'Perfil'}
                </span>
              </Link>
            </li>
          ) : null}
        </ul>

        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <Link
              href="/admin/reports"
              aria-label="Moderación"
              aria-current={isActive('/admin/reports') ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                isActive('/admin/reports') && 'bg-surface-subtle text-text-primary',
              )}
              title="Moderación"
            >
              <FontAwesomeIcon icon={faShieldHalved} aria-hidden className="h-4 w-4" />
            </Link>
          )}
          <ThemeToggle />
          {!isLoading && !user && (
            <Button variant="outline" size="sm" onClick={onOpenAuthModal} leftIcon={<FontAwesomeIcon icon={faRightToBracket} className="h-3.5 w-3.5" />}>
              Iniciar sesión
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
  badge,
  requiresAuth,
  onRequireAuth,
}: {
  href: string;
  icon: typeof faHouse;
  label: string;
  active: boolean;
  badge?: number;
  requiresAuth?: boolean;
  onRequireAuth?: () => void;
}) {
  const className = cn(
    'relative inline-flex h-10 items-center gap-2 rounded-full px-3 font-sans text-sm transition-colors',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
    active ? 'bg-surface-subtle text-text-primary' : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
  );

  const content = (
    <>
      <FontAwesomeIcon icon={icon} aria-hidden className="h-4 w-4" />
      <span>{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <Badge variant="danger" size="sm" className="ml-0.5">
          {badge > 99 ? '99+' : badge}
        </Badge>
      )}
    </>
  );

  if (requiresAuth) {
    return (
      <li>
        <button type="button" onClick={onRequireAuth} className={className}>
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link href={href} aria-current={active ? 'page' : undefined} className={className}>
        {content}
      </Link>
    </li>
  );
}
