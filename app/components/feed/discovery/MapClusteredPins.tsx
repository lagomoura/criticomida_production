'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer, type Marker } from '@googlemaps/markerclusterer';
import RestaurantMapPin from './MapRestaurantPin';
import MapRestaurantPreviewBody from './MapRestaurantPreviewBody';
import MapEmptyRestaurantBody from './MapEmptyRestaurantBody';
import type { MapRestaurantPin as MapRestaurantPinT } from '@/app/lib/types/discovery';

interface Props {
  pins: MapRestaurantPinT[];
  selectedId: string | null;
  onSelect: (pin: MapRestaurantPinT) => void;
  onClose: () => void;
}

export default function MapClusteredPins({ pins, selectedId, onSelect, onClose }: Props) {
  const map = useMap();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const syncScheduledRef = useRef(false);

  const sync = useCallback(() => {
    const c = clustererRef.current;
    if (!c) return;
    c.clearMarkers();
    c.addMarkers(Array.from(markersRef.current.values()));
  }, []);

  const scheduleSync = useCallback(() => {
    if (syncScheduledRef.current) return;
    syncScheduledRef.current = true;
    queueMicrotask(() => {
      syncScheduledRef.current = false;
      sync();
    });
  }, [sync]);

  useEffect(() => {
    if (!map) return;
    const c = new MarkerClusterer({ map });
    clustererRef.current = c;
    // Si los hijos ya registraron sus marcadores antes que se cree el clusterer
    // (orden de effects: hijos antes que padre), los volcamos ahora.
    c.addMarkers(Array.from(markersRef.current.values()));
    return () => {
      c.clearMarkers();
      clustererRef.current = null;
    };
  }, [map]);

  const register = useCallback(
    (id: string, marker: Marker | null) => {
      if (marker) markersRef.current.set(id, marker);
      else markersRef.current.delete(id);
      scheduleSync();
    },
    [scheduleSync],
  );

  return (
    <>
      {pins.map((pin) => (
        <PinMarker
          key={pin.restaurantId}
          pin={pin}
          selected={selectedId === pin.restaurantId}
          onClick={onSelect}
          onClose={onClose}
          register={register}
        />
      ))}
    </>
  );
}

interface PinMarkerProps {
  pin: MapRestaurantPinT;
  selected: boolean;
  onClick: (pin: MapRestaurantPinT) => void;
  onClose: () => void;
  register: (id: string, marker: Marker | null) => void;
}

function PinMarker({ pin, selected, onClick, onClose, register }: PinMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    register(pin.restaurantId, marker);
    return () => register(pin.restaurantId, null);
  }, [marker, pin.restaurantId, register]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: pin.latitude, lng: pin.longitude }}
        onClick={() => onClick(pin)}
      >
        <RestaurantMapPin pin={pin} selected={selected} />
      </AdvancedMarker>
      {selected && marker && (
        <InfoWindow
          anchor={marker}
          onCloseClick={onClose}
          maxWidth={pin.isEmpty ? 320 : 380}
          headerDisabled
        >
          {pin.isEmpty ? (
            <MapEmptyRestaurantBody pin={pin} />
          ) : (
            <MapRestaurantPreviewBody pin={pin} />
          )}
        </InfoWindow>
      )}
    </>
  );
}
