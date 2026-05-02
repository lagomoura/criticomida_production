'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faXmark } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';
import ChatDrawer from './ChatDrawer';

/**
 * Floating button that opens the global Sommelier chat. Hidden on
 * routes that ship their own scoped launcher (the owner dashboard
 * has the Business chat embedded — showing both at once is confusing
 * because the floating one looks like just another button and users
 * end up chatting with the wrong agent).
 */
export default function ChatLauncher() {
  const t = useTranslations('chat');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // /es/restaurants/{slug}/owner, /en/restaurants/{slug}/owner, etc.
  const isOwnerPanel = /\/restaurants\/[^/]+\/owner(?:\/|$)/.test(pathname || '');
  if (isOwnerPanel) return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-20 right-4 z-[1099] flex h-14 w-14 items-center justify-center rounded-full md:bottom-6 md:right-6',
          'bg-action-primary text-text-inverse shadow-[var(--shadow-elevated)]',
          'transition-transform hover:scale-105 active:scale-95',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        )}
        aria-label={open ? t('close') : t('open')}
        aria-expanded={open}
      >
        <FontAwesomeIcon
          icon={open ? faXmark : faComments}
          aria-hidden
          className="h-5 w-5"
        />
      </button>
      <ChatDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
