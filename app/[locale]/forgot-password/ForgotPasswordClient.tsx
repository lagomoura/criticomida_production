'use client';

import { useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import { forgotPassword } from '@/app/lib/api/auth';

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error' };

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const t = useTranslations('auth.forgotPassword');
  const tCommon = useTranslations('common');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState({ kind: 'sending' });
    try {
      await forgotPassword(email.trim());
      setState({ kind: 'sent' });
    } catch {
      setState({ kind: 'error' });
    }
  }

  const sentHtml = (t.raw('sentMessage') as string).replace(
    '{email}',
    `<strong>${email.replace(/[<>&"']/g, (c) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] ?? c),
    )}</strong>`,
  );

  return (
    <div className="cc-container flex flex-col gap-4 py-12 max-w-md mx-auto">
      <h1 className="font-display text-3xl font-medium">{t('title')}</h1>
      <p className="font-sans text-sm text-text-muted">{t('subtitle')}</p>

      {state.kind === 'sent' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p
            className="font-sans text-sm text-emerald-900"
            dangerouslySetInnerHTML={{ __html: sentHtml }}
          />
          <p className="mt-3 font-sans text-xs text-emerald-700">
            {t('sentHint')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-sans text-sm font-semibold">{t('emailLabel')}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
            />
          </label>
          {state.kind === 'error' && (
            <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
              {t('errorMessage')}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={state.kind === 'sending'}
            disabled={state.kind === 'sending'}
          >
            {t('submit')}
          </Button>
        </form>
      )}

      <Link
        href="/"
        className="font-sans text-sm text-[var(--color-terracota-deep)] no-underline hover:underline"
      >
        ← {tCommon('backToHome')}
      </Link>
    </div>
  );
}
