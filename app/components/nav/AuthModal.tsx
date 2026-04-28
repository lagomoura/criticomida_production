'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      size="md"
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
