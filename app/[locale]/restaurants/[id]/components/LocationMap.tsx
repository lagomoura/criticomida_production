'use client';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useTranslations } from 'next-intl';

interface LocationMapProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function LocationMap({ location, latitude, longitude }: LocationMapProps) {
  const t = useTranslations('restaurant.locationMap');
  const hasCoords = latitude != null && longitude != null;
  const position = hasCoords ? { lat: Number(latitude), lng: Number(longitude) } : null;

  const mapsLink = hasCoords
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(location)}`;

  return (
    <section className="mb-4 w-full rounded-2xl border border-border-default bg-surface-card p-5">
      <h5 className="mb-2 text-sm font-semibold text-text-primary">{t('title')}</h5>
      <p className="mb-3 text-sm text-text-muted">{location}</p>
      {position && (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <div className="overflow-hidden rounded-xl border border-border-default" style={{ height: 280 }}>
            <Map defaultCenter={position} defaultZoom={15}>
              <Marker position={position} title={location} />
            </Map>
          </div>
        </APIProvider>
      )}
      <a
        href={mapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm text-action-primary hover:underline"
      >
        {t('viewOnGoogleMaps')}
      </a>
    </section>
  );
}
