'use client';

import { FormEvent, useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import { cn } from '@/app/lib/utils/cn';

export type AuthTab = 'login' | 'register';

export interface AuthFormProps {
  initialTab?: AuthTab;
  /** Called after a successful login or register. Receives the active tab so
   *  callers can redirect or close a modal. */
  onSuccess?: (tab: AuthTab) => void;
  /** Render the segmented tabs to swap between login and register. Default true. */
  showTabs?: boolean;
  /** Optional autofocus on the first input of the active form. Default true. */
  autoFocusFirst?: boolean;
  /** Notify parent when the active tab changes (e.g., to update modal title). */
  onTabChange?: (tab: AuthTab) => void;
}

export default function AuthForm({
  initialTab = 'login',
  onSuccess,
  showTabs = true,
  autoFocusFirst = true,
  onTabChange,
}: AuthFormProps) {
  const { login, register } = useAuthContext();
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setFormError(null);
    onTabChange?.(tab);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      setPassword('');
      onSuccess?.('login');
    } catch (err) {
      setFormError(
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : 'No se pudo iniciar sesión.',
      );
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
      onSuccess?.('register');
    } catch (err) {
      setFormError(
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : 'No se pudo registrar la cuenta.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {showTabs && (
        <div className="mb-5 flex gap-1 rounded-lg bg-surface-subtle p-1">
          <TabButton active={activeTab === 'login'} onClick={() => handleTab('login')} disabled={submitting}>
            Iniciar sesión
          </TabButton>
          <TabButton active={activeTab === 'register'} onClick={() => handleTab('register')} disabled={submitting}>
            Registrarse
          </TabButton>
        </div>
      )}

      {activeTab === 'login' ? (
        <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
          <Input
            key="login-email"
            autoFocus={autoFocusFirst}
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
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleRegister} noValidate>
          <Input
            key="reg-name"
            autoFocus={autoFocusFirst}
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
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </form>
      )}
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
