'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';
import { useAuthContext } from './AuthContext';
import type { SocialNotification } from '../types/social';

const POLL_MS = 60_000;

interface NotificationContextValue {
  items: SocialNotification[];
  unreadCount: number;
  loading: boolean;
  /** Forces a full refresh of both count and list. */
  refresh: () => Promise<void>;
  /** Optimistic mark-as-read for a single notification. */
  markRead: (id: string) => Promise<void>;
  /** Optimistic mark-all-read. */
  markAllRead: () => Promise<void>;
}

const defaultValue: NotificationContextValue = {
  items: [],
  unreadCount: 0,
  loading: false,
  refresh: async () => {},
  markRead: async () => {},
  markAllRead: async () => {},
};

const NotificationContext = createContext<NotificationContextValue>(defaultValue);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthContext();
  const [items, setItems] = useState<SocialNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Track latest values in refs so poll callbacks don't re-create on each tick.
  const pausedRef = useRef(false);

  const fetchCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Swallow transient errors — badge keeps its last value.
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [page, count] = await Promise.all([getNotifications(), getUnreadCount()]);
      setItems(page.items);
      setUnreadCount(count);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch {
      // Eventual consistency: next poll will reconcile.
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // Next poll reconciles.
    }
  }, []);

  // Initial load + polling, gated on auth.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Reset on logout.
      setItems([]);
      setUnreadCount(0);
      return;
    }

    void refresh();

    const interval = window.setInterval(() => {
      if (!pausedRef.current) {
        void fetchCount();
      }
    }, POLL_MS);

    const onVisibility = () => {
      pausedRef.current = document.hidden;
      // When returning to the tab, pull a fresh count immediately.
      if (!document.hidden) {
        void fetchCount();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authLoading, user, refresh, fetchCount]);

  return (
    <NotificationContext.Provider
      value={{ items, unreadCount, loading, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  return useContext(NotificationContext);
}
