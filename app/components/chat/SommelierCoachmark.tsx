'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWineGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSommelierPromo } from '@/app/lib/hooks/useSommelierPromo';
import { useTour } from '@/app/components/tour/useTour';

/**
 * Globo de atención one-time anclado encima del FAB del Sommelier.
 * Solo aparece a usuarios que nunca lo abrieron (vía
 * ``useSommelierPromo``) y NUNCA al mismo tiempo que el tour — durante
 * el tour la pieza principal ya enseña el Sommelier, así que el globo
 * sería redundante y se solaparía con el overlay.
 */
export default function SommelierCoachmark() {
  const t = useTranslations('chat.coachmark');
  const tCommon = useTranslations('common');
  const { shouldShow, resolved, dismiss } = useSommelierPromo();
  const { status: tourStatus } = useTour();
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  // Mismo guard que ChatLauncher: con un modal abierto (scroll lock) el
  // FAB se esconde, así que el globo tampoco debe apuntar a la nada.
  useEffect(() => {
    const sync = () => setModalOpen(document.body.style.overflow === 'hidden');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });
    return () => observer.disconnect();
  }, []);

  const isOwnerPanel = /\/restaurants\/[^/]+\/owner(?:\/|$)/.test(
    pathname || '',
  );

  if (isOwnerPanel || modalOpen) return null;
  if (!resolved || !shouldShow) return null;
  if (tourStatus === 'running') return null;

  return (
    <div
      role="status"
      className="fixed right-4 z-[1098] w-[min(280px,calc(100vw-2rem))] bottom-[calc(5rem+3.5rem+0.75rem)] md:right-6 md:bottom-[calc(1.5rem+3.5rem+0.75rem)]"
      style={{
        animation:
          'palato-tour-tooltip-in 320ms var(--ease-spoon, cubic-bezier(0.34, 1.56, 0.64, 1)) both',
        transformOrigin: 'bottom right',
      }}
    >
      <div className="relative rounded-2xl border border-border-default bg-surface-card p-4 shadow-[var(--shadow-floating)]">
        <button
          type="button"
          onClick={dismiss}
          aria-label={tCommon('close')}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-start gap-3 pr-5">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-inverse shadow-[var(--shadow-base)]"
            style={{
              background:
                'linear-gradient(135deg, var(--color-terracota), var(--color-dorado))',
            }}
          >
            <FontAwesomeIcon icon={faWineGlass} className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="m-0 font-display text-base font-medium leading-snug text-text-primary">
              {t('title')}
            </p>
            <p className="mt-1 font-sans text-xs leading-relaxed text-text-secondary">
              {t('body')}
            </p>
          </div>
        </div>
      </div>

      {/* Cola apuntando al FAB (abajo-derecha). */}
      <span
        aria-hidden
        className="absolute right-7 -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-border-default bg-surface-card"
      />
    </div>
  );
}
