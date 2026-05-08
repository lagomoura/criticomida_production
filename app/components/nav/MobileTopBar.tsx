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
      className="sticky top-0 z-40 border-b border-border-default bg-surface-page/85 backdrop-blur md:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md no-underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <Image src="/img/logosm.png" alt="" width={28} height={28} aria-hidden />
          <span className="font-display text-lg font-medium text-text-primary">
            {t('siteName')}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
