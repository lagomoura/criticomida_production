'use client';

import { useEffect, useId, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { trapFocus } from './focusTrap';

const Z_INDEX = 2147483647; // por encima del spotlight

export interface TooltipPosition {
  top: number;
  left: number;
  /** Origen de la animación de entrada (`scale(0.96) → 1`). */
  transformOrigin?: string;
}

interface TourTooltipProps {
  titleKey: string;
  bodyKey: string;
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  position: TooltipPosition;
  reducedMotion: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function TourTooltip({
  titleKey,
  bodyKey,
  currentStep,
  totalSteps,
  isFirst,
  isLast,
  position,
  reducedMotion,
  onPrev,
  onNext,
  onSkip,
}: TourTooltipProps) {
  const t = useTranslations('tour');
  const cardRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    if (!cardRef.current) return;
    const cleanup = trapFocus(cardRef.current);
    return cleanup;
  }, [currentStep]);

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: Z_INDEX,
        width: 'min(360px, calc(100vw - 32px))',
        transformOrigin: position.transformOrigin ?? 'center',
        animation: reducedMotion
          ? undefined
          : 'palato-tour-tooltip-in 320ms var(--ease-spoon, cubic-bezier(0.34, 1.56, 0.64, 1)) both',
      }}
      className="rounded-2xl border border-border-default bg-surface-page p-6 shadow-[var(--shadow-floating)]"
    >
      <div className="mb-3 flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const active = i === currentStep;
          return (
            <span
              key={i}
              className="inline-block h-1.5 rounded-full"
              style={{
                width: active ? 18 : 6,
                backgroundColor: active
                  ? 'var(--color-terracota)'
                  : 'var(--border-default)',
                transition: reducedMotion
                  ? 'none'
                  : 'width 220ms var(--ease-spoon, cubic-bezier(0.34, 1.56, 0.64, 1)), background-color 220ms ease',
              }}
            />
          );
        })}
      </div>

      <p
        className="mb-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-text-muted"
        aria-live="polite"
      >
        {t('progress', { current: currentStep + 1, total: totalSteps })}
      </p>

      <h2
        id={titleId}
        className="mb-2 font-display text-2xl font-medium leading-tight text-text-primary"
      >
        {t(`steps.${titleKey}.title`)}
      </h2>

      <p id={bodyId} className="mb-5 font-sans text-sm leading-relaxed text-text-secondary">
        {t(`steps.${bodyKey}.body`)}
      </p>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-md px-2 py-1 font-sans text-xs text-text-muted underline-offset-2 hover:text-text-secondary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          {t('buttons.skip')}
        </button>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex h-9 items-center rounded-full px-3 font-sans text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {t('buttons.back')}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            autoFocus
            className="inline-flex h-9 items-center rounded-full bg-action-primary px-4 font-sans text-sm font-semibold text-text-inverse shadow-[var(--shadow-base)] transition-all hover:-translate-y-px hover:bg-action-primary-hover hover:shadow-[var(--shadow-media)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {isLast ? t('buttons.finish') : isFirst ? t('buttons.start') : t('buttons.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
