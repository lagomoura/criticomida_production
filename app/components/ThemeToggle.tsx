'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../lib/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const label = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={
        'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ' +
        'text-text-secondary hover:bg-surface-subtle hover:text-text-primary ' +
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]'
      }
    >
      <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} aria-hidden className="h-4 w-4" />
    </button>
  );
}
