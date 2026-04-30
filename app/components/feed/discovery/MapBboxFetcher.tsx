'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useDebounce } from '@/app/lib/hooks/useDebounce';
import { getRestaurantsInBbox } from '@/app/lib/api/discovery';
import type { BboxQuery, MapBboxResponse, MapSort } from '@/app/lib/types/discovery';

interface Props {
  onResponse: (res: MapBboxResponse) => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (err: string | null) => void;
  /** Bumping this value retriggers the latest fetch (used by the retry button). */
  retryNonce?: number;
  sort: MapSort;
  includeEmpty: boolean;
  chefOnly: boolean;
}

export default function MapBboxFetcher({
  onResponse,
  onLoadingChange,
  onError,
  retryNonce,
  sort,
  includeEmpty,
  chefOnly,
}: Props) {
  const map = useMap();
  const [rawBbox, setRawBbox] = useState<BboxQuery | null>(null);
  const debouncedBbox = useDebounce(rawBbox, 300);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!map) return;
    const readBounds = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      setRawBbox({
        minLat: sw.lat(),
        minLng: sw.lng(),
        maxLat: ne.lat(),
        maxLng: ne.lng(),
        limit: 200,
      });
    };
    readBounds();
    const listener = map.addListener('bounds_changed', readBounds);
    return () => listener.remove();
  }, [map]);

  useEffect(() => {
    if (!debouncedBbox) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    onLoadingChange(true);
    onError(null);

    getRestaurantsInBbox(
      { ...debouncedBbox, sort, includeEmpty, chefOnly },
      controller.signal,
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        onResponse(res);
        onLoadingChange(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        onError('No pudimos cargar los locales en esta zona.');
        onLoadingChange(false);
      });

    return () => controller.abort();
  }, [
    debouncedBbox,
    sort,
    includeEmpty,
    chefOnly,
    onResponse,
    onLoadingChange,
    onError,
    retryNonce,
  ]);

  return null;
}
