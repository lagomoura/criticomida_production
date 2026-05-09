'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import { useToast } from '@/app/components/ui/Toast';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import { getRestaurant } from '@/app/lib/api/restaurants';
import {
  getOwnerChatPreference,
  updateOwnerChatPreference,
  type ChatLanguage,
  type ChatTone,
  type OwnerChatPreference,
} from '@/app/lib/api/owner-content';

interface Props {
  restaurantSlug: string;
  restaurantName: string;
}

type GateState =
  | { kind: 'checking' }
  | { kind: 'forbidden' }
  | { kind: 'not_signed_in' }
  | { kind: 'authorized' };

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'error'; message: string };

const TONE_OPTIONS: ChatTone[] = [
  'professional',
  'warm',
  'concise',
  'match_brand',
];
const LANGUAGE_OPTIONS: ChatLanguage[] = ['es', 'en', 'pt'];

// Curated KPI catalogue for the settings panel. The chat tool accepts
// any string list, but the panel is a finite, opinionated UI — these
// four are the ones the Business agent actually surfaces today.
const KPI_OPTIONS = [
  'rating_avg',
  'response_rate',
  'review_count_30d',
  'sentiment_breakdown',
] as const;

export default function OwnerSettingsClient({
  restaurantSlug,
  restaurantName,
}: Props) {
  const { user, isLoading: authLoading } = useAuthContext();
  const t = useTranslations('ownerSettings');
  const toast = useToast();

  const [gate, setGate] = useState<GateState>({ kind: 'checking' });
  const [tone, setTone] = useState<ChatTone | ''>('');
  const [language, setLanguage] = useState<ChatLanguage | ''>('');
  const [kpis, setKpis] = useState<string[]>([]);
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setGate({ kind: 'not_signed_in' });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const detail = await getRestaurant(restaurantSlug);
        if (cancelled) return;
        const isAdmin = user.role === 'admin';
        if (!detail.viewer_is_owner && !isAdmin) {
          setGate({ kind: 'forbidden' });
          return;
        }
        setGate({ kind: 'authorized' });
        const pref = await getOwnerChatPreference(restaurantSlug).catch(
          () => null,
        );
        if (cancelled || pref === null) return;
        setTone(pref.tone_preference ?? '');
        setLanguage(pref.language_preference ?? '');
        setKpis(pref.kpi_focus ?? []);
      } catch {
        if (!cancelled) setGate({ kind: 'forbidden' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, restaurantSlug]);

  const handleSave = useCallback(async () => {
    setSave({ kind: 'saving' });
    const payload: OwnerChatPreference = {
      tone_preference: tone === '' ? null : tone,
      language_preference: language === '' ? null : language,
      kpi_focus: kpis.length > 0 ? kpis : null,
    };
    try {
      const updated = await updateOwnerChatPreference(restaurantSlug, payload);
      setTone(updated.tone_preference ?? '');
      setLanguage(updated.language_preference ?? '');
      setKpis(updated.kpi_focus ?? []);
      setSave({ kind: 'idle' });
      toast.success(t('savedToast'), t('savedToastDescription'));
    } catch (err) {
      setSave({
        kind: 'error',
        message: err instanceof ApiError ? err.message : t('saveError'),
      });
    }
  }, [tone, language, kpis, restaurantSlug, t, toast]);

  const toggleKpi = useCallback((value: string) => {
    setKpis((current) =>
      current.includes(value)
        ? current.filter((k) => k !== value)
        : [...current, value],
    );
  }, []);

  if (gate.kind === 'checking') {
    return (
      <div className="cc-container py-12">
        <p className="font-sans text-sm text-text-muted">{t('loading')}</p>
      </div>
    );
  }

  if (gate.kind === 'not_signed_in') {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">
          {t('signInTitle')}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {t('signInDescription')}
        </p>
        <Link
          href="/login"
          className="self-start text-sm font-semibold text-[var(--color-canela)] no-underline hover:underline"
        >
          {t('signInAction')}
        </Link>
      </div>
    );
  }

  if (gate.kind === 'forbidden') {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">
          {t('forbiddenTitle')}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {t('forbiddenDescription', { name: restaurantName })}
        </p>
        <Link
          href={`/restaurants/${restaurantSlug}`}
          className="self-start text-sm font-semibold text-[var(--color-canela)] no-underline hover:underline"
        >
          {t('backToRestaurant')}
        </Link>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-8 py-8">
      <nav aria-label={t('backToDashboard')}>
        <Link
          href={`/restaurants/${restaurantSlug}/owner`}
          className="inline-flex min-h-[44px] items-center font-sans text-sm text-text-muted no-underline hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          {t('backToDashboard')}
        </Link>
      </nav>

      <header className="flex flex-col gap-1">
        <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
          {t('kicker')}
        </p>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">
          {t('title')}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {t('subtitle', { name: restaurantName })}
        </p>
      </header>

      <section className="flex flex-col gap-6 rounded-2xl border border-border-default bg-surface-card p-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="tone"
            className="font-sans text-sm font-medium text-text-primary"
          >
            {t('tone.label')}
          </label>
          <p className="font-sans text-xs text-text-muted">
            {t('tone.hint')}
          </p>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as ChatTone | '')}
            className="rounded-lg border border-border-default bg-surface-card px-3 py-2 font-sans text-base sm:text-sm focus:border-[var(--color-canela)] focus:outline-none"
          >
            <option value="">{t('tone.optionDefault')}</option>
            {TONE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`tone.option_${value}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="language"
            className="font-sans text-sm font-medium text-text-primary"
          >
            {t('language.label')}
          </label>
          <p className="font-sans text-xs text-text-muted">
            {t('language.hint')}
          </p>
          <select
            id="language"
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as ChatLanguage | '')
            }
            className="rounded-lg border border-border-default bg-surface-card px-3 py-2 font-sans text-base sm:text-sm focus:border-[var(--color-canela)] focus:outline-none"
          >
            <option value="">{t('language.optionDefault')}</option>
            {LANGUAGE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`language.option_${value}`)}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-sans text-sm font-medium text-text-primary">
            {t('kpis.label')}
          </legend>
          <p className="font-sans text-xs text-text-muted">{t('kpis.hint')}</p>
          <div className="flex flex-col gap-2 pt-1">
            {KPI_OPTIONS.map((value) => {
              const checked = kpis.includes(value);
              return (
                <label
                  key={value}
                  className="flex cursor-pointer items-start gap-2 font-sans text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleKpi(value)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-default text-[var(--color-canela)] focus:ring-[var(--color-canela)]"
                  />
                  <span>
                    <span className="font-medium text-text-primary">
                      {t(`kpis.option_${value}.label`)}
                    </span>{' '}
                    <span className="text-text-muted">
                      {t(`kpis.option_${value}.hint`)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={save.kind === 'saving'}
          >
            {save.kind === 'saving' ? t('savingAction') : t('saveAction')}
          </Button>
          {save.kind === 'error' && (
            <span
              role="alert"
              className="rounded-md bg-action-danger/10 px-3 py-1 font-sans text-xs text-action-danger"
            >
              {save.message}
            </span>
          )}
        </div>
      </section>

      <Link
        href={`/restaurants/${restaurantSlug}/owner`}
        className="self-start text-sm font-semibold text-text-muted no-underline hover:underline"
      >
        {t('backToDashboard')}
      </Link>
    </div>
  );
}
