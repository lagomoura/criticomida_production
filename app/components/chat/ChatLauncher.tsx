'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faXmark } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';
import type { ChatClientContext } from '@/app/lib/api/chat';
import {
  useSommelierPromo,
  SOMMELIER_OPEN_EVENT,
} from '@/app/lib/hooks/useSommelierPromo';
import ChatDrawer from './ChatDrawer';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A — Context Injection. Derive a ``ChatClientContext`` from the
 * current route so the Sommelier can ground its first reply in the
 * page the diner was just on.
 *
 * Recognised shapes (locale is the first segment under next-intl):
 * - ``/{locale}/restaurants/{slug}``        → restaurant_slug
 * - ``/{locale}/restaurants/{uuid}``        → restaurant_id
 *   (the restaurant detail route accepts both; the launcher detects
 *   the shape so the backend can resolve in one query instead of
 *   falling back from slug to id)
 * - ``/{locale}/restaurants/{...}/owner``   → null (Business panel,
 *   not a diner surface; the Sommelier launcher is hidden there
 *   anyway but the guard keeps the contract clean)
 * - ``/{locale}/dishes/{uuid}``             → dish_id
 *
 * Anything else returns ``null`` and the chat runs with no hint.
 */
function deriveClientContext(pathname: string | null): ChatClientContext | null {
  if (!pathname) return null;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 3) return null;
  // parts[0] = locale, parts[1] = section, parts[2] = id-or-slug
  if (parts[1] === 'restaurants' && parts[3] !== 'owner') {
    const idOrSlug = decodeURIComponent(parts[2]);
    return UUID_PATTERN.test(idOrSlug)
      ? { restaurant_id: idOrSlug }
      : { restaurant_slug: idOrSlug };
  }
  if (parts[1] === 'dishes' && UUID_PATTERN.test(parts[2])) {
    // Defensive UUID check: bad ids would 404 the page anyway, but a
    // malformed string here would just produce a useless 422 round-trip
    // on the backend. Better to omit the hint.
    return { dish_id: parts[2] };
  }
  return null;
}

/**
 * Floating button that opens the global Sommelier chat. Hidden on
 * routes that ship their own scoped launcher (the owner dashboard
 * has the Business chat embedded — showing both at once is confusing
 * because the floating one looks like just another button and users
 * end up chatting with the wrong agent).
 */
export default function ChatLauncher() {
  const t = useTranslations('chat');
  const { markOpenedAndDismiss } = useSommelierPromo();
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

  // Apertura desde otra superficie (card spotlight del feed, etc.) vía
  // evento DOM desacoplado — abrir el chat también cierra la promo.
  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      markOpenedAndDismiss();
    };
    document.addEventListener(SOMMELIER_OPEN_EVENT, onOpen);
    return () => document.removeEventListener(SOMMELIER_OPEN_EVENT, onOpen);
  }, [markOpenedAndDismiss]);

  // /es/restaurants/{slug}/owner, /en/restaurants/{slug}/owner, etc.
  const isOwnerPanel = /\/restaurants\/[^/]+\/owner(?:\/|$)/.test(pathname || '');

  // Memoize so the drawer doesn't re-trigger its preview-fetch effect
  // every time the launcher re-renders for unrelated reasons (eg. a
  // body-style mutation tick from MutationObserver). The dependency
  // is just the pathname string.
  const clientContext = useMemo(
    () => deriveClientContext(pathname),
    [pathname],
  );

  if (isOwnerPanel) return null;
  if (modalOpen) return null;

  return (
    <>
      <button
        data-tour-id="sommelier_fab"
        onClick={() =>
          setOpen((v) => {
            const nextOpen = !v;
            if (nextOpen) markOpenedAndDismiss();
            return nextOpen;
          })
        }
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
      <ChatDrawer
        open={open}
        onClose={() => setOpen(false)}
        clientContext={clientContext}
      />
    </>
  );
}
