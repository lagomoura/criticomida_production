'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { TextareaHTMLAttributes } from 'react';
import Avatar from '@/app/components/ui/Avatar';
import { searchUsers } from '@/app/lib/api/search';
import { resolveMentionedUserIds } from '@/app/lib/utils/mentions';
import { cn } from '@/app/lib/utils/cn';
import type { UserSearchResult } from '@/app/lib/types/social';

const MENTIONS_ENABLED = process.env.NEXT_PUBLIC_MENTIONS_ENABLED === 'true';
const MAX_MENTIONS = 10;

export interface MentionTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (next: string) => void;
  /** Recibe la lista de IDs únicos a notificar (filtra self y handles no resueltos). */
  onMentionsChange?: (ids: string[]) => void;
  /** ID del usuario logueado para filtrar self-mentions. */
  currentUserId?: string | null;
  label?: string;
  hideLabel?: boolean;
  helpText?: string;
  error?: string;
  /** Counter `{value.length}/{maxLength}` cuando se setea junto a maxLength. */
  valueLength?: number;
  /** Reemplaza las clases base del `<textarea>` interno (estilos custom). */
  textareaClassName?: string;
}

interface ActiveTrigger {
  /** Posición del `@` que arrancó la mención (inclusivo). */
  start: number;
  /** Posición del caret (exclusivo, fin del query). */
  end: number;
  /** Texto entre el `@` y el caret (sin incluir el `@`). */
  query: string;
}

export default function MentionTextarea({
  value,
  onChange,
  onMentionsChange,
  currentUserId = null,
  label,
  hideLabel = false,
  helpText,
  error,
  maxLength,
  valueLength,
  rows = 4,
  className,
  textareaClassName,
  disabled,
  required,
  id,
  ...rest
}: MentionTextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(' ') ||
    undefined;
  const showCounter = typeof maxLength === 'number' && typeof valueLength === 'number';

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const pickedRef = useRef<Map<string, string>>(new Map());

  const [trigger, setTrigger] = useState<ActiveTrigger | null>(null);
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const emitMentions = useCallback(
    (text: string) => {
      if (!onMentionsChange) return;
      const ids = resolveMentionedUserIds(text, pickedRef.current, currentUserId).slice(
        0,
        MAX_MENTIONS,
      );
      onMentionsChange(ids);
    },
    [onMentionsChange, currentUserId],
  );

  /** Detecta si el caret está sobre un trigger `@query` activo. */
  const detectTrigger = useCallback((text: string, caret: number): ActiveTrigger | null => {
    if (!MENTIONS_ENABLED) return null;
    if (caret === 0) return null;
    let i = caret - 1;
    while (i >= 0) {
      const ch = text[i];
      if (ch === '@') {
        const before = i === 0 ? '' : text[i - 1];
        if (before === '' || /\s/.test(before)) {
          const query = text.slice(i + 1, caret);
          if (!/^[a-zA-Z0-9_]*$/.test(query)) return null;
          if (query.length > 30) return null;
          return { start: i, end: caret, query };
        }
        return null;
      }
      if (/\s/.test(ch)) return null;
      i--;
    }
    return null;
  }, []);

  const closePicker = useCallback(() => {
    setOpen(false);
    setTrigger(null);
    setResults([]);
    setActiveIndex(0);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const runSearch = useCallback(async (query: string) => {
    try {
      const list = await searchUsers(query, 5);
      setResults(list);
      setActiveIndex(0);
      setOpen(list.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    }
  }, []);

  const onValueChange = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      emitMentions(nextValue);

      if (!MENTIONS_ENABLED) return;

      const caret = textareaRef.current?.selectionStart ?? nextValue.length;
      const t = detectTrigger(nextValue, caret);
      setTrigger(t);
      if (!t) {
        closePicker();
        return;
      }
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      const q = t.query;
      if (q.length === 0) {
        setResults([]);
        setOpen(false);
        return;
      }
      debounceRef.current = window.setTimeout(() => runSearch(q), 220);
    },
    [onChange, emitMentions, detectTrigger, closePicker, runSearch],
  );

  const pick = useCallback(
    (user: UserSearchResult) => {
      if (!user.handle || !trigger || !textareaRef.current) return;
      const before = value.slice(0, trigger.start);
      const after = value.slice(trigger.end);
      const insertion = `@${user.handle} `;
      const next = `${before}${insertion}${after}`;
      pickedRef.current.set(user.handle, user.id);
      onChange(next);
      emitMentions(next);
      closePicker();

      const caretPos = (before + insertion).length;
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.focus();
        ta.setSelectionRange(caretPos, caretPos);
      });
    },
    [trigger, value, onChange, emitMentions, closePicker],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!open || results.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        pick(results[activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePicker();
      }
    },
    [open, results, activeIndex, pick, closePicker],
  );

  // Cierra el picker al click afuera.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closePicker();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closePicker]);

  // Re-detecta el trigger cuando cambia el caret (sin escribir).
  const onSelect = useCallback(() => {
    if (!MENTIONS_ENABLED) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const t = detectTrigger(ta.value, ta.selectionStart ?? 0);
    if (!t) {
      if (open) closePicker();
      return;
    }
    setTrigger(t);
  }, [detectTrigger, open, closePicker]);

  // En el primer render, asegura que el array de IDs esté sincronizado.
  useEffect(() => {
    emitMentions(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPopover = MENTIONS_ENABLED && open && results.length > 0 && !disabled;
  const ariaActiveDescendant = useMemo(
    () => (showPopover ? `${listboxId}-${activeIndex}` : undefined),
    [showPopover, listboxId, activeIndex],
  );

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
        {...rest}
        ref={textareaRef}
        id={inputId}
        rows={rows}
        value={value}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-controls={showPopover ? listboxId : undefined}
        aria-autocomplete={MENTIONS_ENABLED ? 'list' : undefined}
        aria-activedescendant={ariaActiveDescendant}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={handleKey}
        onSelect={onSelect}
        className={
          textareaClassName ??
          cn(
            'rounded-md border bg-surface-card px-3 py-2 font-sans text-sm leading-relaxed text-text-primary',
            'placeholder:text-text-muted',
            'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-action-danger' : 'border-border-default focus:border-action-primary',
          )
        }
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

      {showPopover && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-border-default bg-surface-card py-1 shadow-lg"
        >
          {results.map((user, i) => (
            <li key={user.id}>
              <button
                type="button"
                id={`${listboxId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  // Evita que el textarea pierda foco antes del click.
                  e.preventDefault();
                }}
                onClick={() => pick(user)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-sm',
                  i === activeIndex ? 'bg-surface-subtle' : 'bg-transparent',
                )}
              >
                <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-text-primary">{user.displayName}</span>
                  {user.handle && (
                    <span className="truncate text-xs text-text-muted">@{user.handle}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
