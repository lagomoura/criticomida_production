'use client';

import { Link } from '@/app/lib/i18n/navigation';
import { usePathname, useRouter } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBell,
  faHouse,
  faMagnifyingGlass,
  faPenToSquare,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('nav');

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
      aria-label={t('bottomNavigation')}
      className={cn(
        // Solid-ish background instead of backdrop-blur: blur() is composited
        // every scroll frame and was a measurable jank source on Android
        // mid-range. With bg-surface-page/98 the visual difference is
        // imperceptible.
        'fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-surface-page/98 md:hidden',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="grid grid-cols-5 items-center" role="list">
        <BottomItem href="/" icon={faHouse} label={t('home')} active={isActive('/')} />
        <BottomItem href="/search" icon={faMagnifyingGlass} label={t('search')} active={isActive('/search')} />

        <li data-tour-id="publish" className="flex flex-col items-center justify-center gap-0.5">
          <button
            type="button"
            onClick={handleCompose}
            aria-label={t('publishReview')}
            className={cn(
              '-mt-3 inline-flex h-12 w-12 items-center justify-center rounded-full transition-transform',
              'bg-action-primary text-text-inverse shadow-[var(--shadow-elevated)]',
              'hover:bg-action-primary-hover active:scale-95',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            )}
          >
            <FontAwesomeIcon icon={faPenToSquare} aria-hidden className="h-4 w-4" />
          </button>
          <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-text-muted">{t('publish')}</span>
        </li>

        <BottomButton
          icon={faBell}
          label={t('notifications')}
          active={isActive('/notifications')}
          badge={unreadCount > 0 ? unreadCount : undefined}
          onClick={handleNotifications}
          tourId="notifications"
        />

        {user ? (
          <li data-tour-id="profile">
            <Link
              href={`/u/${user.id}`}
              aria-label={t('myProfile')}
              aria-current={isActive(`/u/${user.id}`) ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 font-sans text-[10px]',
                isActive(`/u/${user.id}`) ? 'text-text-primary' : 'text-text-muted',
              )}
            >
              <Avatar src={user.avatar_url} name={user.display_name || user.email} size="xs" />
              <span className="uppercase tracking-[0.12em]">{t('profile')}</span>
              <ActiveDot active={isActive(`/u/${user.id}`)} />
            </Link>
          </li>
        ) : (
          <BottomButton icon={faRightToBracket} label={t('enter')} active={false} onClick={handleProfile} tourId="profile" />
        )}
      </ul>
    </nav>
  );
}

function ActiveDot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-action-primary transition-opacity',
        active ? 'opacity-100' : 'opacity-0',
      )}
    />
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
        <span className="uppercase tracking-[0.12em]">{label}</span>
        <ActiveDot active={active} />
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
  tourId,
}: {
  icon: IconDefinition;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
  tourId?: string;
}) {
  return (
    <li data-tour-id={tourId}>
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
        <span className="uppercase tracking-[0.12em]">{label}</span>
        <ActiveDot active={active} />
      </button>
    </li>
  );
}
