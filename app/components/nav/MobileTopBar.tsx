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
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          aria-label={t('siteName')}
          className="flex items-center rounded-md no-underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          {/* Wordmark Palato horizontal trimmed. Mismo asset que TopNav
              — pill negro de marca, ahora con letras legibles a 28px de
              alto (~120px de ancho). */}
          <Image
            src="/img/palato_logo_horizontal_trim.png"
            alt=""
            width={238}
            height={56}
            priority
            aria-hidden
            className="h-7 w-auto"
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
