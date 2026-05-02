'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { fetchApi } from '@/app/lib/api/client';
import { suggestSimilarDishes, type DishSuggestion } from '@/app/lib/api/dishes';
import { cn } from '@/app/lib/utils/cn';
import SimilarDishConfirmModal from './SimilarDishConfirmModal';

export interface SelectedDish {
  /** If the user picked an existing dish. Absent when creating a new one. */
  id: string | null;
  name: string;
}

export interface DishAutocompleteProps {
  /** Google Place id of the restaurant the user already picked upstream.
   * When null, the input is disabled — pick a restaurant first. */
  restaurantPlaceId: string | null;
  value: SelectedDish | null;
  onChange: (dish: SelectedDish | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface DishSearchResponse {
  items: Array<{ id: string; name: string }>;
}

export default function DishAutocomplete({
  restaurantPlaceId,
  value,
  onChange,
  disabled = false,
  placeholder,
}: DishAutocompleteProps) {
  const t = useTranslations('social.dishAutocomplete');
  const effectivePlaceholder = placeholder ?? t('placeholder');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingNewName, setPendingNewName] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<DishSuggestion[]>([]);
  const [checkingSimilar, setCheckingSimilar] = useState(false);

  const listboxId = useId();
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // When the restaurant changes, clear the dish selection.
  useEffect(() => {
    onChange(null);
    setQuery('');
    setResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantPlaceId]);

  const runSearch = useCallback(
    async (term: string) => {
      if (!restaurantPlaceId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          restaurant_place_id: restaurantPlaceId,
          q: term.trim(),
          limit: '8',
        });
        const raw = await fetchApi<DishSearchResponse>(
          `/api/dishes/search?${params.toString()}`,
        );
        setResults(raw.items);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [restaurantPlaceId],
  );

  const onInput = useCallback(
    (next: string) => {
      setQuery(next);
      // Typing clears an existing selection — the user is editing.
      if (value !== null) onChange(null);
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        void runSearch(next);
      }, 200);
    },
    [runSearch, value, onChange],
  );

  const pickExisting = useCallback(
    (dish: { id: string; name: string }) => {
      onChange({ id: dish.id, name: dish.name });
      setQuery(dish.name);
      setOpen(false);
    },
    [onChange],
  );

  // "Crear plato nuevo" path — first ask the backend if the input would
  // duplicate an existing dish (with typos / accents). If the backend returns
  // candidates we pop a modal so the user can either pick one or insist on a
  // brand-new dish; if it returns nothing we just create silently.
  const createNew = useCallback(async () => {
    const name = query.trim();
    if (!name || !restaurantPlaceId) return;
    setCheckingSimilar(true);
    try {
      const candidates = await suggestSimilarDishes(restaurantPlaceId, name);
      if (candidates.length === 0) {
        onChange({ id: null, name });
        setOpen(false);
        return;
      }
      setSuggestions(candidates);
      setPendingNewName(name);
      setOpen(false);
    } catch {
      // If the suggest endpoint blows up, fall back to the old behavior so
      // the user can still publish their review.
      onChange({ id: null, name });
      setOpen(false);
    } finally {
      setCheckingSimilar(false);
    }
  }, [query, restaurantPlaceId, onChange]);

  const confirmExisting = useCallback(
    (suggestion: DishSuggestion) => {
      onChange({ id: suggestion.id, name: suggestion.name });
      setQuery(suggestion.name);
      setSuggestions([]);
      setPendingNewName(null);
    },
    [onChange],
  );

  const confirmCreateNew = useCallback(() => {
    if (pendingNewName) {
      onChange({ id: null, name: pendingNewName });
    }
    setSuggestions([]);
    setPendingNewName(null);
  }, [pendingNewName, onChange]);

  const cancelModal = useCallback(() => {
    setSuggestions([]);
    setPendingNewName(null);
  }, []);

  const clearSelection = useCallback(() => {
    onChange(null);
    setQuery('');
    setResults([]);
  }, [onChange]);

  // Keyboard nav: walk through existing results + the "create new" row at the end.
  const optionCount = results.length + (query.trim().length >= 2 ? 1 : 0);
  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, optionCount - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0) {
          e.preventDefault();
          if (activeIndex < results.length) {
            pickExisting(results[activeIndex]);
          } else {
            void createNew();
          }
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [open, optionCount, activeIndex, results, pickExisting, createNew],
  );

  const isDisabled = disabled || !restaurantPlaceId;
  const displayValue = value ? value.name : query;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label className="font-sans text-sm font-medium text-text-secondary">
        {t('label')}
        <span aria-hidden className="ml-0.5 text-action-danger">*</span>
      </label>
      <div className="relative">
        <FontAwesomeIcon
          icon={faUtensils}
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="text"
          value={displayValue}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => {
            if (restaurantPlaceId && query.length >= 0) {
              void runSearch(query);
            }
          }}
          placeholder={restaurantPlaceId ? effectivePlaceholder : t('pickRestaurantFirst')}
          disabled={isDisabled}
          autoComplete="off"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listboxId}
          role="combobox"
          className={cn(
            'h-10 w-full rounded-md border bg-surface-card pl-9 pr-9 font-sans text-sm text-text-primary',
            'placeholder:text-text-muted',
            'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'border-border-default focus:border-action-primary',
          )}
        />
        {value && (
          <button
            type="button"
            aria-label={t('clearSelection')}
            onClick={clearSelection}
            disabled={disabled}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
          </button>
        )}
      </div>

      {value && value.id === null && (
        <p className="font-sans text-xs text-text-muted">
          {t('willCreateNew')}
        </p>
      )}
      {value && value.id !== null && (
        <p className="font-sans text-xs text-text-muted">{t('pickedExisting')}</p>
      )}

      {open && !value && (results.length > 0 || query.trim().length >= 2) && (
        <ul
          role="listbox"
          id={listboxId}
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-border-default bg-surface-card py-1 shadow-lg"
        >
          {results.map((d, i) => (
            <li key={d.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => pickExisting(d)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-sm text-text-primary',
                  i === activeIndex ? 'bg-surface-subtle' : 'bg-transparent',
                )}
              >
                <FontAwesomeIcon icon={faUtensils} className="h-3 w-3 text-text-muted" aria-hidden />
                <span className="truncate">{d.name}</span>
              </button>
            </li>
          ))}
          {query.trim().length >= 2 && (
            <li className={cn(results.length > 0 && 'border-t border-border-default')}>
              <button
                type="button"
                role="option"
                aria-selected={activeIndex === results.length}
                onMouseEnter={() => setActiveIndex(results.length)}
                onClick={() => void createNew()}
                disabled={checkingSimilar}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-sm',
                  activeIndex === results.length
                    ? 'bg-surface-subtle text-text-primary'
                    : 'bg-transparent text-action-primary',
                  checkingSimilar && 'cursor-wait opacity-60',
                )}
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" aria-hidden />
                <span className="truncate">
                  {checkingSimilar
                    ? t('checkingSimilar')
                    : t('createNewLabel', { name: query.trim() })}
                </span>
              </button>
            </li>
          )}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim().length < 2 && (
        <p className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-border-default bg-surface-card px-3 py-2 font-sans text-xs text-text-muted shadow-lg">
          {t('minTwoChars')}
        </p>
      )}

      {pendingNewName && suggestions.length > 0 && (
        <SimilarDishConfirmModal
          attemptedName={pendingNewName}
          suggestions={suggestions}
          onPickExisting={confirmExisting}
          onCreateNew={confirmCreateNew}
          onCancel={cancelModal}
        />
      )}
    </div>
  );
}
