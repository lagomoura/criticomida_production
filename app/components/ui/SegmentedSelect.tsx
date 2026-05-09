'use client';

import React from 'react';
import { vibrateOnce } from '@/app/lib/utils/haptics';

export interface SegmentedOption<V extends string> {
  value: V;
  emoji?: string;
  label: string;
  /** Tone used when this option is selected. */
  tone?: 'positive' | 'neutral' | 'negative';
}

interface SegmentedSelectProps<V extends string> {
  /** Visible header above the row. Pass empty string to hide. */
  label: string;
  options: SegmentedOption<V>[];
  value: V | null;
  onChange: (next: V | null) => void;
  /** Cap on desktop (sm+). Mobile defaults to a 3-col wrap. */
  columns?: 2 | 3 | 4 | 5;
  disabled?: boolean;
  /** When true, tapping the selected option clears the value. Default true. */
  allowDeselect?: boolean;
  /** Optional sub-hint under the label. */
  hint?: string;
}

const TONE_STYLES: Record<NonNullable<SegmentedOption<string>['tone']>, string> = {
  // Albahaca = confirmación/positivo (semánticamente correcto).
  // Azafrán queda reservado para CTA/acción primaria (tone="neutral").
  // text-text-inverse (blanco) sobre Albahaca (#3A6645): contraste ~7.5:1 AA.
  positive: 'border-[color:var(--color-albahaca)] bg-[color:var(--color-albahaca)] text-text-inverse shadow-sm',
  neutral:  'border-action-primary bg-action-primary text-text-inverse shadow-sm',
  negative: 'border-[color:var(--color-paprika)] bg-[color:var(--color-paprika)] text-text-inverse shadow-sm',
};

/** Mobile defaults wrap at 3-col so 4/5-col layouts don't shrink tap targets
 * below 44pt. Desktop unfolds to the requested cap. */
const COLUMN_CLASSES: Record<2 | 3 | 4 | 5, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-3 sm:grid-cols-5',
};

export default function SegmentedSelect<V extends string>({
  label,
  options,
  value,
  onChange,
  columns = 3,
  disabled = false,
  allowDeselect = true,
  hint,
}: SegmentedSelectProps<V>) {
  function handleSelect(next: V) {
    const isSame = value === next;
    if (isSame && allowDeselect) {
      vibrateOnce(8);
      onChange(null);
      return;
    }
    vibrateOnce(14);
    onChange(next);
  }

  return (
    <div>
      {(label || hint) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && (
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              {label}
            </span>
          )}
          {hint && (
            <span className="font-sans text-[11px] text-text-muted">{hint}</span>
          )}
        </div>
      )}
      <div role="radiogroup" aria-label={label || undefined} className={`grid gap-2 ${COLUMN_CLASSES[columns]}`}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const tone = opt.tone ?? 'positive';
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => handleSelect(opt.value)}
              className={
                'flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-2 font-sans text-xs font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ' +
                (isSelected
                  ? TONE_STYLES[tone]
                  : 'border-border-subtle bg-surface-page text-text-secondary hover:border-border-default hover:bg-surface-subtle')
              }
            >
              {opt.emoji && (
                <span className="text-base leading-none" aria-hidden="true">
                  {opt.emoji}
                </span>
              )}
              <span className="text-[11px] leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
