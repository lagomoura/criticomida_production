'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useTheme } from '../lib/contexts/ThemeContext';
import { cn } from '../lib/utils/cn';

export interface ThemeToggleProps {
  /**
   * 'icon' (default) — compact circular button for nav/headers.
   * 'pill'           — two-zone sliding pill for settings rows.
   */
  variant?: 'icon' | 'pill';
}

export default function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('themeToggle');

  const isDark = theme === 'dark';

  // Dynamic aria-label: describe current state + action
  const currentLabel = isDark ? t('currentDark') : t('currentLight');
  const switchLabel = isDark ? t('switchToLight') : t('switchToDark');
  const ariaLabel = `${currentLabel}. ${switchLabel}`;

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={ariaLabel}
        aria-pressed={isDark}
        title={switchLabel}
        className={cn(
          // Pill shell — min 44px tall for touch target
          'relative inline-flex h-11 w-[88px] shrink-0 items-center rounded-full border border-border-default',
          'bg-surface-subtle p-1 transition-colors duration-200',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          // Hover
          'hover:bg-surface-card',
        )}
      >
        {/* Sliding ball — motion-safe for prefers-reduced-motion */}
        <span
          aria-hidden
          className={cn(
            'absolute top-1 h-9 w-9 rounded-full bg-surface-card shadow-[var(--shadow-card)]',
            'motion-safe:transition-transform motion-safe:duration-[220ms] motion-safe:ease-out',
            isDark ? 'translate-x-[44px]' : 'translate-x-0',
          )}
        />
        {/* Sun zone (left) */}
        <span
          aria-hidden
          className={cn(
            'relative z-10 flex h-9 w-9 items-center justify-center',
            !isDark ? 'text-action-primary' : 'text-text-muted',
          )}
        >
          <FontAwesomeIcon icon={faSun} className="h-4 w-4" />
        </span>
        {/* Moon zone (right) */}
        <span
          aria-hidden
          className={cn(
            'relative z-10 flex h-9 w-9 items-center justify-center',
            isDark ? 'text-action-primary' : 'text-text-muted',
          )}
        >
          <FontAwesomeIcon icon={faMoon} className="h-4 w-4" />
        </span>
      </button>
    );
  }

  // variant === 'icon' — original compact button, tap target bumped to h-11 w-11
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={switchLabel}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors',
        'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
      )}
    >
      <FontAwesomeIcon icon={isDark ? faSun : faMoon} aria-hidden className="h-4 w-4" />
    </button>
  );
}
