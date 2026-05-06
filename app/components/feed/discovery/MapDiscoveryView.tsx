'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
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

export interface MapDiscoveryOverride {
  /** Forced map center. Wins over user geolocation and CABA fallback. */
  center: { lat: number; lng: number };
  /** Optional zoom override; falls back to ``DEFAULT_ZOOM`` when null. */
  zoom?: number | null;
}

interface MapDiscoveryViewProps {
  /** When the standalone ``/mapa`` page is reached with query params
   *  (``?lat=X&lng=Y&zoom=Z``), the wrapper passes them here so the
   *  map opens on the requested point instead of defaulting to the
   *  comensal's geolocation or CABA. ``undefined`` keeps the old
   *  feed-discovery behaviour. */
  overrideCenter?: MapDiscoveryOverride;
}

export default function MapDiscoveryView({
  overrideCenter,
}: MapDiscoveryViewProps = {}) {
  const t = useTranslations('discovery.map');
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
    if (overrideCenter) return overrideCenter.center;
    if (location) return { lat: location.latitude, lng: location.longitude };
    return CABA_CENTER;
  }, [overrideCenter, location]);
  const initialZoom = overrideCenter?.zoom ?? DEFAULT_ZOOM;

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
        {t('missingKey')}
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-12rem)] min-h-[28rem] w-full overflow-hidden rounded-xl border border-border-default bg-surface-card overscroll-contain">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={initialCenter}
          defaultZoom={initialZoom}
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
          {t('searching')}
        </div>
      )}

      {!loading && !error && pins.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-card/95 px-4 py-2 font-sans text-sm text-text-muted shadow backdrop-blur">
            <FontAwesomeIcon icon={faMapLocationDot} aria-hidden />
            {t('emptyZone')}
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
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {truncated && !loading && pins.length > 0 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
          <div className="pointer-events-auto rounded-full bg-surface-card/95 px-3 py-1 font-sans text-[11px] text-text-muted shadow backdrop-blur">
            {t('zoomToSeeAll')}
          </div>
        </div>
      )}
    </div>
  );
}
