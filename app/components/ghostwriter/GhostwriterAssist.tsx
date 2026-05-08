'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCircleNotch,
  faPenFancy,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  GhostwriterSuggestions,
  assistWithUpload,
} from '@/app/lib/api/ghostwriter';
import { cn } from '@/app/lib/utils/cn';

interface GhostwriterAssistProps {
  /** Dish being reviewed. Helps the model bias tags toward what it expects. */
  dishId?: string;
  dishName: string;
  /** Current draft text — lets us show which suggested tags are net-new. */
  draft: string;
  /**
   * Photo the user already attached to the review. When provided, we
   * use it directly; otherwise we expose an inline file picker.
   */
  defaultPhoto?: File | null;
  /** Insert a tag into the form's tags input (comma-separated). */
  onAddTag: (tag: string) => void;
  /** Insert a pro/con into the form's lists. */
  onAddPro: (text: string) => void;
  onAddCon: (text: string) => void;
  /** Append the editorial blurb to the note field. */
  onApplyBlurb: (text: string) => void;
  /**
   * Called whenever the user picks a NEW photo from the Ghostwriter
   * input (i.e. one that isn't ``defaultPhoto``). Lets the parent form
   * mirror it into the review's photos so a single upload feeds both
   * the analysis and the published post.
   */
  onPhotoUploaded?: (file: File) => void;
}

/**
 * Inline panel with a "Ask the Ghostwriter" button that opens a
 * suggestion dialog. The user picks (or reuses) a photo, the API runs
 * Gemini Vision, and the result is rendered as clickable chips so the
 * reviewer remains the editor in chief.
 */
export default function GhostwriterAssist({
  dishId,
  dishName,
  draft,
  defaultPhoto,
  onAddTag,
  onAddPro,
  onAddCon,
  onApplyBlurb,
  onPhotoUploaded,
}: GhostwriterAssistProps) {
  const t = useTranslations('chat.ghostwriter');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] =
    useState<GhostwriterSuggestions | null>(null);
  const [usedTags, setUsedTags] = useState<Set<string>>(new Set());
  const [usedPros, setUsedPros] = useState<Set<string>>(new Set());
  const [usedCons, setUsedCons] = useState<Set<string>>(new Set());
  const [blurbApplied, setBlurbApplied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function runAssist(photo: File) {
    setBusy(true);
    setError(null);
    try {
      const result = await assistWithUpload({
        photo,
        dishId,
        draftText: draft,
      });
      setSuggestions(result);
      setUsedTags(new Set());
      setUsedPros(new Set());
      setUsedCons(new Set());
      setBlurbApplied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    if (defaultPhoto && !suggestions) {
      void runAssist(defaultPhoto);
    }
  }

  function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    // Reset the input so picking the same filename twice still fires.
    e.target.value = '';
    onPhotoUploaded?.(f);
    void runAssist(f);
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {!open && (
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-full',
            'bg-color-azafran px-4 py-2 text-text-inverse',
            'font-sans text-sm font-semibold',
            'shadow-[var(--shadow-micro)] transition-colors',
            'hover:bg-color-canela',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          )}
        >
          <FontAwesomeIcon icon={faPenFancy} aria-hidden className="h-3.5 w-3.5" />
          {t('button')}
        </button>
      )}

      {open && (
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 text-left shadow-[var(--shadow-micro)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-action-primary">
                {t('label')}
              </span>
              <span className="font-display text-sm font-medium text-text-primary">
                {dishName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-text-muted hover:bg-surface-page hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              aria-label={t('close')}
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden />
            </button>
          </div>

          {!suggestions && !busy && !error && (
            <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border-default bg-surface-page p-4 text-sm text-text-muted">
              <p>{t('uploadPrompt')}</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePickFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-action-primary px-3 py-1.5 text-xs font-semibold text-text-inverse hover:bg-action-primary-hover"
              >
                {t('uploadButton')}
              </button>
            </div>
          )}

          {busy && (
            <div className="inline-flex items-center gap-2 text-sm text-text-muted">
              <FontAwesomeIcon
                icon={faCircleNotch}
                aria-hidden
                className="h-3.5 w-3.5 animate-spin"
              />
              {t('analyzing')}
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-color-paprika/30 bg-color-paprika-pale px-3 py-2 text-sm text-color-paprika">
              {error}
            </p>
          )}

          {suggestions && (
            <div className="flex flex-col gap-3">
              {suggestions.tags.length > 0 && (
                <SuggestionGroup title={t('tagsTitle')}>
                  {suggestions.tags.map((tag) => {
                    const isUsed = usedTags.has(tag);
                    const isNew = suggestions.new_tags.includes(tag);
                    return (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        used={isUsed}
                        accent={isNew}
                        onClick={() => {
                          if (isUsed) return;
                          onAddTag(tag);
                          setUsedTags((s) => new Set(s).add(tag));
                        }}
                      />
                    );
                  })}
                </SuggestionGroup>
              )}

              {suggestions.editorial_blurb && (
                <SuggestionGroup title={t('blurbTitle')}>
                  <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-page p-3">
                    <p className="text-sm leading-relaxed text-text-primary">
                      {suggestions.editorial_blurb}
                    </p>
                    <button
                      type="button"
                      disabled={blurbApplied}
                      onClick={() => {
                        onApplyBlurb(suggestions.editorial_blurb!);
                        setBlurbApplied(true);
                      }}
                      className={cn(
                        'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                        blurbApplied
                          ? 'bg-surface-subtle text-text-muted'
                          : 'bg-action-primary text-text-inverse hover:bg-action-primary-hover',
                      )}
                    >
                      {blurbApplied ? t('blurbApplied') : t('applyBlurb')}
                    </button>
                  </div>
                </SuggestionGroup>
              )}

              {suggestions.suggested_pros.length > 0 && (
                <SuggestionGroup title={t('prosTitle')}>
                  {suggestions.suggested_pros.map((pro) => (
                    <Chip
                      key={pro}
                      label={`+ ${pro}`}
                      used={usedPros.has(pro)}
                      onClick={() => {
                        if (usedPros.has(pro)) return;
                        onAddPro(pro);
                        setUsedPros((s) => new Set(s).add(pro));
                      }}
                    />
                  ))}
                </SuggestionGroup>
              )}

              {suggestions.suggested_cons.length > 0 && (
                <SuggestionGroup title={t('consTitle')}>
                  {suggestions.suggested_cons.map((con) => (
                    <Chip
                      key={con}
                      label={`− ${con}`}
                      used={usedCons.has(con)}
                      onClick={() => {
                        if (usedCons.has(con)) return;
                        onAddCon(con);
                        setUsedCons((s) => new Set(s).add(con));
                      }}
                    />
                  ))}
                </SuggestionGroup>
              )}

              {(usedTags.size > 0 ||
                usedPros.size > 0 ||
                usedCons.size > 0 ||
                blurbApplied) && (
                <AppliedRecap
                  title={t('appliedTitle')}
                  helper={t('appliedHelper')}
                  rows={[
                    usedTags.size > 0 && {
                      label: t('tagsTitle'),
                      text: [...usedTags].map((x) => `#${x}`).join('  '),
                    },
                    blurbApplied && {
                      label: t('blurbTitle'),
                      text: t('appliedBlurbInline'),
                    },
                    usedPros.size > 0 && {
                      label: t('prosTitle'),
                      text: [...usedPros].join(' · '),
                    },
                    usedCons.size > 0 && {
                      label: t('consTitle'),
                      text: [...usedCons].join(' · '),
                    },
                  ].filter(Boolean) as Array<{ label: string; text: string }>}
                />
              )}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex w-fit items-center gap-2 self-end rounded-full border border-border-default bg-surface-page px-3 py-1 text-xs font-medium text-text-secondary hover:bg-color-azafran-pale hover:text-text-primary"
              >
                {t('reanalyze')}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePickFile}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function AppliedRecap({
  title,
  helper,
  rows,
}: {
  title: string;
  helper: string;
  rows: Array<{ label: string; text: string }>;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-color-albahaca/25 bg-color-albahaca-pale px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-color-albahaca">
        <FontAwesomeIcon icon={faCheck} aria-hidden className="h-3 w-3" />
        {title}
      </div>
      <ul className="m-0 flex list-none flex-col gap-1 p-0 text-xs text-text-primary">
        {rows.map((r) => (
          <li key={r.label} className="leading-snug">
            <span className="font-medium text-text-secondary">{r.label}:</span>{' '}
            {r.text}
          </li>
        ))}
      </ul>
      <p className="m-0 text-[11px] italic text-text-muted">{helper}</p>
    </div>
  );
}

function Chip({
  label,
  onClick,
  used,
  accent,
}: {
  label: string;
  onClick: () => void;
  used?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={used}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        used && 'cursor-default border-border-subtle bg-surface-subtle text-text-muted line-through',
        !used &&
          accent &&
          'border-action-primary bg-action-primary/10 text-action-primary hover:bg-action-primary/20',
        !used &&
          !accent &&
          'border-border-default bg-surface-page text-text-primary hover:bg-color-azafran-pale hover:border-color-azafran/40',
      )}
    >
      {!used && <FontAwesomeIcon icon={faPlus} aria-hidden className="h-2.5 w-2.5" />}
      {label}
    </button>
  );
}
