'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Chip from '@/app/components/ui/Chip';
import { cn } from '@/app/lib/utils/cn';

interface ChipInputProps {
  /** Visible header above the chip area. */
  label?: string;
  /** Selected items rendered as removable chips. */
  items: string[];
  onChange: (next: string[]) => void;
  /** Optional preset suggestions. Tap toggles in/out of `items`. */
  presets?: string[];
  placeholder?: string;
  /** Tone applied to selected items. */
  tone?: 'positive' | 'negative' | 'neutral';
  disabled?: boolean;
  /** Override the per-chip remove aria-label. Falls back to `chip.remove`. */
  removeLabel?: (item: string) => string;
  /**
   * Mobile keyboard capitalization for the typed input. Defaults to
   * `'sentences'` (pros/cons style: natural-language fragments). Use
   * `'none'` for tag-style chips that are lowercase by convention.
   */
  autoCapitalize?: 'sentences' | 'words' | 'none' | 'off';
}

const ACTIVE_TONE: Record<NonNullable<ChipInputProps['tone']>, string> = {
  positive: 'border-transparent bg-color-dorado text-text-inverse',
  negative: 'border-transparent bg-color-terracota-deep text-text-inverse',
  neutral: 'border-transparent bg-action-primary text-text-inverse',
};

export default function ChipInput({
  label,
  items,
  onChange,
  presets,
  placeholder,
  tone = 'neutral',
  disabled = false,
  removeLabel,
  autoCapitalize = 'sentences',
}: ChipInputProps) {
  const t = useTranslations('restaurant.dishReviewForm');
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const v = draft.trim();
    if (!v) return;
    if (items.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...items, v]);
    setDraft('');
  }

  function togglePreset(preset: string) {
    if (items.includes(preset)) {
      onChange(items.filter((x) => x !== preset));
    } else {
      onChange([...items, preset]);
    }
  }

  function removeItem(item: string) {
    onChange(items.filter((x) => x !== item));
  }

  // Presets that are already selected get rendered as active chips; ones
  // still on offer get rendered with dashed-outline affordance.
  const remainingPresets = (presets ?? []).filter((p) => !items.includes(p));

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          {label}
        </label>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Chip
              key={item}
              onRemove={disabled ? undefined : () => removeItem(item)}
              removeLabel={removeLabel ? removeLabel(item) : undefined}
              className={ACTIVE_TONE[tone]}
            >
              {item}
            </Chip>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commitDraft();
            }
          }}
          onBlur={commitDraft}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          autoCapitalize={autoCapitalize}
          className={cn(
            // text-base on mobile prevents iOS Safari zoom on focus.
            'h-10 flex-1 rounded-xl border border-border-subtle bg-surface-card px-3.5 font-sans text-base text-text-primary sm:text-sm',
            'placeholder:text-text-muted/80 transition-all',
            'focus:border-color-terracota focus:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        />
        <button
          type="button"
          onClick={commitDraft}
          disabled={disabled || !draft.trim()}
          aria-label={t('addChip')}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-text-muted transition-colors hover:border-color-terracota hover:text-color-terracota disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>＋</span>
        </button>
      </div>

      {remainingPresets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remainingPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => togglePreset(preset)}
              disabled={disabled}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-dashed border-border-default bg-surface-card px-3 py-2 font-sans text-xs text-text-secondary transition-all hover:border-color-terracota hover:bg-color-terracota-pale hover:text-color-terracota-deep disabled:opacity-40"
            >
              <span aria-hidden>+</span>
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
