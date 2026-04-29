'use client';

import { useCallback, useEffect, useState } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

type Status =
  | 'idle'
  /** Permissions API en vuelo: aún no sabemos si tenemos permiso. */
  | 'checking'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

export interface UseUserLocationResult {
  location: UserLocation | null;
  status: Status;
  request: () => void;
  error: string | null;
}

/**
 * Geolocation hook con doble entrada:
 *
 * 1. Si el navegador ya concedió permiso a este origen (Permissions API
 *    devuelve `'granted'`), pide coords automáticamente — el usuario no tiene
 *    que volver a tocar el CTA en cada refresh.
 * 2. Si el permiso está en `'prompt'`, queda `idle` esperando un `request()`
 *    explícito (el CTA visible). Esto preserva el principio de "no auto-prompt
 *    en primer load" para usuarios que recién aterrizan.
 *
 * En navegadores que no exponen Permissions API (Safari viejo), se cae al
 * modo `idle` y el usuario tiene que tocar el botón una vez por sesión.
 */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback((opts: { silent?: boolean } = {}) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    // Cuando el permiso ya está concedido en el navegador (auto-fetch desde
    // el effect), `silent` evita el flash de CTA con spinner — quedamos en
    // 'checking' hasta que la coord llega.
    if (!opts.silent) setStatus('requesting');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus('granted');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus('denied');
        else setStatus('error');
        setError(err.message);
      },
      { maximumAge: 60_000, timeout: 10_000, enableHighAccuracy: false },
    );
  }, []);

  const requestFromUser = useCallback(() => {
    fetchPosition({ silent: false });
  }, [fetchPosition]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }

    const permsApi = (navigator as Navigator & {
      permissions?: { query: (d: { name: PermissionName }) => Promise<PermissionStatus> };
    }).permissions;

    if (!permsApi?.query) return; // fallback: queda idle hasta que el usuario haga click.

    // Mientras esperamos la respuesta de la Permissions API no podemos
    // afirmar que falta permiso — escondemos el CTA hasta saberlo.
    setStatus('checking');

    let cancelled = false;
    let permStatus: PermissionStatus | null = null;
    const handleChange = () => {
      if (!permStatus) return;
      if (permStatus.state === 'granted') fetchPosition({ silent: true });
      else if (permStatus.state === 'denied') setStatus('denied');
      else setStatus('idle');
    };

    permsApi
      .query({ name: 'geolocation' as PermissionName })
      .then((s) => {
        if (cancelled) return;
        permStatus = s;
        if (s.state === 'granted') {
          fetchPosition({ silent: true });
        } else if (s.state === 'denied') {
          setStatus('denied');
        } else {
          setStatus('idle');
        }
        s.addEventListener?.('change', handleChange);
      })
      .catch(() => {
        // Navegador rechaza la query — caemos a idle (mostramos el CTA).
        if (!cancelled) setStatus('idle');
      });

    return () => {
      cancelled = true;
      permStatus?.removeEventListener?.('change', handleChange);
    };
  }, [fetchPosition]);

  return { location, status, request: requestFromUser, error };
}

/** Haversine distance between two lat/lng pairs, in kilometers. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
