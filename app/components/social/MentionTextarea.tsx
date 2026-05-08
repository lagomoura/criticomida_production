'use client';

import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import Avatar from '@/app/components/ui/Avatar';
import { searchMentionUsers } from '@/app/lib/api/mentions';
import type { UserMentionSuggestion } from '@/app/lib/types/mention';
import { cn } from '@/app/lib/utils/cn';

/**
 * Drop-in superset of the project's `<Textarea>` primitive that surfaces an
 * @-mention autocomplete anchored to the textarea. Detects an active
 * `@<frag>` token at the caret, fetches `/api/users/mention-search`, and on
 * selection rewrites the token to `@handle ` while preserving caret position.
 *
 * Renders the same visual chrome (label, counter, error/help text) so callers
 * can swap `<Textarea>` → `<MentionTextarea>` without touching layout.
 */
export interface MentionTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  hideLabel?: boolean;
  error?: string;
  helpText?: string;
  /** When set, a "{n}/{max}" counter is rendered next to the label. */
  maxLength?: number;
  /** Length to display in the counter; usually `value.length`. */
  valueLength?: number;
}

interface ActiveToken {
  /** Position of the leading `@` in `value`. */
  start: number;
  /** Position right after the last char of the fragment. */
  end: number;
  /** The text after `@`, e.g. for `"hola @bo|"` → `"bo"`. */
  fragment: string;
}

/**
 * Returns the active `@`-token immediately preceding `caret`, or `null` if
 * the caret is not in a mention context. Anti-email guard: the char before
 * `@` must not be `[A-Za-z0-9_]` — same boundary the backend regex uses.
 */
function findActiveToken(text: string, caret: number): ActiveToken | null {
  let i = caret;
  while (i > 0) {
    const ch = text[i - 1];
    if (/[A-Za-z0-9_]/.test(ch)) {
      i -= 1;
      continue;
    }
    if (ch === '@') {
      const prev = i - 2 >= 0 ? text[i - 2] : '';
      if (prev && /[A-Za-z0-9_]/.test(prev)) {
        return null;
      }
      const fragment = text.slice(i, caret);
      if (fragment.length > 30) return null;
      return { start: i - 1, end: caret, fragment };
    }
    return null;
  }
  return null;
}

export default function MentionTextarea({
  value,
  onChange,
  label,
  hideLabel,
  error,
  helpText,
  maxLength,
  valueLength,
  rows = 3,
  disabled,
  required,
  id,
  className,
  onKeyDown: onKeyDownProp,
  ...rest
}: MentionTextareaProps) {
  const t = useTranslations('social.mention');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [token, setToken] = useState<ActiveToken | null>(null);
  const [suggestions, setSuggestions] = useState<UserMentionSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-mentions`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [error ? errorId : null, helpText && !error ? helpId : null].filter(Boolean).join(' ') || undefined;
  const showCounter = typeof maxLength === 'number' && typeof valueLength === 'number';

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(0);
    setToken(null);
  }, []);

  const runSearch = useCallback(async (fragment: string) => {
    setLoading(true);
    try {
      const results = await searchMentionUsers(fragment);
      setSuggestions(results);
      setActiveIndex(0);
      setOpen(true);
    } catch {
      setSuggestions([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = e.target.value;
      onChange(nextValue);
      const caret = e.target.selectionStart ?? nextValue.length;
      const active = findActiveToken(nextValue, caret);
      setToken(active);
      if (!active) {
        closeDropdown();
        return;
      }
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        void runSearch(active.fragment);
      }, 200);
    },
    [onChange, runSearch, closeDropdown],
  );

  const insertSuggestion = useCallback(
    (suggestion: UserMentionSuggestion) => {
      if (!token) return;
      const before = value.slice(0, token.start);
      const after = value.slice(token.end);
      const inserted = `@${suggestion.handle} `;
      const next = before + inserted + after;
      onChange(next);
      closeDropdown();
      // Restore focus + caret after React re-render.
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        const caret = before.length + inserted.length;
        ta.focus();
        ta.setSelectionRange(caret, caret);
      });
    },
    [value, token, onChange, closeDropdown],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (open && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          insertSuggestion(suggestions[activeIndex]);
          return;
        }
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        closeDropdown();
        return;
      }
      onKeyDownProp?.(e);
    },
    [open, suggestions, activeIndex, insertSuggestion, closeDropdown, onKeyDownProp],
  );

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open, closeDropdown]);

  return (
    <div ref={containerRef} className={cn('relative flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className={cn(
              'font-sans text-sm font-medium text-text-secondary',
              hideLabel && 'sr-only',
            )}
          >
            {label}
            {required && <span aria-hidden className="ml-0.5 text-action-danger">*</span>}
          </label>
          {showCounter && (
            <span className="font-sans text-xs tabular-nums text-text-muted">
              {valueLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        // Sentence-style autocap matches free-text review prose. enterKeyHint
        // is left as the Enter default (newline) — overriding to "send" would
        // mislead users since Enter inserts a line break, not a submit.
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
        {...rest}
        id={inputId}
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-autocomplete="list"
        aria-controls={open ? listboxId : undefined}
        className={cn(
          // text-base on mobile prevents iOS Safari zoom on focus.
          'rounded-md border bg-surface-card px-3 py-2 font-sans text-base leading-relaxed text-text-primary sm:text-sm',
          'placeholder:text-text-muted',
          'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-action-danger' : 'border-border-default focus:border-action-primary',
        )}
      />
      {helpText && !error && (
        <span id={helpId} className="font-sans text-xs text-text-muted">
          {helpText}
        </span>
      )}
      {error && (
        <span id={errorId} className="font-sans text-xs text-action-danger" role="alert">
          {error}
        </span>
      )}

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 rounded-xl border border-border-default bg-surface-card shadow-lg">
          {loading && suggestions.length === 0 && (
            <p className="px-3 py-2 font-sans text-sm text-text-muted">{t('loading')}</p>
          )}
          {!loading && suggestions.length === 0 && (
            <p className="px-3 py-2 font-sans text-sm text-text-muted">{t('noResults')}</p>
          )}
          {suggestions.length > 0 && (
            <ul role="listbox" id={listboxId} className="max-h-72 overflow-auto py-1">
              {suggestions.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertSuggestion(s)}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left',
                      i === activeIndex ? 'bg-surface-subtle' : 'bg-transparent',
                    )}
                  >
                    <Avatar src={s.avatar_url} name={s.display_name} size="xs" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-sans text-sm text-text-primary">
                        {s.display_name}
                      </span>
                      <span className="truncate font-sans text-xs text-text-muted">
                        @{s.handle}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
