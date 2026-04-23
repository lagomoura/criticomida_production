'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { createRestaurant } from '@/app/lib/api/restaurants';
import { getCategories, createCategory } from '@/app/lib/api/categories';
import { ApiError } from '@/app/lib/api/client';
import { RestaurantListItem, Category } from '@/app/lib/types';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

interface PlaceData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  placeId?: string;
  website?: string;
  phoneNumber?: string;
  googleMapsUrl?: string;
  priceLevel?: number;
  openingHours?: string[];
  description?: string;
}

interface AddRestaurantModalProps {
  show: boolean;
  categoryId: number | null;
  onClose: () => void;
  onRestaurantCreated: (restaurant: RestaurantListItem) => void;
}

function formatPriceLevel(level: number): string {
  if (level === 0) return 'Sin especificar';
  return '$'.repeat(level);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Must live inside APIProvider
function PlacesSearchInput({
  onPlaceSelected,
  disabled,
}: {
  onPlaceSelected: (data: PlaceData) => void;
  disabled: boolean;
}) {
  const placesLoaded = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!placesLoaded || !inputRef.current) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment'],
      fields: [
        'name',
        'formatted_address',
        'geometry',
        'photos',
        'place_id',
        'website',
        'formatted_phone_number',
        'url',
        'price_level',
        'opening_hours',
        'editorial_summary',
      ],
    });

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;
      onPlaceSelected({
        name: place.name ?? '',
        address: place.formatted_address ?? '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 800 }),
        placeId: place.place_id,
        website: place.website,
        phoneNumber: place.formatted_phone_number,
        googleMapsUrl: place.url,
        priceLevel: typeof place.price_level === 'number' ? place.price_level : undefined,
        openingHours: place.opening_hours?.weekday_text,
        description: (place as unknown as { editorialSummary?: string }).editorialSummary ?? undefined,
      });
    });

    return () => google.maps.event.removeListener(listener);
  }, [placesLoaded, onPlaceSelected]);

  return (
    <input
      ref={inputRef}
      type="text"
      className="form-control"
      placeholder="Buscar restaurante en Google Maps…"
      disabled={disabled || !placesLoaded}
      autoComplete="off"
    />
  );
}

export default function AddRestaurantModal({
  show,
  categoryId,
  onClose,
  onRestaurantCreated,
}: AddRestaurantModalProps) {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin';

  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);
  const [placeImported, setPlaceImported] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [placeId, setPlaceId] = useState<string | undefined>(undefined);
  const [website, setWebsite] = useState<string | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | undefined>(undefined);
  const [priceLevel, setPriceLevel] = useState<number | undefined>(undefined);
  const [openingHours, setOpeningHours] = useState<string[] | undefined>(undefined);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(categoryId);

  // New category creation state
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState<string | undefined>();
  const [generatingImage, setGeneratingImage] = useState(false);
  const [duplicateCategory, setDuplicateCategory] = useState<Category | null>(null);

  const imageDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load categories once
  useEffect(() => {
    getCategories().then(cats => {
      const sorted = [...cats]
        .filter(c => c.slug !== 'otros')
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));
      setCategories(sorted);
    }).catch(() => { /* silently ignore */ });
  }, []);

  // Reset form on open
  useEffect(() => {
    if (show) {
      setName('');
      setLocationName('');
      setDescription('');
      setLat(undefined);
      setLng(undefined);
      setCoverImageUrl(undefined);
      setPlaceImported(false);
      setError(null);
      setPlaceId(undefined);
      setWebsite(undefined);
      setPhoneNumber(undefined);
      setGoogleMapsUrl(undefined);
      setPriceLevel(undefined);
      setOpeningHours(undefined);
      setSelectedCategoryId(categoryId);
      setNewCategoryMode(false);
      setNewCategoryName('');
      setNewCategoryImageUrl(undefined);
      setDuplicateCategory(null);
    }
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!show) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, onClose]);

  // Debounced image generation when typing new category name
  useEffect(() => {
    if (!newCategoryMode || !newCategoryName.trim()) {
      setNewCategoryImageUrl(undefined);
      setDuplicateCategory(null);
      return;
    }

    // Check for duplicates immediately
    const trimmed = newCategoryName.trim().toLowerCase();
    const slug = generateSlug(newCategoryName);
    const duplicate = categories.find(
      c => c.name.toLowerCase() === trimmed || c.slug === slug
    );
    setDuplicateCategory(duplicate ?? null);

    // Generate image with debounce
    if (imageDebounceRef.current) clearTimeout(imageDebounceRef.current);
    imageDebounceRef.current = setTimeout(async () => {
      if (!newCategoryName.trim()) return;
      setGeneratingImage(true);
      try {
        const res = await fetch('/api/generate-category-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategoryName.trim() }),
        });
        const data = await res.json();
        setNewCategoryImageUrl(data.imageUrl ?? undefined);
      } catch {
        setNewCategoryImageUrl(undefined);
      } finally {
        setGeneratingImage(false);
      }
    }, 600);

    return () => {
      if (imageDebounceRef.current) clearTimeout(imageDebounceRef.current);
    };
  }, [newCategoryName, newCategoryMode, categories]);

  const handlePlaceSelected = useCallback((data: PlaceData) => {
    setName(data.name);
    setLocationName(data.address);
    if (data.description) setDescription(data.description);
    setLat(data.lat);
    setLng(data.lng);
    if (data.photoUrl) setCoverImageUrl(data.photoUrl);
    setPlaceImported(true);
    setPlaceId(data.placeId);
    setWebsite(data.website);
    setPhoneNumber(data.phoneNumber);
    setGoogleMapsUrl(data.googleMapsUrl);
    setPriceLevel(data.priceLevel);
    setOpeningHours(data.openingHours);
  }, []);

  const hasImportedDetails =
    placeImported && (phoneNumber || website || priceLevel !== undefined || openingHours?.length);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !locationName.trim()) return;
    setError(null);
    setSubmitting(true);

    try {
      let finalCategoryId = selectedCategoryId;

      // Create new category first if in new-category mode
      if (newCategoryMode && newCategoryName.trim()) {
        const slug = generateSlug(newCategoryName.trim());
        const newCat = await createCategory({
          name: newCategoryName.trim(),
          slug,
          image_url: newCategoryImageUrl,
          display_order: 50,
        });
        finalCategoryId = newCat.id;
      }

      const restaurant = await createRestaurant({
        slug: '',
        name: name.trim(),
        location_name: locationName.trim(),
        description: description.trim() || undefined,
        latitude: lat,
        longitude: lng,
        cover_image_url: coverImageUrl,
        category_id: finalCategoryId ?? undefined,
        google_place_id: placeId,
        website,
        phone_number: phoneNumber,
        google_maps_url: googleMapsUrl,
        price_level: priceLevel,
        opening_hours: openingHours,
      });
      onRestaurantCreated(restaurant as unknown as RestaurantListItem);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'No se pudo agregar el restaurante.');
      } else {
        setError('No se pudo agregar el restaurante. Intentá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!show) return null;

  const canSubmit =
    name.trim() &&
    locationName.trim() &&
    (newCategoryMode
      ? newCategoryName.trim() && !duplicateCategory
      : selectedCategoryId !== null);

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-restaurant-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 id="add-restaurant-modal-title" className="text-lg font-semibold text-neutral-900">
            Agregar restaurante
          </h2>
          <button type="button" className="cc-btn-close" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Two-column body */}
          <div className="grid grid-cols-2 gap-0 divide-x divide-neutral-200">
            {/* LEFT — Google search + imported data */}
            <div className="flex flex-col gap-4 px-6 py-5">
              <div>
                <label className="form-label">Buscar en Google Maps</label>
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                  <PlacesSearchInput onPlaceSelected={handlePlaceSelected} disabled={submitting} />
                </APIProvider>
                {placeImported && (
                  <p className="mt-1 text-xs text-emerald-600">
                    ✓ Datos importados. Podés editarlos a la derecha.
                  </p>
                )}
              </div>

              {hasImportedDetails && (
                <div className="rounded-lg bg-neutral-50 px-4 py-3 text-sm">
                  <p className="mb-2 font-medium text-neutral-800">Datos del lugar</p>

                  {phoneNumber && (
                    <div className="flex items-start gap-2 text-neutral-700">
                      <span aria-hidden="true">📞</span>
                      <span>{phoneNumber}</span>
                    </div>
                  )}

                  {website && (() => {
                    let hostname = website;
                    try { hostname = new URL(website).hostname; } catch { /* keep original */ }
                    return (
                      <div className="mt-1 flex items-start gap-2 text-neutral-700">
                        <span aria-hidden="true">🌐</span>
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-blue-600 hover:underline"
                        >
                          {hostname}
                        </a>
                      </div>
                    );
                  })()}

                  {priceLevel !== undefined && (
                    <div className="mt-1 flex items-start gap-2 text-neutral-700">
                      <span aria-hidden="true">💰</span>
                      <span>{formatPriceLevel(priceLevel)}</span>
                    </div>
                  )}

                  {openingHours && openingHours.length > 0 && (
                    <div className="mt-1 flex items-start gap-2 text-neutral-700">
                      <span aria-hidden="true" className="mt-0.5">🕐</span>
                      <div>
                        <span>Horarios:</span>
                        <ul className="mt-1 space-y-0.5 text-neutral-600">
                          {openingHours.map((day, i) => (
                            <li key={i}>{day}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-xs text-blue-500 hover:underline"
                    >
                      Ver en Google Maps →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — form fields */}
            <div className="flex flex-col gap-4 px-6 py-5">
              {/* Category selector */}
              <div>
                <label htmlFor="restaurant-category" className="form-label">
                  Categoría *
                </label>

                {!newCategoryMode ? (
                  <>
                    <select
                      id="restaurant-category"
                      className="form-control"
                      value={selectedCategoryId ?? ''}
                      onChange={e => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
                      required={!newCategoryMode}
                      disabled={submitting}
                    >
                      {categories.length === 0 && (
                        <option value="" disabled>Cargando categorías…</option>
                      )}
                      {categories.length > 0 && !selectedCategoryId && (
                        <option value="" disabled>Seleccioná una categoría</option>
                      )}
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {isAdmin && (
                      <button
                        type="button"
                        className="mt-1.5 text-xs font-medium text-primary-coral hover:underline"
                        onClick={() => {
                          setNewCategoryMode(true);
                          setSelectedCategoryId(null);
                        }}
                        disabled={submitting}
                      >
                        + Nueva categoría
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        id="restaurant-category"
                        type="text"
                        className="form-control"
                        placeholder="Nombre de la nueva categoría"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        disabled={submitting}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="shrink-0 text-xs text-neutral-500 hover:text-neutral-700"
                        onClick={() => {
                          setNewCategoryMode(false);
                          setNewCategoryName('');
                          setNewCategoryImageUrl(undefined);
                          setDuplicateCategory(null);
                          setSelectedCategoryId(categoryId);
                        }}
                        disabled={submitting}
                        aria-label="Cancelar nueva categoría"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Preview panel */}
                    {newCategoryName.trim() && (
                      <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
                        {duplicateCategory ? (
                          <div className="text-amber-700">
                            <p className="font-medium">⚠ Ya existe &quot;{duplicateCategory.name}&quot;</p>
                            <button
                              type="button"
                              className="mt-1 text-xs text-primary-coral underline"
                              onClick={() => {
                                setNewCategoryMode(false);
                                setNewCategoryName('');
                                setSelectedCategoryId(duplicateCategory.id);
                              }}
                            >
                              Usar esta categoría
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium text-neutral-800">
                              Nueva: &quot;{newCategoryName.trim()}&quot;
                            </p>
                            <p className="text-neutral-500">
                              slug: <code>{generateSlug(newCategoryName)}</code>
                            </p>

                            {/* Image preview */}
                            <div className="mt-2 flex items-center gap-3">
                              {generatingImage ? (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-500">
                                  …
                                </div>
                              ) : newCategoryImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={newCategoryImageUrl}
                                  alt="Preview categoría"
                                  className="h-14 w-14 shrink-0 rounded-md object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-400">
                                  Sin imagen
                                </div>
                              )}
                              <button
                                type="button"
                                className="text-xs text-neutral-500 hover:text-neutral-700"
                                onClick={async () => {
                                  if (!newCategoryName.trim()) return;
                                  setGeneratingImage(true);
                                  setNewCategoryImageUrl(undefined);
                                  try {
                                    const res = await fetch('/api/generate-category-image', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ name: newCategoryName.trim() }),
                                    });
                                    const data = await res.json();
                                    setNewCategoryImageUrl(data.imageUrl ?? undefined);
                                  } catch {
                                    setNewCategoryImageUrl(undefined);
                                  } finally {
                                    setGeneratingImage(false);
                                  }
                                }}
                                disabled={generatingImage || submitting}
                              >
                                ↻ Re-generar imagen
                              </button>
                            </div>

                            <p className="mt-1.5 text-xs text-emerald-600">✓ Sin duplicados</p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label htmlFor="restaurant-name" className="form-label">
                  Nombre del restaurante *
                </label>
                <input
                  id="restaurant-name"
                  type="text"
                  className="form-control"
                  placeholder="Ej: El Rincón Mexicano"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={submitting}
                  autoFocus={!newCategoryMode}
                />
              </div>
              <div>
                <label htmlFor="restaurant-location" className="form-label">
                  Ubicación *
                </label>
                <input
                  id="restaurant-location"
                  type="text"
                  className="form-control"
                  placeholder="Ej: Palermo, Buenos Aires"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label htmlFor="restaurant-description" className="form-label">
                  Descripción
                </label>
                <textarea
                  id="restaurant-description"
                  className="form-control flex-1"
                  rows={5}
                  placeholder="Descripción del restaurante (opcional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-6 pb-2">
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-neutral-200 px-6 py-4">
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !canSubmit}
            >
              {submitting ? 'Agregando…' : 'Agregar restaurante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
