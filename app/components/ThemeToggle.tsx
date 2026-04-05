'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../lib/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
      }
      className={
        'navlink-animate rounded-lg border border-main-pink/40 px-2.5 py-1.5 ' +
        'text-main-pink hover:bg-main-pink/10 focus-visible:outline-none ' +
        'focus-visible:ring-2 focus-visible:ring-main-pink focus-visible:ring-offset-2'
      }
    >
      <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} aria-hidden />
    </button>
  );
}
