'use client';

import { useEffect, useState } from 'react';
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
  // Mientras hay un modal abierto (Publicar reseña, Reportar, etc.) el
  // launcher se esconde: en mobile su esquina inferior-derecha solapa el
  // CTA del modal (p. ej. "Publicar reseña"). Todos los modales del
  // proyecto bloquean el scroll con body.style.overflow = 'hidden', así
  // que observamos ese cambio en lugar de propagar un contexto.
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => setModalOpen(document.body.style.overflow === 'hidden');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  // /es/restaurants/{slug}/owner, /en/restaurants/{slug}/owner, etc.
  const isOwnerPanel = /\/restaurants\/[^/]+\/owner(?:\/|$)/.test(pathname || '');
  if (isOwnerPanel) return null;
  if (modalOpen) return null;

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
