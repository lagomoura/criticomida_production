'use client';

import { useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import { resetPassword } from '@/app/lib/api/auth';
import { ApiError } from '@/app/lib/api/client';

interface Props {
  token: string;
}

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

export default function ResetPasswordClient({ token }: Props) {
  const router = useRouter();
  const t = useTranslations('auth.resetPassword');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  const valid = password.length >= 8 && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setState({ kind: 'submitting' });
    try {
      await resetPassword(token, password);
      setState({ kind: 'success' });
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setState({
        kind: 'error',
        message:
          err instanceof ApiError && err.status === 400
            ? t('errorExpired')
            : t('errorGeneric'),
      });
    }
  }

  return (
    <div className="cc-container flex flex-col gap-4 py-12 max-w-md mx-auto">
      <h1 className="font-display text-3xl font-medium">{t('title')}</h1>

      {state.kind === 'success' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-sans text-sm text-emerald-900">
            {t('successMessage')}
          </p>
        </div>
      ) : (
        <>
          <p className="font-sans text-sm text-text-muted">
            {t('subtitle')}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-sans text-sm font-semibold">
                {t('newPassword')}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
              />
              <span className="font-sans text-xs text-text-muted">
                {t('minChars')}
              </span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-sans text-sm font-semibold">
                {t('repeatPassword')}
              </span>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
              />
              {confirm && password !== confirm && (
                <span className="font-sans text-xs text-action-danger">
                  {t('noMatch')}
                </span>
              )}
            </label>

            {state.kind === 'error' && (
              <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
                {state.message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={state.kind === 'submitting'}
              disabled={!valid || state.kind === 'submitting'}
            >
              {t('submit')}
            </Button>
          </form>
        </>
      )}

      <Link
        href="/forgot-password"
        className="font-sans text-sm text-text-muted no-underline hover:underline"
      >
        {t('requestNew')}
      </Link>
    </div>
  );
}
