'use client';

import { useEffect, useState } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

type Status = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported' | 'error';

export interface UseUserLocationResult {
  location: UserLocation | null;
  status: Status;
  request: () => void;
  error: string | null;
}

/**
 * Geolocation hook with explicit user gate. Does NOT auto-request — call
 * `request()` (e.g. on a button click) to prompt the browser permission.
 */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
    }
  }, []);

  function request() {
    if (typeof window === 'undefined') return;
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus('requesting');
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
  }

  return { location, status, request, error };
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
