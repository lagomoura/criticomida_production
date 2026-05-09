'use client';

import { Link } from '@/app/lib/i18n/navigation';
import Image from 'next/image';
import { usePathname, useRouter } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faBell,
  faFolderTree,
  faHouse,
  faMagnifyingGlass,
  faPenToSquare,
  faRightToBracket,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import Badge from '@/app/components/ui/Badge';
import Button from '@/app/components/ui/Button';
import ThemeToggle from '@/app/components/ThemeToggle';
import LanguageSwitcher from '@/app/components/i18n/LanguageSwitcher';
import UserMenu from '@/app/components/nav/UserMenu';
import { cn } from '@/app/lib/utils/cn';

export interface TopNavProps {
  onOpenAuthModal: () => void;
  unreadCount?: number;
}

export default function TopNav({ onOpenAuthModal, unreadCount = 0 }: TopNavProps) {
  const { user, isLoading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

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
        aria-label={t('mainNavigation')}
        className="cc-container flex h-16 items-center gap-3"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md no-underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <Image src="/img/logosm.png" alt="" width={36} height={36} aria-hidden />
          <span className="font-display text-xl font-medium text-text-primary">{tCommon('siteName')}</span>
        </Link>

        <ul className="mx-auto flex list-none items-center gap-1 p-0" role="list">
          <NavLink href="/" icon={faHouse} label={t('home')} active={isActive('/')} />
          <NavLink href="/search" icon={faMagnifyingGlass} label={t('search')} active={isActive('/search')} />
          <NavLink href="/trending" icon={faArrowTrendUp} label={t('trending')} active={isActive('/trending')} />
          <li>
            <button
              type="button"
              onClick={handleCompose}
              aria-label={user ? t('publishReview') : t('signInToPublish')}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full px-4 font-sans text-sm font-medium transition-all',
                'bg-action-primary text-text-inverse hover:bg-action-primary-hover hover:-translate-y-px',
                'shadow-[var(--shadow-base)] hover:shadow-[var(--shadow-media)]',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              )}
            >
              <FontAwesomeIcon icon={faPenToSquare} aria-hidden className="h-3.5 w-3.5" />
              {t('publish')}
            </button>
          </li>
          <NavLink
            href="/notifications"
            icon={faBell}
            label={t('notifications')}
            active={isActive('/notifications')}
            badge={unreadCount > 0 ? unreadCount : undefined}
            requiresAuth={!user && !isLoading}
            onRequireAuth={onOpenAuthModal}
          />
          {user ? (
            <li>
              <UserMenu active={isActive(`/u/${user.id}`)} />
            </li>
          ) : null}
        </ul>

        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <>
              <Link
                href="/admin/restaurantes-sin-categoria"
                aria-label={t('uncategorized')}
                aria-current={isActive('/admin/restaurantes-sin-categoria') ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                  'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  isActive('/admin/restaurantes-sin-categoria') && 'bg-surface-subtle text-text-primary',
                )}
                title={t('uncategorized')}
              >
                <FontAwesomeIcon icon={faFolderTree} aria-hidden className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/reports"
                aria-label={t('moderation')}
                aria-current={isActive('/admin/reports') ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                  'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  isActive('/admin/reports') && 'bg-surface-subtle text-text-primary',
                )}
                title={t('moderation')}
              >
                <FontAwesomeIcon icon={faShieldHalved} aria-hidden className="h-4 w-4" />
              </Link>
            </>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          {!isLoading && !user && pathname !== '/login' && (
            <Button variant="outline" size="sm" onClick={onOpenAuthModal} leftIcon={<FontAwesomeIcon icon={faRightToBracket} className="h-3.5 w-3.5" />}>
              {t('signIn')}
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
    'group relative inline-flex h-10 items-center gap-2 rounded-md px-3 font-sans text-sm transition-colors',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
    active ? 'text-action-primary' : 'text-text-secondary hover:text-text-primary',
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
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-action-primary transition-transform origin-left',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50',
        )}
      />
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
