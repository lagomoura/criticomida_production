'use client';

import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import Avatar from '@/app/components/ui/Avatar';
import { cn } from '@/app/lib/utils/cn';

interface UserMenuProps {
  active?: boolean;
}

export default function UserMenu({ active = false }: UserMenuProps) {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch {
      setLoggingOut(false);
    }
  };

  const firstName = user.display_name?.split(' ')[0] ?? t('profile');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('userMenu')}
        className={cn(
          'group relative inline-flex h-10 items-center gap-2 rounded-md px-2 transition-colors',
          'hover:text-text-primary',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        )}
      >
        <Avatar src={user.avatar_url} name={user.display_name || user.email} size="sm" />
        <span className="font-sans text-sm text-text-primary">{firstName}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          aria-hidden
          className={cn(
            'h-2.5 w-2.5 text-text-muted transition-transform',
            open && 'rotate-180',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-2 bottom-1 h-[2px] rounded-full bg-action-primary transition-transform origin-left',
            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50',
          )}
        />
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={t('userMenu')}
          className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-lg border border-border-default bg-surface-card p-1 shadow-[var(--shadow-elevated)]"
        >
          <li role="none">
            <Link
              href={`/u/${user.id}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left font-sans text-sm no-underline transition-colors',
                'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              )}
            >
              <FontAwesomeIcon icon={faUser} aria-hidden className="h-3.5 w-3.5 text-text-muted" />
              <span>{t('myProfile')}</span>
            </Link>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left font-sans text-sm transition-colors',
                'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                'disabled:opacity-60',
              )}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                aria-hidden
                className="h-3.5 w-3.5 text-text-muted"
              />
              <span>{loggingOut ? t('signingOut') : t('signOut')}</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
