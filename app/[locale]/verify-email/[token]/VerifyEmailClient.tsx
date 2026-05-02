'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import { verifyEmail } from '@/app/lib/api/auth';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

interface Props {
  token: string;
}

type State =
  | { kind: 'verifying' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

export default function VerifyEmailClient({ token }: Props) {
  const { refreshUser } = useAuthContext();
  const t = useTranslations('auth.verifyEmail');
  const tCommon = useTranslations('common');
  const [state, setState] = useState<State>({ kind: 'verifying' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await verifyEmail(token);
        if (cancelled) return;
        setState({ kind: 'success' });
        await refreshUser().catch(() => {});
      } catch {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: t('errorMessage'),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, refreshUser, t]);

  return (
    <div className="cc-container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
      {state.kind === 'verifying' && (
        <>
          <span className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
          <p className="font-sans text-sm text-text-muted">
            {t('verifying')}
          </p>
        </>
      )}

      {state.kind === 'success' && (
        <>
          <h1 className="font-display text-3xl font-medium text-emerald-700">
            {t('successTitle')}
          </h1>
          <p className="font-sans text-sm text-text-secondary">
            {t('successMessage')}
          </p>
          <Link href="/">
            <Button variant="primary" size="md">
              {t('goToFeed')}
            </Button>
          </Link>
        </>
      )}

      {state.kind === 'error' && (
        <>
          <h1 className="font-display text-3xl font-medium text-red-700">
            {t('errorTitle')}
          </h1>
          <p className="font-sans text-sm text-text-secondary max-w-md">
            {state.message}
          </p>
          <Link href="/">
            <Button variant="outline" size="md">
              {tCommon('backToHome')}
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
