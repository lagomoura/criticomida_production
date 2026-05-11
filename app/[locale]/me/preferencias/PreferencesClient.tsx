'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import {
  getMyChatPreferences,
  getMyTasteProfile,
  updateMyChatPreferences,
  updateMyTasteProfile,
  type ChatLanguage,
  type ChatResponseStyle,
  type TasteProfileRead,
  type UserChatPreference,
} from '@/app/lib/api/userPreferences';
import { useTour } from '@/app/components/tour/useTour';
import { HOME_TOUR } from '@/app/components/tour/tour-steps';

const LANGUAGE_OPTIONS: ChatLanguage[] = ['es', 'en', 'pt'];
const STYLE_OPTIONS: ChatResponseStyle[] = ['editorial', 'concise', 'warm'];

type LoadState =
  | { kind: 'checking' }
  | { kind: 'not_signed_in' }
  | { kind: 'loading' }
  | { kind: 'ready' }
  | { kind: 'error'; message: string };

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'error'; message: string };

/**
 * Settings page for B2C comensales — mirrors the Business
 * ``OwnerSettingsClient`` shape (auth gate, two sections, save
 * button, idle/saving/saved/error state machine).
 *
 * Two editable surfaces:
 *
 * 1. **Preferencias del chat** — `UserChatPreference`. Language +
 *    response style for the Sommelier. Persisted in
 *    ``user_chat_preferences``; the chat agent injects these into
 *    the system prompt at the start of every turn.
 * 2. **Tus gustos** — ``UserTasteProfile``. The inferred fields
 *    (dominant pillar, top neighborhoods, top categories, favourite
 *    tags, average price band) render read-only with a hint that
 *    they update from the comensal's reviews. Only ``allergies`` and
 *    ``preferred_hours`` are user-declared and editable here.
 *
 * The form posts both surfaces as a single "Guardar" so the comensal
 * gets one outcome (saved / error) rather than two independent
 * indicators.
 */
export default function PreferencesClient() {
  const t = useTranslations('preferences');
  const tTour = useTranslations('tour');
  const { user, isLoading: authLoading } = useAuthContext();
  const { restart: restartTour } = useTour();

  const [load, setLoad] = useState<LoadState>({ kind: 'checking' });
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });

  const [chatPrefs, setChatPrefs] = useState<UserChatPreference>({
    language_preference: null,
    response_style: null,
  });
  const [taste, setTaste] = useState<TasteProfileRead | null>(null);
  const [allergiesDraft, setAllergiesDraft] = useState('');

  // ── Bootstrap ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoad({ kind: 'not_signed_in' });
      return;
    }
    let cancelled = false;
    setLoad({ kind: 'loading' });
    Promise.all([getMyChatPreferences(), getMyTasteProfile()])
      .then(([prefs, profile]) => {
        if (cancelled) return;
        setChatPrefs(prefs);
        setTaste(profile);
        setAllergiesDraft((profile.allergies || []).join(', '));
        setLoad({ kind: 'ready' });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.detail
            : err instanceof Error
              ? err.message
              : t('errors.loadFailed');
        setLoad({ kind: 'error', message });
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, t]);

  // ── Save ──────────────────────────────────────────────────────────────
  const onSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (save.kind === 'saving') return;
      setSave({ kind: 'saving' });
      try {
        const allergiesParsed = allergiesDraft
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20);
        // ``preferred_hours`` is preserved as-is — the form doesn't
        // expose a manual editor (the field is auto-inferred from
        // review timestamps and adds little value when typed in by
        // hand). Sending the existing array back keeps the column
        // intact when the form saves.
        const preservedHours = (taste?.preferred_hours ?? []).slice();

        const [savedPrefs, savedTaste] = await Promise.all([
          updateMyChatPreferences(chatPrefs),
          updateMyTasteProfile({
            allergies: allergiesParsed,
            preferred_hours: preservedHours,
          }),
        ]);
        setChatPrefs(savedPrefs);
        setTaste(savedTaste);
        setAllergiesDraft((savedTaste.allergies || []).join(', '));
        setSave({ kind: 'saved' });
      } catch (err: unknown) {
        const message =
          err instanceof ApiError
            ? err.detail
            : err instanceof Error
              ? err.message
              : t('errors.saveFailed');
        setSave({ kind: 'error', message });
      }
    },
    [allergiesDraft, taste, chatPrefs, save.kind, t],
  );

  // ── Gate ──────────────────────────────────────────────────────────────
  if (load.kind === 'checking' || load.kind === 'loading') {
    return <p className="text-sm text-text-muted">{t('loading')}</p>;
  }
  if (load.kind === 'not_signed_in') {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 text-sm text-text-muted">
        {t('signInPrompt')}
      </div>
    );
  }
  if (load.kind === 'error') {
    return (
      <div className="rounded-2xl border border-border-subtle bg-action-danger/10 p-6 text-sm text-action-danger">
        {load.message}
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl text-text-primary">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{t('subtitle')}</p>
      </header>

      {/* ── Chat preferences ────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="font-display text-xl text-text-primary">
          {t('chat.heading')}
        </h2>
        <p className="text-sm text-text-muted">{t('chat.subtitle')}</p>

        <fieldset className="mt-2 flex flex-col gap-2">
          <legend className="text-sm font-medium text-text-primary">
            {t('chat.languageLabel')}
          </legend>
          <div className="flex flex-wrap gap-2">
            <RadioPill
              checked={chatPrefs.language_preference === null}
              onChange={() =>
                setChatPrefs((p) => ({ ...p, language_preference: null }))
              }
              label={t('chat.languageAuto')}
            />
            {LANGUAGE_OPTIONS.map((lang) => (
              <RadioPill
                key={lang}
                checked={chatPrefs.language_preference === lang}
                onChange={() =>
                  setChatPrefs((p) => ({ ...p, language_preference: lang }))
                }
                label={t(`chat.languages.${lang}`)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-2 flex flex-col gap-2">
          <legend className="text-sm font-medium text-text-primary">
            {t('chat.styleLabel')}
          </legend>
          <div className="flex flex-wrap gap-2">
            <RadioPill
              checked={chatPrefs.response_style === null}
              onChange={() =>
                setChatPrefs((p) => ({ ...p, response_style: null }))
              }
              label={t('chat.styleAuto')}
            />
            {STYLE_OPTIONS.map((style) => (
              <RadioPill
                key={style}
                checked={chatPrefs.response_style === style}
                onChange={() =>
                  setChatPrefs((p) => ({ ...p, response_style: style }))
                }
                label={t(`chat.styles.${style}`)}
              />
            ))}
          </div>
        </fieldset>
      </section>

      {/* ── Taste profile ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="font-display text-xl text-text-primary">
          {t('taste.heading')}
        </h2>
        <p className="text-sm text-text-muted">{t('taste.subtitle')}</p>

        {taste && (
          <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
            <ReadOnlyField
              label={t('taste.dominantPillar')}
              value={
                taste.dominant_pillar
                  ? t(`taste.pillars.${taste.dominant_pillar}`)
                  : null
              }
              empty={t('taste.empty')}
            />
            <ReadOnlyField
              label={t('taste.topNeighborhoods')}
              value={taste.top_neighborhoods.join(', ') || null}
              empty={t('taste.empty')}
            />
            <ReadOnlyField
              label={t('taste.topCategories')}
              value={taste.top_categories.join(', ') || null}
              empty={t('taste.empty')}
            />
            <ReadOnlyField
              label={t('taste.priceBand')}
              value={
                taste.avg_price_band
                  ? t(`taste.priceBands.${taste.avg_price_band}`)
                  : null
              }
              empty={t('taste.empty')}
            />
          </div>
        )}

        <p className="mt-2 text-xs text-text-muted">{t('taste.inferredHint')}</p>

        <label className="mt-3 flex flex-col gap-1 text-sm">
          <span className="font-medium text-text-primary">
            {t('taste.allergiesLabel')}
          </span>
          <span className="text-xs text-text-muted">
            {t('taste.allergiesHint')}
          </span>
          <input
            type="text"
            value={allergiesDraft}
            onChange={(e) => setAllergiesDraft(e.target.value)}
            placeholder={t('taste.allergiesPlaceholder')}
            className="mt-1 rounded-md border border-border-default bg-surface-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:[box-shadow:var(--focus-ring)]"
          />
        </label>
      </section>

      {/* ── Tour guiado ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="font-display text-xl text-text-primary">
          {tTour('settings.heading')}
        </h2>
        <p className="text-sm text-text-muted">
          {tTour('settings.subtitle')}
        </p>
        <button
          type="button"
          onClick={() => {
            void restartTour(HOME_TOUR.id);
          }}
          className="mt-1 inline-flex items-center justify-center self-start rounded-full border border-border-strong bg-transparent px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          {tTour('settings.restart')}
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={save.kind === 'saving'}
          className="inline-flex items-center justify-center rounded-full bg-action-primary px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {save.kind === 'saving' ? t('saving') : t('save')}
        </button>
        {save.kind === 'saved' && (
          <span className="text-sm text-action-primary">{t('saved')}</span>
        )}
        {save.kind === 'error' && (
          <span className="text-sm text-action-danger">{save.message}</span>
        )}
      </footer>
    </form>
  );
}

interface RadioPillProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

function RadioPill({ checked, onChange, label }: RadioPillProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={
        checked
          ? 'rounded-full border border-action-primary bg-action-primary/10 px-3 py-1 text-sm text-action-primary'
          : 'rounded-full border border-border-default bg-surface-card px-3 py-1 text-sm text-text-primary hover:border-action-primary hover:text-action-primary'
      }
      aria-pressed={checked}
    >
      {label}
    </button>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value: string | null;
  empty: string;
}

function ReadOnlyField({ label, value, empty }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-surface-subtle px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <span className="text-sm text-text-primary">
        {value ?? <em className="text-text-muted not-italic">{empty}</em>}
      </span>
    </div>
  );
}
