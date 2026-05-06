'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import { checkHandleAvailable } from '@/app/lib/api/auth';
import { useDebounce } from '@/app/lib/hooks/useDebounce';
import { cn } from '@/app/lib/utils/cn';

export type AuthTab = 'login' | 'register';

export interface AuthFormProps {
  initialTab?: AuthTab;
  onSuccess?: (tab: AuthTab) => void;
  showTabs?: boolean;
  autoFocusFirst?: boolean;
  onTabChange?: (tab: AuthTab) => void;
}

const HANDLE_RE = /^[a-zA-Z0-9_]{3,30}$/;

type HandleStatus =
  | 'idle'
  | 'invalid'
  | 'checking'
  | 'available'
  | 'taken'
  | 'error';

export default function AuthForm({
  initialTab = 'login',
  onSuccess,
  showTabs = true,
  autoFocusFirst = true,
  onTabChange,
}: AuthFormProps) {
  const { login, register } = useAuthContext();
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const t = useTranslations('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regHandle, setRegHandle] = useState('');
  const [handleStatus, setHandleStatus] = useState<HandleStatus>('idle');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const debouncedHandle = useDebounce(regHandle.trim(), 400);

  // Live availability check on the username field. The local regex
  // gates the network request: we never hit the API for inputs the
  // backend would reject anyway.
  useEffect(() => {
    if (activeTab !== 'register') return;

    if (!debouncedHandle) {
      setHandleStatus('idle');
      return;
    }
    if (!HANDLE_RE.test(debouncedHandle)) {
      setHandleStatus('invalid');
      return;
    }

    let cancelled = false;
    setHandleStatus('checking');
    checkHandleAvailable(debouncedHandle)
      .then((res) => {
        if (cancelled) return;
        if (res.available) {
          setHandleStatus('available');
        } else {
          setHandleStatus(res.reason === 'invalid_format' ? 'invalid' : 'taken');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setHandleStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedHandle, activeTab]);

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
          : t('loginError'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (handleStatus !== 'available') return;
    setFormError(null);
    setSubmitting(true);
    try {
      await register(regEmail.trim(), regPassword, regHandle.trim());
      setRegPassword('');
      onSuccess?.('register');
    } catch (err) {
      setFormError(
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : t('registerError'),
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
            {t('signIn')}
          </TabButton>
          <TabButton active={activeTab === 'register'} onClick={() => handleTab('register')} disabled={submitting}>
            {t('register')}
          </TabButton>
        </div>
      )}

      {activeTab === 'login' ? (
        <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
          <Input
            key="login-email"
            autoFocus={autoFocusFirst}
            label={t('email')}
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
          <Input
            label={t('password')}
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
            {submitting ? t('entering') : t('enter')}
          </Button>
          <Link
            href="/forgot-password"
            className="self-center font-sans text-xs text-text-muted no-underline hover:underline"
          >
            {t('forgotPasswordLink')}
          </Link>
        </form>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleRegister} noValidate>
          <div className="flex flex-col gap-1.5">
            <Input
              key="reg-handle"
              autoFocus={autoFocusFirst}
              label={t('username')}
              type="text"
              name="username"
              autoComplete="username"
              required
              value={regHandle}
              onChange={(e) => setRegHandle(e.target.value)}
              disabled={submitting}
              placeholder="lagomoura"
              maxLength={30}
            />
            <HandleStatusLine status={handleStatus} t={t} />
          </div>
          <Input
            label={t('email')}
            type="email"
            name="email"
            autoComplete="email"
            required
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            disabled={submitting}
          />
          <Input
            label={t('password')}
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
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={submitting || handleStatus !== 'available'}
          >
            {submitting ? t('creatingAccount') : t('createAccount')}
          </Button>
        </form>
      )}
    </div>
  );
}

function HandleStatusLine({
  status,
  t,
}: {
  status: HandleStatus;
  t: ReturnType<typeof useTranslations>;
}) {
  if (status === 'idle') {
    return (
      <span className="font-sans text-xs text-text-muted" id="handle-help">
        {t('usernameHint')}
      </span>
    );
  }
  if (status === 'invalid') {
    return (
      <span className="font-sans text-xs text-text-muted" role="status" aria-live="polite">
        {t('usernameInvalid')}
      </span>
    );
  }
  if (status === 'checking') {
    return (
      <span className="font-sans text-xs text-text-muted" role="status" aria-live="polite">
        {t('usernameChecking')}
      </span>
    );
  }
  if (status === 'available') {
    return (
      <span className={cn('font-sans text-xs', 'text-success')} role="status" aria-live="polite">
        ✓ {t('usernameAvailable')}
      </span>
    );
  }
  if (status === 'taken') {
    return (
      <span className="font-sans text-xs text-action-danger" role="status" aria-live="polite">
        ✗ {t('usernameTaken')}
      </span>
    );
  }
  return (
    <span className="font-sans text-xs text-action-danger" role="status" aria-live="polite">
      {t('usernameCheckError')}
    </span>
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
