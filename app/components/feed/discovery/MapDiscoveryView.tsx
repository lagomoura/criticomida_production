'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
import MapBboxFetcher from './MapBboxFetcher';
import MapClusteredPins from './MapClusteredPins';
import MapLayerChips from './MapLayerChips';
import MapTop3Overlay from './MapTop3Overlay';
import { useUserLocation } from '@/app/lib/hooks/useUserLocation';
import type {
  MapBboxResponse,
  MapRestaurantPin,
  MapSort,
} from '@/app/lib/types/discovery';

const CABA_CENTER = { lat: -34.6037, lng: -58.3816 };
const DEFAULT_ZOOM = 13;
const MAP_ID = 'cc_discovery_map';

export default function MapDiscoveryView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [pins, setPins] = useState<MapRestaurantPin[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MapRestaurantPin | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [sort, setSort] = useState<MapSort>('geek_score');
  const [includeEmpty, setIncludeEmpty] = useState(false);
  const [chefOnly, setChefOnly] = useState(false);
  const { location } = useUserLocation();

  const initialCenter = useMemo(() => {
    if (location) return { lat: location.latitude, lng: location.longitude };
    return CABA_CENTER;
  }, [location]);

  const handleResponse = useCallback((res: MapBboxResponse) => {
    setPins(res.items);
    setTruncated(res.truncated);
  }, []);

  const handleSelect = useCallback((pin: MapRestaurantPin) => setSelected(pin), []);
  const handleClose = useCallback(() => setSelected(null), []);
  const handleRetry = useCallback(() => setRetryNonce((n) => n + 1), []);

  useEffect(() => {
    if (selected && !pins.some((p) => p.restaurantId === selected.restaurantId)) {
      setSelected(null);
    }
  }, [pins, selected]);

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-subtle p-6 text-center font-sans text-sm text-text-muted">
        Falta configurar <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> para mostrar el mapa.
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-12rem)] min-h-[28rem] w-full overflow-hidden rounded-xl border border-border-default bg-surface-card overscroll-contain">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={initialCenter}
          defaultZoom={DEFAULT_ZOOM}
          mapId={MAP_ID}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
        >
          <MapBboxFetcher
            onResponse={handleResponse}
            onLoadingChange={setLoading}
            onError={setError}
            retryNonce={retryNonce}
            sort={sort}
            includeEmpty={includeEmpty}
            chefOnly={chefOnly}
          />
          <MapClusteredPins
            pins={pins}
            selectedId={selected?.restaurantId ?? null}
            onSelect={handleSelect}
            onClose={handleClose}
          />
        </Map>
      </APIProvider>

      <MapLayerChips
        sort={sort}
        onSortChange={setSort}
        includeEmpty={includeEmpty}
        onIncludeEmptyChange={setIncludeEmpty}
        chefOnly={chefOnly}
        onChefOnlyChange={setChefOnly}
      />

      <MapTop3Overlay pins={pins} sort={sort} onSelect={handleSelect} />

      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-card px-3 py-1.5 font-sans text-xs text-text-muted shadow"
        >
          <FontAwesomeIcon icon={faSpinner} spin aria-hidden />
          Buscando…
        </div>
      )}

      {!loading && !error && pins.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-card/95 px-4 py-2 font-sans text-sm text-text-muted shadow backdrop-blur">
            <FontAwesomeIcon icon={faMapLocationDot} aria-hidden />
            No hay platos reseñados en esta zona. Movete para explorar.
          </div>
        </div>
      )}

      {error && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
          <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-xl border border-border-default bg-surface-card px-4 py-3 text-center font-sans text-sm text-text-primary shadow">
            <span>{error}</span>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-md bg-action-primary px-3 py-1 font-sans text-xs font-medium text-text-inverse hover:bg-action-primary-hover"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {truncated && !loading && pins.length > 0 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
          <div className="pointer-events-auto rounded-full bg-surface-card/95 px-3 py-1 font-sans text-[11px] text-text-muted shadow backdrop-blur">
            Hacé zoom para ver todos los locales
          </div>
        </div>
      )}
    </div>
  );
}
