'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../lib/contexts/AuthContext';
import Navbar from './Navbar';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  );
}
