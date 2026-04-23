'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationDot, faXmark } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';

/**
 * Data we ship to the backend once the user picks a Place. Mirrors the
 * `RestaurantFromPlace` pydantic schema shape (snake_case).
 */
export interface SelectedPlace {
  place_id: string;
  name: string;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  google_maps_url: string | null;
  website: string | null;
  phone_number: string | null;
}

export interface RestaurantAutocompleteProps {
  value: SelectedPlace | null;
  onChange: (place: SelectedPlace | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Restrict predictions to a country (ISO-3166-1 alpha-2). Default: 'ar'. */
  country?: string | null;
}

/**
 * Thin wrapper that mounts an APIProvider only for this component. Google's
 * JS SDK is idempotent — multiple providers on the page share the same script
 * load so nesting inside an existing APIProvider is safe too.
 */
export default function RestaurantAutocomplete(props: RestaurantAutocompleteProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <div className="rounded-md border border-action-danger bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
        Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </div>
    );
  }
  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <AutocompleteInner {...props} />
    </APIProvider>
  );
}

function AutocompleteInner({
  value,
  onChange,
  label = 'Restaurante',
  placeholder = 'Buscá tu restaurante…',
  disabled = false,
  country = 'ar',
}: RestaurantAutocompleteProps) {
  const placesLib = useMapsLibrary('places');
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken | null>(null);

  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Build services when the Places lib finishes loading.
  useEffect(() => {
    if (!placesLib) return;
    setAutocompleteService(new placesLib.AutocompleteService());
    // PlacesService requires a map or a DOM element to attribute requests.
    const attribution = document.createElement('div');
    setPlacesService(new placesLib.PlacesService(attribution));
    setSessionToken(new placesLib.AutocompleteSessionToken());
  }, [placesLib]);

  // Close the dropdown on outside click.
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

  const runSearch = useCallback(
    (term: string) => {
      if (!autocompleteService || !sessionToken) return;
      if (term.trim().length < 2) {
        setPredictions([]);
        return;
      }
      setLoading(true);
      setFetchError(null);
      autocompleteService.getPlacePredictions(
        {
          input: term,
          sessionToken,
          types: ['restaurant', 'food', 'cafe', 'bakery', 'bar'],
          componentRestrictions: country ? { country } : undefined,
        },
        (results, status) => {
          setLoading(false);
          if (
            status === google.maps.places.PlacesServiceStatus.OK ||
            status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
          ) {
            setPredictions(results ?? []);
            setOpen(true);
            setActiveIndex(-1);
          } else {
            setFetchError('No pudimos buscar ahora. Probá de nuevo.');
            setPredictions([]);
          }
        },
      );
    },
    [autocompleteService, sessionToken, country],
  );

  const onInput = useCallback(
    (next: string) => {
      setQuery(next);
      if (value !== null) {
        // Typing after a pick clears the selection.
        onChange(null);
      }
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => runSearch(next), 220);
    },
    [runSearch, value, onChange],
  );

  const pickPrediction = useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      if (!placesService || !sessionToken) return;
      placesService.getDetails(
        {
          placeId: prediction.place_id,
          sessionToken,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry.location',
            'address_components',
            'url',
            'website',
            'international_phone_number',
          ],
        },
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            setFetchError('No pudimos cargar los detalles del lugar.');
            return;
          }
          const city = extractCity(place.address_components);
          const selected: SelectedPlace = {
            place_id: place.place_id ?? prediction.place_id,
            name: place.name ?? prediction.structured_formatting.main_text,
            formatted_address: place.formatted_address ?? null,
            latitude: place.geometry?.location?.lat() ?? null,
            longitude: place.geometry?.location?.lng() ?? null,
            city,
            google_maps_url: place.url ?? null,
            website: place.website ?? null,
            phone_number: place.international_phone_number ?? null,
          };
          onChange(selected);
          setQuery(selected.name);
          setOpen(false);
          setPredictions([]);
          // Spec: rotate session tokens after a completed session (pick).
          if (placesLib) setSessionToken(new placesLib.AutocompleteSessionToken());
        },
      );
    },
    [placesService, sessionToken, placesLib, onChange],
  );

  const clearSelection = useCallback(() => {
    onChange(null);
    setQuery('');
    setPredictions([]);
  }, [onChange]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        pickPrediction(predictions[activeIndex]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [open, predictions, activeIndex, pickPrediction],
  );

  const displayValue = useMemo(() => (value ? value.name : query), [value, query]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label className="font-sans text-sm font-medium text-text-secondary">
        {label}
        <span aria-hidden className="ml-0.5 text-action-danger">*</span>
      </label>
      <div className="relative">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="text"
          value={displayValue}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => {
            if (predictions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled || !autocompleteService}
          autoComplete="off"
          aria-expanded={open}
          aria-autocomplete="list"
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

      {fetchError && (
        <p className="font-sans text-xs text-action-danger" role="status">
          {fetchError}
        </p>
      )}

      {value && value.formatted_address && (
        <p className="flex items-center gap-1 font-sans text-xs text-text-muted">
          <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" aria-hidden />
          <span className="truncate">{value.formatted_address}</span>
        </p>
      )}

      {open && predictions.length > 0 && !value && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-border-default bg-surface-card py-1 shadow-lg"
        >
          {predictions.map((p, i) => (
            <li key={p.place_id}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => pickPrediction(p)}
                className={cn(
                  'flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left font-sans text-sm',
                  i === activeIndex ? 'bg-surface-subtle' : 'bg-transparent',
                )}
              >
                <span className="text-text-primary">
                  {p.structured_formatting.main_text}
                </span>
                {p.structured_formatting.secondary_text && (
                  <span className="truncate text-xs text-text-muted">
                    {p.structured_formatting.secondary_text}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && predictions.length === 0 && query.trim().length >= 2 && !value && (
        <p className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-border-default bg-surface-card px-3 py-2 font-sans text-sm text-text-muted shadow-lg">
          Sin resultados.
        </p>
      )}
    </div>
  );
}

function extractCity(components: google.maps.GeocoderAddressComponent[] | undefined): string | null {
  if (!components) return null;
  // Preference order: locality > sublocality > admin_area_2 > admin_area_1.
  const order = [
    'locality',
    'sublocality',
    'administrative_area_level_2',
    'administrative_area_level_1',
  ];
  for (const type of order) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.long_name;
  }
  return null;
}
