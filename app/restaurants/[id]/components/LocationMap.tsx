'use client';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface LocationMapProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function LocationMap({ location, latitude, longitude }: LocationMapProps) {
  const hasCoords = latitude != null && longitude != null;
  const position = hasCoords ? { lat: Number(latitude), lng: Number(longitude) } : null;

  const mapsLink = hasCoords
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(location)}`;

  return (
    <div className="mb-4 w-full">
      <div className="cc-card mb-3 shadow-sm">
        <div className="cc-card-body">
          <h5 className="card-title mb-2">Ubicación</h5>
          <p className="mb-3 text-sm text-neutral-500">{location}</p>
          {position && (
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
              <div className="overflow-hidden rounded-xl border border-neutral-200" style={{ height: 280 }}>
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
            className="mt-2 inline-block text-sm text-[var(--mainPink)] hover:underline"
          >
            Ver en Google Maps →
          </a>
        </div>
      </div>
    </div>
  );
}
