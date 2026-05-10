'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import Button from '@/app/components/ui/Button';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import { createClaim } from '@/app/lib/api/claims';
import type { VerificationMethod } from '@/app/lib/types/claim';

interface Props {
  restaurantSlug: string;
  restaurantName: string;
  restaurantLocation: string;
  isAlreadyClaimed: boolean;
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; method: VerificationMethod };

export default function ClaimFormClient({
  restaurantSlug,
  restaurantName,
  restaurantLocation,
  isAlreadyClaimed,
}: Props) {
  const { user, isLoading: authLoading } = useAuthContext();
  const t = useTranslations('claim');

  const METHOD_OPTIONS: {
    value: VerificationMethod;
    label: string;
    hint: string;
  }[] = [
    {
      value: 'domain_email',
      label: t('methodDomainLabel'),
      hint: t('methodDomainHint'),
    },
    {
      value: 'google_business',
      label: t('methodGoogleLabel'),
      hint: t('methodGoogleHint'),
    },
    {
      value: 'phone_callback',
      label: t('methodPhoneLabel'),
      hint: t('methodPhoneHint'),
    },
    {
      value: 'manual_admin',
      label: t('methodManualLabel'),
      hint: t('methodManualHint'),
    },
  ];

  const [method, setMethod] = useState<VerificationMethod>('domain_email');
  const [contactEmail, setContactEmail] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState('');
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  if (isAlreadyClaimed) {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">
          {t('alreadyClaimed')}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {t('alreadyClaimedDescription', { name: restaurantName })}
        </p>
        <div>
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="text-sm font-semibold text-[var(--color-terracota-deep)] no-underline hover:underline"
          >
            {t('backToRestaurant', { name: restaurantName })}
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[40vh] items-center justify-center py-12">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">{t('needAccount')}</h1>
        <p className="font-sans text-sm text-text-muted">
          {t('needAccountDescription')}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="text-sm font-semibold text-text-muted no-underline hover:underline"
          >
            {t('backToRestaurantShort')}
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: 'submitting' });

    const evidence = evidenceUrls
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await createClaim(restaurantSlug, {
        verification_method: method,
        contact_email: contactEmail.trim() || null,
        evidence_urls: evidence.length > 0 ? evidence : undefined,
      });
      setState({ kind: 'success', method });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 409
            ? t('errorConflict')
            : err.status === 400
              ? t('errorBadRequest')
              : err.status === 429
                ? t('errorRateLimit')
                : t('errorGeneric')
          : t('errorGeneric');
      setState({ kind: 'error', message });
    }
  }

  if (state.kind === 'success') {
    return (
      <div className="cc-container flex flex-col gap-4 py-12">
        <h1 className="font-display text-3xl font-medium">
          {t('successTitle')}
        </h1>
        {state.method === 'domain_email' ? (
          <p className="font-sans text-sm text-text-secondary">
            {t('successDomainEmail')}
          </p>
        ) : (
          <p className="font-sans text-sm text-text-secondary">
            {t('successManual')}
          </p>
        )}
        <div>
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="text-sm font-semibold text-[var(--color-terracota-deep)] no-underline hover:underline"
          >
            {t('backToRestaurantShort')}
          </Link>
        </div>
      </div>
    );
  }

  const selectedHint = METHOD_OPTIONS.find((m) => m.value === method)?.hint;
  const requiresEmail = method === 'domain_email';

  return (
    <div className="cc-container flex flex-col gap-5 py-8">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
          {t('kicker')}
        </p>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">
          {restaurantName}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {restaurantLocation}
        </p>
      </header>

      <p className="font-sans text-sm text-text-secondary">
        {t('intro')}
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-2">
          <legend className="font-sans text-sm font-semibold text-text-primary">
            {t('verifyHowLegend')}
          </legend>
          {METHOD_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border-default bg-surface-card p-3 hover:bg-surface-subtle"
            >
              <input
                type="radio"
                name="verification_method"
                value={opt.value}
                checked={method === opt.value}
                onChange={() => setMethod(opt.value)}
                className="mt-1"
              />
              <span className="flex flex-col">
                <span className="font-sans text-sm font-semibold text-text-primary">
                  {opt.label}
                </span>
                <span className="font-sans text-xs text-text-muted">
                  {opt.hint}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {selectedHint && (
          <p className="rounded-md bg-surface-subtle px-3 py-2 font-sans text-xs text-text-secondary">
            {selectedHint}
          </p>
        )}

        <label className="flex flex-col gap-1">
          <span className="font-sans text-sm font-semibold text-text-primary">
            {t('contactEmailLabel')}
            {requiresEmail && (
              <span className="ml-1 text-action-danger">*</span>
            )}
          </span>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required={requiresEmail}
            placeholder={
              requiresEmail
                ? t('contactEmailDomainPlaceholder')
                : t('contactEmailGenericPlaceholder')
            }
            className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-sans text-sm font-semibold text-text-primary">
            {t('evidenceLabel')}
          </span>
          <span className="font-sans text-xs text-text-muted">
            {t('evidenceHint')}
          </span>
          <textarea
            rows={4}
            value={evidenceUrls}
            onChange={(e) => setEvidenceUrls(e.target.value)}
            placeholder="https://..."
            className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
          />
        </label>

        {state.kind === 'error' && (
          <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
            {state.message}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="font-sans text-sm text-text-muted no-underline hover:underline"
          >
            {t('cancel')}
          </Link>
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={state.kind === 'submitting'}
            disabled={state.kind === 'submitting'}
          >
            {t('submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}
