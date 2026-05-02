'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
import { MapPayload } from '@/app/lib/api/chat';

interface MapEmbedProps {
  payload: MapPayload;
}

/**
 * Renders a CTA card pointing at the discovery map. The actual map
 * lives elsewhere in the app — we just hand off via deeplink so the
 * chat drawer doesn't need to bundle Google Maps.
 */
export default function MapEmbed({ payload }: MapEmbedProps) {
  const t = useTranslations('chat.mapCard');
  const locale = useLocale();

  const params = new URLSearchParams();
  if (payload.bbox) {
    params.set(
      'bbox',
      [
        payload.bbox.south,
        payload.bbox.west,
        payload.bbox.north,
        payload.bbox.east,
      ].join(','),
    );
  }
  if (payload.center) {
    params.set('lat', String(payload.center.lat));
    params.set('lng', String(payload.center.lng));
    if (payload.center.zoom) params.set('zoom', String(payload.center.zoom));
  }
  if (payload.dish_ids?.length) {
    params.set('dishes', payload.dish_ids.join(','));
  }
  const href = `/${locale}/mapa?${params.toString()}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-subtle p-3 transition-shadow hover:shadow-[var(--shadow-elevated)]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-action-primary/10 text-action-primary">
        <FontAwesomeIcon icon={faMapLocationDot} aria-hidden className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-sm font-medium text-text-primary">
          {t('title')}
        </span>
        <span className="text-xs text-text-muted">{t('subtitle')}</span>
      </span>
    </Link>
  );
}
