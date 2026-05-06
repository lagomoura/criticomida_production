'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import MapDiscoveryView, {
  type MapDiscoveryOverride,
} from '@/app/components/feed/discovery/MapDiscoveryView';

/**
 * Standalone "discovery map" page at ``/[locale]/mapa``.
 *
 * Two entry surfaces:
 *
 * 1. **Direct nav** — the comensal opens the page from a future
 *    nav link / chip. No query params; ``MapDiscoveryView`` falls
 *    back to the user's geolocation (with CABA as last resort).
 *
 * 2. **Deep link from chat** — the Sommelier's "Ver en mapa" CTA
 *    on a card pushes ``/mapa?lat=X&lng=Y&zoom=Z&dishes=ID``. We
 *    parse those query params and forward them to
 *    ``MapDiscoveryView`` via ``overrideCenter``. The standalone
 *    map covers the whole catalog (clusters + filter chips) so
 *    the comensal can browse from the requested point even if the
 *    specific dish isn't separately highlighted yet — that's a
 *    follow-up enhancement.
 *
 * The page reuses the same map widget the home feed already
 * shipped (``MapDiscoveryView`` from ``components/feed/discovery``);
 * we only added an opt-in ``overrideCenter`` prop so the deep-link
 * use case doesn't have to fight with the geolocation hook.
 */
export default function MapaClient() {
  const t = useTranslations('mapa');
  const params = useSearchParams();

  const override: MapDiscoveryOverride | undefined = useMemo(() => {
    const latRaw = params.get('lat');
    const lngRaw = params.get('lng');
    if (latRaw === null || lngRaw === null) return undefined;
    const lat = Number.parseFloat(latRaw);
    const lng = Number.parseFloat(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
    const zoomRaw = params.get('zoom');
    const zoomParsed =
      zoomRaw !== null ? Number.parseInt(zoomRaw, 10) : null;
    const zoom =
      zoomParsed !== null && Number.isFinite(zoomParsed) && zoomParsed > 0
        ? Math.min(20, Math.max(1, zoomParsed))
        : null;
    return { center: { lat, lng }, zoom };
  }, [params]);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-2xl text-text-primary sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{t('subtitle')}</p>
      </header>
      <MapDiscoveryView overrideCenter={override} />
    </div>
  );
}
