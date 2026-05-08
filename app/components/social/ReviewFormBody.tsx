'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { MealPeriod, PortionSize } from '@/app/lib/types';
import { formatCurrencySymbol } from '@/app/lib/utils/currency';
import StarRating from '@/app/[locale]/restaurants/[id]/components/StarRating';
import TechnicalPillars, {
  type TechnicalPillarsValue,
} from '@/app/[locale]/restaurants/[id]/components/TechnicalPillars';
import GhostwriterAssist from '@/app/components/ghostwriter/GhostwriterAssist';
import MentionTextarea from '@/app/components/social/MentionTextarea';
import SegmentedSelect from '@/app/components/ui/SegmentedSelect';
import ChipInput from '@/app/components/ui/ChipInput';
import { vibrateOnce } from '@/app/lib/utils/haptics';
import { compressImage } from '@/app/lib/utils/compressImage';

export interface PhotoEntry {
  id: number;
  file: File;
  preview: string;
}

export interface ExistingImage {
  id: string;
  url: string;
  alt_text: string | null;
}

export type CompanyType = 'solo' | 'family' | 'couple' | 'friends' | 'other';

/** Slugs persisted into `visited_with` when the user picks a preset. The
 * "other" branch persists the free text instead of the slug. The reverse
 * mapping (slug → preset) lives in `companyTypeFromVisitedWith()` so that
 * loading a saved review re-opens with the same preset selected. */
export const COMPANY_PRESET_SLUG_PREFIX = '__company:';

const COMPANY_PRESETS: CompanyType[] = ['solo', 'family', 'couple', 'friends'];

export interface ReviewFormBodyValue {
  rating: number;
  wouldOrderAgain: boolean | null;
  pillars: TechnicalPillarsValue;
  note: string;
  pros: string[];
  cons: string[];
  existingImages: ExistingImage[];
  photos: PhotoEntry[];
  /** Kept as string to tolerate partial input ("4500."). */
  pricePaid: string;
  portionSize: PortionSize | '';
  /** ISO YYYY-MM-DD. */
  dateTasted: string;
  /** Coarse meal period — replaces the legacy free-form HH:MM picker. */
  mealPeriod: MealPeriod | null;
  /** Company preset; null when not specified. */
  companyType: CompanyType | null;
  /** Free text only used when `companyType === 'other'`. */
  visitedWith: string;
  tags: string[];
  isAnonymous: boolean;
}

interface ReviewFormBodyProps {
  value: ReviewFormBodyValue;
  onChange: (next: ReviewFormBodyValue) => void;
  /** When the dish already exists (review/edit). Omit on create-new flows. */
  dishId?: string;
  dishName: string;
  /** ISO 4217. Drives the currency adornment of the price input. */
  currencyCode?: string | null;
  submitting: boolean;
}

let _id = 0;
export function nextEntryId() { return ++_id; }

export function makeInitialValue(): ReviewFormBodyValue {
  return {
    rating: 5,
    wouldOrderAgain: null,
    pillars: { presentation: null, value_prop: null, execution: null },
    note: '',
    pros: [],
    cons: [],
    existingImages: [],
    photos: [],
    pricePaid: '',
    portionSize: '',
    dateTasted: new Date().toISOString().slice(0, 10),
    mealPeriod: null,
    companyType: null,
    visitedWith: '',
    tags: [],
    isAnonymous: false,
  };
}

/** Infer a meal period from a legacy "HH:MM" / "HH:MM:SS" string so old
 * reviews still pre-fill the new picker on edit. */
export function inferMealPeriodFromTime(time: string | null): MealPeriod | null {
  if (!time) return null;
  const [h] = time.split(':');
  const hour = Number(h);
  if (!Number.isFinite(hour)) return null;
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 19) return 'snack';
  return 'dinner';
}

/** Reverse of the company-preset persistence: read a stored `visited_with`
 * value and recover both the preset slug and the free-text fallback. */
export function companyFromVisitedWith(value: string | null): {
  companyType: CompanyType | null;
  visitedWith: string;
} {
  if (!value) return { companyType: null, visitedWith: '' };
  if (value.startsWith(COMPANY_PRESET_SLUG_PREFIX)) {
    const slug = value.slice(COMPANY_PRESET_SLUG_PREFIX.length) as CompanyType;
    if ((COMPANY_PRESETS as string[]).includes(slug)) {
      return { companyType: slug, visitedWith: '' };
    }
  }
  // Anything else: it was free text — show as "other".
  return { companyType: 'other', visitedWith: value };
}

/** Forward mapping for persistence. Returns the string to save into
 * `visited_with`, or undefined when nothing should be sent. */
export function companyToVisitedWith(
  companyType: CompanyType | null,
  visitedWith: string,
): string | undefined {
  if (companyType === 'other') {
    const trimmed = visitedWith.trim();
    return trimmed || undefined;
  }
  if (companyType) return `${COMPANY_PRESET_SLUG_PREFIX}${companyType}`;
  return undefined;
}

export default function ReviewFormBody({
  value,
  onChange,
  dishId,
  dishName,
  currencyCode,
  submitting,
}: ReviewFormBodyProps) {
  const t = useTranslations('restaurant.dishReviewForm');
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const otherInputRef = useRef<HTMLInputElement | null>(null);
  // Latest-value mirror for async callbacks (image compression resolves after
  // re-renders, the closure's `value` is stale by then).
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function set<K extends keyof ReviewFormBodyValue>(
    key: K,
    next: ReviewFormBodyValue[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  function removeExistingImage(id: string) {
    onChange({
      ...value,
      existingImages: value.existingImages.filter((x) => x.id !== id),
    });
  }

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    // Show previews immediately with the originals so the dropzone responds
    // instantly. Compression happens in the background and swaps in the
    // smaller File before submit. Preview URLs stay valid: they point at the
    // originals which we keep around until the photo is removed/published.
    const entries: PhotoEntry[] = files.map((file) => ({
      id: nextEntryId(),
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange({ ...value, photos: [...value.photos, ...entries] });
    e.target.value = '';

    // Background compress: replace `file` per entry as each finishes. We
    // can't depend on `value` inside the async closure (it would close over
    // the stale value), so we use a functional-style reducer via the
    // onChange contract: the parent gets a fresh copy each time.
    entries.forEach((entry) => {
      void compressImage(entry.file).then((compressed) => {
        if (compressed === entry.file) return; // no-op when skipped
        // Update via a microtask: by this time React may have re-rendered
        // and replaced `value`. We rely on the parent to merge correctly by
        // photo id. Each call uses a fresh closure capturing the latest
        // entry id, not the value snapshot.
        replacePhotoFile(entry.id, compressed);
      });
    });
  }

  function replacePhotoFile(id: number, file: File) {
    // Use the ref so we read the latest value, not the closure from the
    // moment we kicked off the compression.
    const latest = valueRef.current;
    const idx = latest.photos.findIndex((p) => p.id === id);
    if (idx === -1) return; // user removed the photo before compression finished
    const next = latest.photos.slice();
    next[idx] = { ...next[idx], file };
    onChange({ ...latest, photos: next });
  }

  function removePhoto(id: number) {
    const removed = value.photos.find((x) => x.id === id);
    if (removed) URL.revokeObjectURL(removed.preview);
    onChange({ ...value, photos: value.photos.filter((x) => x.id !== id) });
  }

  // Auto-focus the "other" company input when the user picks it.
  useEffect(() => {
    if (value.companyType === 'other') {
      otherInputRef.current?.focus();
    }
  }, [value.companyType]);

  // Pull i18n preset arrays. `t.raw` returns the underlying JSON value.
  const prosPresets = (t.raw('prosPresets') as string[]) ?? [];
  const consPresets = (t.raw('consPresets') as string[]) ?? [];

  const portionOptions = [
    { value: 'small' as const, emoji: '🥄', label: t('portionSmall') },
    { value: 'medium' as const, emoji: '🍽️', label: t('portionMedium') },
    { value: 'large' as const, emoji: '🍲', label: t('portionLarge') },
  ];

  const mealOptions = [
    { value: 'breakfast' as const, emoji: '☕', label: t('mealBreakfast') },
    { value: 'lunch' as const, emoji: '🌞', label: t('mealLunch') },
    { value: 'snack' as const, emoji: '🍰', label: t('mealSnack') },
    { value: 'dinner' as const, emoji: '🌙', label: t('mealDinner') },
  ];

  const companyOptions = [
    { value: 'solo' as const, emoji: '🧍', label: t('companySolo') },
    { value: 'family' as const, emoji: '👨‍👩‍👧', label: t('companyFamily') },
    { value: 'couple' as const, emoji: '💑', label: t('companyCouple') },
    { value: 'friends' as const, emoji: '👯', label: t('companyFriends') },
    { value: 'other' as const, emoji: '✏️', label: t('companyOther') },
  ];

  return (
    <>
      {/* 1. Photos — first action, mobile convention (Instagram/TikTok).
          Empty state shows a full-width dropzone CTA so the affordance is
          impossible to miss on mobile; once the user adds at least one photo
          we collapse to a thumbnail grid with a same-size "+" tile. */}
      <div>
        <label className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          {t('photosLabel')}
        </label>
        {value.existingImages.length === 0 && value.photos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border-default bg-surface-card px-4 py-7 text-text-muted">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-color-azafran-pale text-color-azafran">
              <FontAwesomeIcon icon={faCamera} className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-sans text-sm font-semibold text-text-primary">
                {t('photoCtaTitle')}
              </span>
              <span className="font-sans text-[11px] text-text-muted">
                {t('photoCtaHelp')}
              </span>
            </div>
            <div className="mt-1 flex w-full max-w-xs gap-2">
              <button
                type="button"
                onClick={() => {
                  vibrateOnce(8);
                  cameraInputRef.current?.click();
                }}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-color-azafran px-3 py-2.5 font-sans text-sm font-semibold text-text-inverse shadow-[var(--shadow-micro)] transition-colors hover:bg-color-canela disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                <FontAwesomeIcon icon={faCamera} className="h-4 w-4" aria-hidden="true" />
                {t('photoCameraButton')}
              </button>
              <button
                type="button"
                onClick={() => {
                  vibrateOnce(8);
                  photoInputRef.current?.click();
                }}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-default bg-surface-page px-3 py-2.5 font-sans text-sm font-semibold text-text-secondary transition-colors hover:border-color-azafran hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                {t('photoGalleryButton')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.existingImages.map((img) => (
              <div key={img.id} className="relative h-24 w-24 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt_text ?? ''}
                  className="h-full w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  disabled={submitting}
                  aria-label={t('removePhoto')}
                  className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-color-paprika text-[15px] text-text-inverse shadow-[var(--shadow-base)] hover:bg-color-paprika-light focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                >
                  ×
                </button>
              </div>
            ))}
            {value.photos.map((photo) => (
              <div key={photo.id} className="relative h-24 w-24 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt=""
                  className="h-full w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  disabled={submitting}
                  aria-label={t('removePhoto')}
                  className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-color-paprika text-[15px] text-text-inverse shadow-[var(--shadow-base)] hover:bg-color-paprika-light focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                vibrateOnce(8);
                photoInputRef.current?.click();
              }}
              disabled={submitting}
              className="group flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-default bg-surface-card text-text-muted transition-all hover:border-color-azafran hover:bg-color-azafran-pale hover:text-color-azafran disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCamera} className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium">{t('photoButton')}</span>
            </button>
          </div>
        )}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handlePhotoAdd}
        />
        {/* `capture="environment"` opens the rear camera directly on mobile.
            It is incompatible with `multiple`, so we keep a separate input
            for the camera CTA and the gallery + thumbnail "+" tile keeps the
            multi-pick flow. */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handlePhotoAdd}
        />
      </div>

      {/* 1b. Ghostwriter banner — placed right after photos so the AI assist
          is contextual: subiste foto → te ayudamos a escribir. Conventional
          info-banner pattern (icon + title/desc + CTA). No idle animation:
          attention comes from brand color and clear hierarchy, not motion.
          DMMT: the AI is an offer, not the task — must read lighter than
          the actual review fields. */}
      <div className="rounded-2xl border border-color-azafran/40 bg-color-azafran-pale p-3.5 shadow-[var(--shadow-base)] dark:bg-[color-mix(in_srgb,var(--color-azafran)_14%,var(--surface-page))] sm:p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-color-azafran text-text-inverse shadow-[var(--shadow-micro)]"
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
          </span>
          <div className="flex flex-1 flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <p className="m-0 font-sans text-sm font-semibold text-text-primary">
                {t('ghostwriterIntroTitle')}
              </p>
              <p className="m-0 font-sans text-[12.5px] leading-snug text-text-secondary">
                {t('ghostwriterIntroDesc')}
              </p>
            </div>
            <GhostwriterAssist
              dishId={dishId}
              dishName={dishName}
              draft={value.note}
              defaultPhoto={value.photos[0]?.file ?? null}
              onPhotoUploaded={(file) => {
                const isDuplicate = value.photos.some(
                  (p) =>
                    p.file.name === file.name &&
                    p.file.size === file.size &&
                    p.file.lastModified === file.lastModified,
                );
                if (isDuplicate) return;
                onChange({
                  ...value,
                  photos: [
                    ...value.photos,
                    { id: nextEntryId(), file, preview: URL.createObjectURL(file) },
                  ],
                });
              }}
              onAddTag={(tag) => {
                if (value.tags.includes(tag)) return;
                set('tags', [...value.tags, tag]);
              }}
              onAddPro={(text) => {
                if (value.pros.includes(text)) return;
                set('pros', [...value.pros, text]);
              }}
              onAddCon={(text) => {
                if (value.cons.includes(text)) return;
                set('cons', [...value.cons, text]);
              }}
              onApplyBlurb={(text) => {
                const trimmed = value.note.trim();
                set('note', trimmed ? `${trimmed}\n\n${text}` : text);
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Rating + ¿lo pedirías? — the gate */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-card p-2.5 sm:p-3">
        <div>
          <label className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            {t('ratingLabel')} <span className="text-color-azafran">*</span>
          </label>
          <StarRating value={value.rating} onChange={(r) => set('rating', r)} size="lg" />
        </div>

        <div>
          <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            {t('wouldOrderAgainLabel')}
          </span>
          <div className="flex gap-2">
            {([
              { label: t('yes'), v: true },
              { label: t('no'), v: false },
            ] as const).map(({ label, v }) => (
              <button
                key={label}
                type="button"
                onClick={() => set('wouldOrderAgain', value.wouldOrderAgain === v ? null : v)}
                disabled={submitting}
                className={
                  'rounded-full border-2 px-4 py-2.5 font-sans text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ' +
                  (value.wouldOrderAgain === v
                    ? v
                      ? 'border-color-albahaca bg-color-albahaca text-text-inverse'
                      : 'border-color-paprika bg-color-paprika text-text-inverse'
                    : 'border-border-subtle bg-surface-page text-text-secondary hover:border-border-default hover:bg-surface-subtle')
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Pilares técnicos */}
      <TechnicalPillars
        value={value.pillars}
        onChange={(p) => set('pillars', p)}
        disabled={submitting}
      />

      {/* 4. Notes — full width, breathes */}
      <div>
        <label
          htmlFor="review-note"
          className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
        >
          {t('notesLabel')}
        </label>
        <MentionTextarea
          id="review-note"
          label={t('notesLabel')}
          hideLabel
          className="min-h-[120px]"
          rows={4}
          placeholder={t('notesPlaceholder')}
          value={value.note}
          onChange={(v) => set('note', v)}
          disabled={submitting}
        />
      </div>

      {/* 5. Pros — chips + preset suggestions */}
      <ChipInput
        label={t('prosLabel')}
        items={value.pros}
        onChange={(items) => set('pros', items)}
        presets={prosPresets}
        placeholder={t('prosPlaceholder')}
        tone="positive"
        disabled={submitting}
        removeLabel={(item) => `${t('removePro')} (${item})`}
      />

      {/* 6. Cons — chips + preset suggestions */}
      <ChipInput
        label={t('consLabel')}
        items={value.cons}
        onChange={(items) => set('cons', items)}
        presets={consPresets}
        placeholder={t('consPlaceholder')}
        tone="negative"
        disabled={submitting}
        removeLabel={(item) => `${t('removeCon')} (${item})`}
      />

      {/* 7+8. Portion + meal period — side-by-side on sm+ to save vertical room.
          Each one wraps in its own card so on mobile (stacked) the sections
          read as discrete groups instead of a single rail of buttons. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-2.5 sm:p-3">
          <SegmentedSelect
            label={t('portionLabel')}
            options={portionOptions}
            value={(value.portionSize || null) as PortionSize | null}
            onChange={(v) => set('portionSize', v ?? '')}
            columns={3}
            disabled={submitting}
          />
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-2.5 sm:p-3">
          <SegmentedSelect
            label={t('mealPeriodLabel')}
            options={mealOptions}
            value={value.mealPeriod}
            onChange={(v) => set('mealPeriod', v)}
            columns={4}
            disabled={submitting}
          />
        </div>
      </div>

      {/* 9. Company — preset, with free-text fallback when "other" */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface-card p-2.5 sm:p-3">
        <SegmentedSelect
          label={t('companyLabel')}
          options={companyOptions}
          value={value.companyType}
          onChange={(v) => {
            // Switching away from 'other' clears the free text so the next
            // submit doesn't carry stale visitedWith content.
            const next: Partial<ReviewFormBodyValue> = { companyType: v };
            if (v !== 'other') next.visitedWith = '';
            onChange({ ...value, ...next });
          }}
          columns={5}
          disabled={submitting}
        />
        {value.companyType === 'other' && (
          <input
            ref={otherInputRef}
            type="text"
            placeholder={t('companyOtherPlaceholder')}
            value={value.visitedWith}
            onChange={(e) => set('visitedWith', e.target.value)}
            disabled={submitting}
            maxLength={200}
            className="w-full rounded-xl border border-border-subtle bg-surface-page px-3.5 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted/80 transition-all focus:border-color-azafran focus:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-60"
          />
        )}
      </div>

      {/* 10. Price + date — 2-col on sm+, stacked on mobile */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="review-price"
            className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
          >
            {t('priceLabel')}
          </label>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-sans text-sm font-semibold text-text-muted"
            >
              {formatCurrencySymbol(currencyCode)}
            </span>
            <input
              id="review-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              className={inputBase + ' pl-9'}
              placeholder={t('pricePlaceholder')}
              value={value.pricePaid}
              onChange={(e) => set('pricePaid', e.target.value)}
              disabled={submitting}
              aria-describedby="review-price-help"
            />
          </div>
          <p
            id="review-price-help"
            className="mt-1 font-sans text-[11px] text-text-muted"
          >
            {t('priceHelp')}
          </p>
        </div>
        <div>
          <label
            htmlFor="review-date"
            className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
          >
            {t('dateLabel')}
          </label>
          <input
            id="review-date"
            type="date"
            className={inputBase}
            value={value.dateTasted}
            onChange={(e) => set('dateTasted', e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      {/* 11. Tags — free-form chips */}
      <ChipInput
        label={t('tagsLabel')}
        items={value.tags}
        onChange={(items) => set('tags', items)}
        placeholder={t('tagsPlaceholder')}
        tone="neutral"
        disabled={submitting}
      />

      {/* 12. Anonymous toggle */}
      <label className="flex cursor-pointer items-center gap-2 pt-1 font-sans text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={value.isAnonymous}
          onChange={(e) => set('isAnonymous', e.target.checked)}
          disabled={submitting}
          className="h-4 w-4 rounded border-border-default accent-color-azafran"
        />
        {t('anonymous')}
      </label>

    </>
  );
}

const inputBase = [
  'w-full rounded-xl border border-border-subtle bg-surface-card',
  'px-3.5 py-2.5 font-sans text-sm text-text-primary',
  'placeholder:text-text-muted/80 transition-all',
  'focus:border-color-azafran focus:outline-none',
  'focus-visible:[box-shadow:var(--focus-ring)]',
  'disabled:opacity-60',
].join(' ');
