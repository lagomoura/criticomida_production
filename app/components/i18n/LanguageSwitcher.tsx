'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/app/lib/i18n/navigation';
import { routing } from '@/app/lib/i18n/routing';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';

const SHORT: Record<string, string> = { es: 'ES', en: 'EN', pt: 'PT' };

export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
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

  const choose = (next: (typeof routing.locales)[number]) => {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('label')}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-full border border-border-default bg-surface-card px-3',
          'font-sans text-xs font-semibold text-text-secondary transition-colors',
          'hover:bg-surface-subtle hover:text-text-primary',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          'disabled:opacity-60',
        )}
      >
        <FontAwesomeIcon icon={faGlobe} aria-hidden className="h-3.5 w-3.5" />
        <span>{SHORT[locale] ?? locale.toUpperCase()}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          aria-hidden
          className={cn('h-2.5 w-2.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('label')}
          className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-border-default bg-surface-card p-1 shadow-[var(--shadow-elevated)]"
        >
          {routing.locales.map((loc) => {
            const isActive = loc === locale;
            return (
              <li key={loc}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => choose(loc)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-sans text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                    isActive
                      ? 'bg-surface-subtle text-text-primary'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                  )}
                >
                  <span className="w-7 font-semibold tracking-wider text-text-muted">
                    {SHORT[loc] ?? loc.toUpperCase()}
                  </span>
                  <span className="flex-1">{t(loc)}</span>
                  {isActive && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      aria-hidden
                      className="h-3 w-3 text-action-primary"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
