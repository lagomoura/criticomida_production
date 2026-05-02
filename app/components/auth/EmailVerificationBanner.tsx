'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { resendVerificationEmail } from '@/app/lib/api/auth';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

export default function EmailVerificationBanner() {
  const { user, isLoading } = useAuthContext();
  const t = useTranslations('auth.verifyEmailBanner');
  const tCommon = useTranslations('common');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !user) return null;
  if (user.email_verified !== false) return null;
  if (dismissed) return null;

  async function handleResend() {
    setState('sending');
    try {
      await resendVerificationEmail();
      setState('sent');
    } catch {
      setState('error');
    }
  }

  return (
    <div
      role="status"
      className="w-full bg-amber-100 px-4 py-2 text-center font-sans text-sm text-amber-900"
    >
      <span
        className="mr-2"
        dangerouslySetInnerHTML={{
          __html: t.raw('message').replace('{email}', user.email),
        }}
      />
      {state === 'sent' ? (
        <span className="text-emerald-700">{t('resent')}</span>
      ) : state === 'error' ? (
        <span className="text-red-700">{t('resendError')}</span>
      ) : (
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={state === 'sending'}
          className="font-semibold underline hover:no-underline disabled:opacity-60"
        >
          {state === 'sending' ? tCommon('sending') : t('resend')}
        </button>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={tCommon('close')}
        className="ml-3 text-amber-700/70 hover:text-amber-900"
      >
        ✕
      </button>
    </div>
  );
}
