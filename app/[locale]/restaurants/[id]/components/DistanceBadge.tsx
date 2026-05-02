'use client';

import { useTranslations } from 'next-intl';
import { distanceKm, useUserLocation } from '@/app/lib/hooks/useUserLocation';

interface DistanceBadgeProps {
  latitude: number | null;
  longitude: number | null;
}

export default function DistanceBadge({ latitude, longitude }: DistanceBadgeProps) {
  const { location, status, request } = useUserLocation();
  const t = useTranslations('restaurant.distanceBadge');

  if (latitude === null || longitude === null) return null;

  if (status === 'granted' && location) {
    const km = distanceKm(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude, longitude },
    );
    const label =
      km < 1
        ? t('metersAway', { meters: Math.round(km * 1000) })
        : t('kmAway', { km: km.toFixed(1) });
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/85 backdrop-blur">
        <span aria-hidden>📍</span> {label}
      </span>
    );
  }

  if (status === 'denied' || status === 'unsupported' || status === 'error') return null;

  return (
    <button
      type="button"
      onClick={request}
      disabled={status === 'requesting'}
      className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/85 backdrop-blur transition hover:bg-white/15 disabled:opacity-60"
    >
      <span aria-hidden>📍</span>
      {status === 'requesting' ? t('calculating') : t('askDistance')}
    </button>
  );
}
