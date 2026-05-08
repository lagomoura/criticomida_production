'use client';

import { useEffect, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/app/lib/i18n/navigation';
import { routing } from '@/app/lib/i18n/routing';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faXmark } from '@fortawesome/free-solid-svg-icons';

const STORAGE_KEY = 'palato.langBanner.v1';

type SupportedLocale = (typeof routing.locales)[number];

const STRINGS: Record<SupportedLocale, { hint: string; cta: string; dismissAria: string }> = {
  es: {
    hint: 'Tu navegador está configurado en español.',
    cta: 'Ver Palato en español',
    dismissAria: 'Cerrar',
  },
  en: {
    hint: 'Your browser is set to English.',
    cta: 'View Palato in English',
    dismissAria: 'Dismiss',
  },
  pt: {
    hint: 'Seu navegador está em português.',
    cta: 'Ver Palato em português',
    dismissAria: 'Fechar',
  },
};

function detectPreferredLocale(): SupportedLocale | null {
  if (typeof navigator === 'undefined') return null;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  const supported = routing.locales as readonly string[];
  for (const tag of langs) {
    const code = tag.toLowerCase().split('-')[0];
    if (supported.includes(code)) return code as SupportedLocale;
  }
  return null;
}

export default function LocaleMismatchBanner() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [suggested, setSuggested] = useState<SupportedLocale | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const preferred = detectPreferredLocale();
    if (preferred && preferred !== locale) setSuggested(preferred);
  }, [locale]);

  if (!suggested) return null;
  const strings = STRINGS[suggested];

  const handleAccept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {}
    setSuggested(null);
    startTransition(() => {
      router.replace(pathname, { locale: suggested });
    });
  };

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {}
    setSuggested(null);
  };

  return (
    <div
      role="region"
      aria-label={strings.hint}
      className="border-b border-border-default bg-surface-subtle"
    >
      <div className="cc-container flex flex-wrap items-center gap-2 px-4 py-2 sm:flex-nowrap sm:gap-3">
        <FontAwesomeIcon
          icon={faGlobe}
          aria-hidden
          className="h-4 w-4 shrink-0 text-text-secondary"
        />
        <span className="flex-1 font-sans text-sm text-text-primary">{strings.hint}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isPending}
            className="inline-flex h-8 items-center rounded-full bg-action-primary px-4 font-sans text-xs font-semibold text-text-inverse transition-colors hover:bg-action-primary-hover disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {strings.cta}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={strings.dismissAria}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-card hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <FontAwesomeIcon icon={faXmark} aria-hidden className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
