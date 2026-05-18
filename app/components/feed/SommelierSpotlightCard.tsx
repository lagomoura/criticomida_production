'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWineGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import {
  useSommelierPromo,
  SOMMELIER_OPEN_EVENT,
} from '@/app/lib/hooks/useSommelierPromo';

/**
 * Card editorial spotlight en el feed home. Mismo lenguaje visual que
 * ``FeedWelcome`` (rounded-3xl, glow radial Terracota, título Cormorant)
 * para que se lea como la misma familia. Self-gatea a ``null`` cuando
 * el usuario no es elegible — costo cero de layout para el resto.
 */
export default function SommelierSpotlightCard() {
  const t = useTranslations('feed.sommelier');
  const { shouldShow, resolved, dismiss } = useSommelierPromo();

  if (!resolved || !shouldShow) return null;

  const openSommelier = () => {
    if (typeof window !== 'undefined') {
      document.dispatchEvent(new Event(SOMMELIER_OPEN_EVENT));
    }
    dismiss();
  };

  return (
    <section
      aria-labelledby="sommelier-spotlight-title"
      className="relative overflow-hidden rounded-3xl border border-border-default bg-surface-card"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, var(--color-terracota-light), transparent 70%)',
        }}
      />

      <button
        type="button"
        onClick={dismiss}
        aria-label={t('dismiss')}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <FontAwesomeIcon icon={faXmark} aria-hidden className="h-4 w-4" />
      </button>

      <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:gap-8 md:p-10">
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-text-inverse shadow-[var(--shadow-base)]"
          style={{
            background:
              'linear-gradient(135deg, var(--color-terracota), var(--color-dorado))',
          }}
        >
          <FontAwesomeIcon icon={faWineGlass} className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-action-primary">
            {t('kicker')}
          </p>
          <h2
            id="sommelier-spotlight-title"
            className="mt-2 m-0 font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-medium leading-[1.1] text-text-primary"
          >
            {t('title')}
          </h2>
          <p className="mt-2 max-w-prose font-sans text-sm text-text-secondary md:text-base">
            {t('body')}
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            size="lg"
            onClick={openSommelier}
            className="w-full md:w-auto"
            leftIcon={<FontAwesomeIcon icon={faWineGlass} className="h-4 w-4" />}
          >
            {t('cta')}
          </Button>
        </div>
      </div>
    </section>
  );
}
