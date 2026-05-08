'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { PillarScore } from '@/app/lib/types';

type PillarKey = 'presentation' | 'value_prop' | 'execution';

interface PillarOption {
  value: PillarScore;
  emoji: string;
  label: string;
  /** Tone applied when this option is selected. */
  tone: 'negative' | 'neutral' | 'positive';
  /** Micro-copy that appears below the row when this option is selected. */
  microCopy?: string;
}

interface PillarConfig {
  key: PillarKey;
  title: string;
  hint: string;
  options: [PillarOption, PillarOption, PillarOption];
}

const TONE_STYLES: Record<PillarOption['tone'], string> = {
  negative: 'border-rose-500 bg-rose-500 text-white shadow-sm',
  neutral: 'border-amber-400 bg-amber-400 text-white shadow-sm',
  positive: 'border-emerald-500 bg-emerald-500 text-white shadow-sm',
};

function vibrateOnce(ms = 12) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(ms);
    }
  } catch {
    /* noop — not supported / blocked */
  }
}

export interface TechnicalPillarsValue {
  presentation: PillarScore | null;
  value_prop: PillarScore | null;
  execution: PillarScore | null;
}

interface TechnicalPillarsProps {
  value: TechnicalPillarsValue;
  onChange: (next: TechnicalPillarsValue) => void;
  visible?: boolean;
  disabled?: boolean;
}

export default function TechnicalPillars({
  value,
  onChange,
  visible = true,
  disabled = false,
}: TechnicalPillarsProps) {
  const t = useTranslations('restaurant.technicalPillars');

  const PILLARS: PillarConfig[] = useMemo(() => [
    {
      key: 'presentation',
      title: t('presentationTitle'),
      hint: t('presentationHint'),
      options: [
        { value: 1, emoji: '📸', label: t('presentationPoor'), tone: 'negative', microCopy: t('presentationPoorMicro') },
        { value: 2, emoji: '🆗', label: t('presentationNormal'), tone: 'neutral' },
        { value: 3, emoji: '🌟', label: t('presentationGreat'), tone: 'positive', microCopy: t('presentationGreatMicro') },
      ],
    },
    {
      key: 'value_prop',
      title: t('valueTitle'),
      hint: t('valueHint'),
      options: [
        { value: 1, emoji: '💸', label: t('valueExpensive'), tone: 'negative', microCopy: t('valueExpensiveMicro') },
        { value: 2, emoji: '⚖️', label: t('valueFair'), tone: 'neutral' },
        { value: 3, emoji: '💎', label: t('valueGreat'), tone: 'positive', microCopy: t('valueGreatMicro') },
      ],
    },
    {
      key: 'execution',
      title: t('executionTitle'),
      hint: t('executionHint'),
      options: [
        { value: 1, emoji: '❌', label: t('executionPoor'), tone: 'negative', microCopy: t('executionPoorMicro') },
        { value: 2, emoji: '🥣', label: t('executionOk'), tone: 'neutral' },
        { value: 3, emoji: '👨‍🍳', label: t('executionGreat'), tone: 'positive', microCopy: t('executionGreatMicro') },
      ],
    },
  ], [t]);

  const completed = useMemo(
    () => Number(value.presentation != null) + Number(value.value_prop != null) + Number(value.execution != null),
    [value],
  );

  function handleSelect(key: PillarKey, score: PillarScore) {
    const current = value[key];
    const next: PillarScore | null = current === score ? null : score;
    vibrateOnce(next == null ? 8 : 14);
    onChange({ ...value, [key]: next });
  }

  return (
    <section
      aria-labelledby="technical-pillars-title"
      className={
        'overflow-hidden transition-all duration-300 ease-out ' +
        (visible
          ? 'pointer-events-auto max-h-[1000px] translate-y-0 opacity-100'
          : 'pointer-events-none max-h-0 -translate-y-1 opacity-0')
      }
      aria-hidden={!visible}
    >
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-2.5 sm:p-3">
        <header className="mb-2 flex items-baseline justify-between gap-2">
          <div>
            <h3
              id="technical-pillars-title"
              className="font-sans text-sm font-semibold text-text-primary"
            >
              {t('heading')}
              <span className="ml-2 font-normal text-text-muted">{t('optional')}</span>
            </h3>
            <p className="m-0 font-sans text-xs text-text-muted">
              {t('explanationLead')}
              <span className="font-semibold text-color-azafran">{t('expertBadge')}</span>
              {t('explanationTrail')}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full bg-surface-subtle px-2 py-0.5 font-sans text-[11px] font-semibold text-text-secondary"
            aria-label={t('completionAria', { count: completed })}
          >
            {completed}/3
          </span>
        </header>

        <div className="flex flex-col gap-2">
          {PILLARS.map((pillar) => {
            const selected = value[pillar.key];
            const selectedOption = pillar.options.find((o) => o.value === selected);
            return (
              <div key={pillar.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span
                    id={`pillar-${pillar.key}-label`}
                    className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
                  >
                    {pillar.title}
                  </span>
                  <span className="font-sans text-[11px] text-text-muted">{pillar.hint}</span>
                </div>
                <div
                  role="radiogroup"
                  aria-labelledby={`pillar-${pillar.key}-label`}
                  className="grid grid-cols-3 gap-2"
                >
                  {pillar.options.map((opt) => {
                    const isSelected = selected === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={disabled}
                        onClick={() => handleSelect(pillar.key, opt.value)}
                        className={
                          'flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-1.5 font-sans text-[11px] font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ' +
                          (isSelected
                            ? TONE_STYLES[opt.tone]
                            : 'border-border-subtle bg-surface-page text-text-secondary hover:border-border-default hover:bg-surface-subtle')
                        }
                      >
                        <span className="text-base leading-none" aria-hidden="true">
                          {opt.emoji}
                        </span>
                        <span className="leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div
                  className={
                    'overflow-hidden transition-all duration-200 ease-out ' +
                    (selectedOption?.microCopy
                      ? 'mt-1.5 max-h-8 opacity-100'
                      : 'max-h-0 opacity-0')
                  }
                  aria-live="polite"
                >
                  {selectedOption?.microCopy && (
                    <p className="m-0 font-sans text-[11px] font-medium italic text-text-muted">
                      {selectedOption.microCopy}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
