'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { fetchApi } from '@/app/lib/api/client';
import { cn } from '@/app/lib/utils/cn';

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
  placeholder = 'Plato (ej. Pizza de muzzarella)',
}: DishAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

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

  const createNew = useCallback(() => {
    const name = query.trim();
    if (!name) return;
    onChange({ id: null, name });
    setOpen(false);
  }, [query, onChange]);

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
            createNew();
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
        Plato
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
          placeholder={restaurantPlaceId ? placeholder : 'Primero elegí un restaurante'}
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
            aria-label="Limpiar selección"
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
          Se va a crear un plato nuevo para este restaurante.
        </p>
      )}
      {value && value.id !== null && (
        <p className="font-sans text-xs text-text-muted">Elegiste un plato existente.</p>
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
                onClick={createNew}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-sm',
                  activeIndex === results.length
                    ? 'bg-surface-subtle text-text-primary'
                    : 'bg-transparent text-action-primary',
                )}
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" aria-hidden />
                <span className="truncate">Crear plato nuevo: &ldquo;{query.trim()}&rdquo;</span>
              </button>
            </li>
          )}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim().length < 2 && (
        <p className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-border-default bg-surface-card px-3 py-2 font-sans text-xs text-text-muted shadow-lg">
          Empezá a tipear el nombre del plato (≥2 caracteres).
        </p>
      )}
    </div>
  );
}
