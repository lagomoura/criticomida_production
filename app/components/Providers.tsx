'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../lib/contexts/AuthContext';
import { ThemeProvider } from '../lib/contexts/ThemeContext';
import ChatWidget from './ChatWidget';
import Navbar from './Navbar';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
    <AuthProvider>
      <a
        href="#main-content"
        className={
          'sr-only focus:not-sr-only focus:absolute focus:left-4 ' +
          'focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-main-pink ' +
          'focus:px-4 focus:py-2 focus:text-sm focus:font-semibold ' +
          'focus:text-white focus:shadow-lg'
        }
      >
        Saltar al contenido
      </a>
      <Navbar />
      {children}
      <ChatWidget />
    </AuthProvider>
    </ThemeProvider>
  );
}
