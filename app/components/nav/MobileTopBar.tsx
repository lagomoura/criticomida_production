'use client';

import Image from 'next/image';
import { Link } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/app/components/i18n/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

/**
 * Top bar visible solo en mobile (md:hidden). Coexiste con BottomNav.
 * No duplica navegación: solo marca + settings (idioma, tema) — controles
 * que en desktop viven en TopNav y que de otro modo no estarían accesibles
 * antes de loguear.
 */
export default function MobileTopBar() {
  const t = useTranslations('common');

  return (
    <header
      className="sticky top-0 z-40 border-b border-border-default bg-surface-page/95 md:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex h-[3.85rem] items-center justify-between px-4">
        <Link
          href="/"
          aria-label={t('siteName')}
          className="flex items-center rounded-md no-underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          {/* Wordmark Palato horizontal (1183x218 cropeado al bbox). Fondo
              alpha=0. Experimento +10%: navbar h-[3.85rem] (61.6px) +
              logo h-[2.2rem] (35.2px). Si no convence, volver a navbar
              h-14 + logo h-8. */}
          <Image
            src="/img/palato_logo_horizontal_trim_light.png"
            alt=""
            width={1183}
            height={218}
            priority
            aria-hidden
            className="block h-[2.2rem] w-auto dark:hidden"
          />
          <Image
            src="/img/palato_logo_horizontal_trim_dark.png"
            alt=""
            width={1183}
            height={218}
            priority
            aria-hidden
            className="hidden h-[2.2rem] w-auto dark:block"
          />
        </Link>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
