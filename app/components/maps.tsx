'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';

interface MapRestaurant {
  id: number | string;
  name: string;
  position?: { lat: number; lng: number };
  latitude?: number | null;
  longitude?: number | null;
}

interface MapComponentProps {
  restaurants: MapRestaurant[];
}

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

function getPosition(r: MapRestaurant): { lat: number; lng: number } | null {
  if (r.position) return r.position;
  const lat = r.latitude != null ? Number(r.latitude) : NaN;
  const lng = r.longitude != null ? Number(r.longitude) : NaN;
  if (isFinite(lat) && isFinite(lng)) return { lat, lng };
  return null;
}

// Fits map bounds to the given positions — only re-runs when positions change by value.
function BoundsFitter({ positions }: { positions: { lat: number; lng: number }[] }) {
  const map = useMap();
  const prevKeyRef = useRef('');

  useEffect(() => {
    if (!map || positions.length === 0) return;
    const key = positions.map(p => `${p.lat},${p.lng}`).join('|');
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    if (positions.length === 1) {
      map.setCenter(positions[0]);
      map.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    positions.forEach(p => bounds.extend(p));
    map.fitBounds(bounds, 60);
  }, [map, positions]);

  return null;
}

const MapComponent = ({ restaurants }: MapComponentProps) => {
  const positions = useMemo(() => {
    return restaurants
      .map(r => getPosition(r))
      .filter((p): p is { lat: number; lng: number } => p !== null);
  }, [restaurants]);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div
        className={
          'h-[min(50vh,36rem)] w-full min-h-[17.5rem] max-h-[37.5rem] ' +
          'overflow-hidden rounded-xl border border-neutral-200 shadow-sm'
        }
      >
        <Map defaultCenter={DEFAULT_CENTER} defaultZoom={10}>
          <BoundsFitter positions={positions} />
          {restaurants.map((restaurant) => {
            const pos = getPosition(restaurant);
            if (!pos) return null;
            return (
              <Marker
                key={restaurant.id}
                position={pos}
                title={restaurant.name}
              />
            );
          })}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapComponent;
