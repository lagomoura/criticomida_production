'use client';

import React from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Restaurant } from '@/app/data/restaurants';

interface MapComponentProps {
  restaurants: Restaurant[];
}

const MapComponent = ({ restaurants }: MapComponentProps) => {
  const mapCenter =
    restaurants.length > 0
      ? restaurants[0].position
      : { lat: 48.8566, lng: 2.3522 };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div
        className={
          'h-[min(50vh,36rem)] w-full min-h-[17.5rem] max-h-[37.5rem] ' +
          'overflow-hidden rounded-xl border border-neutral-200 shadow-sm'
        }
      >
        <Map defaultCenter={mapCenter} defaultZoom={10}>
          {restaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={restaurant.position}
              title={restaurant.name}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapComponent;
