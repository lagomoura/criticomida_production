"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import * as Sentry from '@sentry/nextjs';
import { User } from '../types';
import * as authApi from '../api/auth';
import { clearSessionCookies } from '../api/client';

// Sin email — postura conservadora. id correlaciona con eventos del BE,
// handle es el público y role permite filtrar issues por segmento (admin
// vs critic vs user) sin compartir PII con el vendor.
function syncSentryUser(user: User | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      username: user.handle ?? undefined,
      segment: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    handle: string
  ) => Promise<void>;
  /** Re-fetch `/api/auth/me` and update local user. Callers use this after
   * editing the profile so every consumer of `useAuthContext()` sees the new
   * data without re-logging. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      syncSentryUser(currentUser);
    } catch {
      await clearSessionCookies();
      setUser(null);
      syncSentryUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    function handleAuthCleared() {
      setUser(null);
      syncSentryUser(null);
    }
    window.addEventListener('auth:cleared', handleAuthCleared);
    return () => window.removeEventListener('auth:cleared', handleAuthCleared);
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    syncSentryUser(currentUser);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    syncSentryUser(null);
  };

  const register = async (
    email: string,
    password: string,
    handle: string
  ) => {
    await authApi.register({ email, password, handle });
    await authApi.login(email, password);
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    syncSentryUser(currentUser);
  };

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    syncSentryUser(currentUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
