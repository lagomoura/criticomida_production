'use client';

import { useCallback, useState } from 'react';
import AuthModal, { type AuthTab } from './AuthModal';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import { useNotifications } from '@/app/lib/contexts/NotificationContext';

/**
 * Wraps the site chrome: TopNav (md+) + BottomNav (mobile) + AuthModal.
 * Owns the modal open/close state so any nav affordance that requires
 * auth can trigger it.
 */
export default function NavShell() {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<AuthTab>('login');
  const { unreadCount } = useNotifications();

  const openAuthModal = useCallback((tab: AuthTab = 'login') => {
    setInitialTab(tab);
    setModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <TopNav onOpenAuthModal={() => openAuthModal('login')} unreadCount={unreadCount} />
      <BottomNav onOpenAuthModal={() => openAuthModal('login')} unreadCount={unreadCount} />
      <AuthModal open={modalOpen} onClose={closeAuthModal} initialTab={initialTab} />
    </>
  );
}
