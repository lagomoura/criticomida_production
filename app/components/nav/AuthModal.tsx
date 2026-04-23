'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import { cn } from '@/app/lib/utils/cn';

export type AuthTab = 'login' | 'register';

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
  /** Called after a successful login or register. */
  onSuccess?: () => void;
}

export default function AuthModal({ open, onClose, initialTab = 'login', onSuccess }: AuthModalProps) {
  const { login, register } = useAuthContext();
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = (document.activeElement as HTMLElement) ?? null;
      setActiveTab(initialTab);
      setFormError(null);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open, submitting, onClose]);

  const safeClose = useCallback(() => {
    if (!submitting) {
      setFormError(null);
      onClose();
    }
  }, [submitting, onClose]);

  const handleTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setFormError(null);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      setPassword('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError && typeof err.detail === 'string' ? err.detail : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await register(regEmail.trim(), regPassword, regDisplayName.trim());
      setRegPassword('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError && typeof err.detail === 'string' ? err.detail : 'No se pudo registrar la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={safeClose}
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 w-full max-w-md overscroll-contain rounded-2xl border border-border-default bg-surface-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="auth-modal-title" className="m-0 font-display text-2xl font-medium text-text-primary">
            {activeTab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <button
            type="button"
            onClick={safeClose}
            disabled={submitting}
            aria-label="Cerrar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faXmark} aria-hidden />
          </button>
        </div>

        <div className="mb-5 flex gap-1 rounded-lg bg-surface-subtle p-1">
          <TabButton active={activeTab === 'login'} onClick={() => handleTab('login')} disabled={submitting}>
            Iniciar sesión
          </TabButton>
          <TabButton active={activeTab === 'register'} onClick={() => handleTab('register')} disabled={submitting}>
            Registrarse
          </TabButton>
        </div>

        {activeTab === 'login' ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
            <Input
              key="login-email"
              autoFocus
              label="Correo"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            {formError && (
              <p className="m-0 font-sans text-sm text-action-danger" role="status" aria-live="polite">
                {formError}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" loading={submitting}>
              Entrar
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleRegister} noValidate>
            <Input
              key="reg-name"
              autoFocus
              label="Nombre de usuario"
              type="text"
              name="displayName"
              autoComplete="name"
              required
              value={regDisplayName}
              onChange={(e) => setRegDisplayName(e.target.value)}
              disabled={submitting}
            />
            <Input
              label="Correo"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              disabled={submitting}
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              disabled={submitting}
            />
            {formError && (
              <p className="m-0 font-sans text-sm text-action-danger" role="status" aria-live="polite">
                {formError}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" loading={submitting}>
              Crear cuenta
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'flex-1 rounded-md py-1.5 font-sans text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        active ? 'bg-surface-card text-action-primary shadow-sm' : 'text-text-muted hover:text-text-secondary',
      )}
    >
      {children}
    </button>
  );
}
