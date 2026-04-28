'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../lib/contexts/AuthContext';
import { ThemeProvider } from '../lib/contexts/ThemeContext';
import { NotificationProvider } from '../lib/contexts/NotificationContext';
import { ToastProvider } from './ui/Toast';
import ChatWidget from './ChatWidget';
import NavShell from './nav/NavShell';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-action-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-text-inverse focus:shadow-lg"
            >
              Saltar al contenido
            </a>
            <NavShell />
            {/* pb = 64px (BottomNav height) en mobile; 0 en md+ (TopNav es sticky sin solape) */}
            <div className="pb-16 md:pb-0">{children}</div>
            <ChatWidget />
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
