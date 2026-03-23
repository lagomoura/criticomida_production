'use client';

import React from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

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
  if (r.latitude != null && r.longitude != null) {
    return { lat: r.latitude, lng: r.longitude };
  }
  return null;
}

const MapComponent = ({ restaurants }: MapComponentProps) => {
  const restaurantsWithPos = restaurants.filter((r) => getPosition(r) !== null);

  const mapCenter =
    restaurantsWithPos.length > 0
      ? (getPosition(restaurantsWithPos[0]) ?? DEFAULT_CENTER)
      : DEFAULT_CENTER;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div
        className={
          'h-[min(50vh,36rem)] w-full min-h-[17.5rem] max-h-[37.5rem] ' +
          'overflow-hidden rounded-xl border border-neutral-200 shadow-sm'
        }
      >
        <Map defaultCenter={mapCenter} defaultZoom={10}>
          {restaurantsWithPos.map((restaurant) => {
            const pos = getPosition(restaurant)!;
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
