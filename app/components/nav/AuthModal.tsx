'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/app/components/ui/Modal';
import AuthForm, { type AuthTab } from './AuthForm';

export type { AuthTab };

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
  /** Called after a successful login or register. */
  onSuccess?: () => void;
}

export default function AuthModal({ open, onClose, initialTab = 'login', onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const t = useTranslations('auth');

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tab === 'login' ? t('signIn') : t('createAccount')}
      size="md"
      position="bottom-sheet"
    >
      <AuthForm
        initialTab={tab}
        onTabChange={setTab}
        onSuccess={() => {
          onSuccess?.();
          onClose();
        }}
      />
    </Modal>
  );
}
