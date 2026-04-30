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

  // Mantenemos pins en un ref para que el effect de centrado NO dependa
  // de su identidad. Sin esto, panBy → bounds_changed → refetch del bbox →
  // nueva referencia de pins → effect re-dispara → loop visible (el mapa
  // sube y baja indefinidamente).
  const pinsRef = useRef(pins);
  useEffect(() => {
    pinsRef.current = pins;
  }, [pins]);

  // Cuando un pin se selecciona, garantizamos que el InfoWindow + el pin
  // entren completos en el viewport.
  //
  // Estrategia en 2 pasos:
  //   1. Verificar si el preview cabe en el viewport al zoom actual.
  //      Si SÍ → solo paneamos a una coord ajustada (pin queda abajo,
  //      InfoWindow se abre arriba con espacio). Sin tocar el zoom.
  //   2. Si NO cabe → fitBounds para hacer zoom out al nivel mínimo
  //      donde sí entra. Es el único caso donde se sacrifica zoom.
  //
  // Sin esto, fitBounds incondicional hacía zoom-in/out en cada click, aun
  // cuando el preview ya cabía cómodo al zoom del usuario.
  useEffect(() => {
    if (!map || !selectedId) return;
    const target = pinsRef.current.find((p) => p.restaurantId === selectedId);
    if (!target) return;

    const projection = map.getProjection();
    const zoom = map.getZoom();
    const div = map.getDiv();
    if (!projection || zoom === undefined || !div) {
      map.panTo({ lat: target.latitude, lng: target.longitude });
      return;
    }

    const PREVIEW_W = 360;
    const PREVIEW_H = 500;
    const SAFE_PAD = 24;
    const PIN_TAIL = 80;

    const requiredW = PREVIEW_W + 2 * SAFE_PAD;
    const requiredH = PREVIEW_H + PIN_TAIL + 2 * SAFE_PAD;
    const fitsAtCurrentZoom =
      requiredW <= div.clientWidth && requiredH <= div.clientHeight;

    const scale = Math.pow(2, zoom);
    const pinLatLng = new google.maps.LatLng(target.latitude, target.longitude);
    const pinPoint = projection.fromLatLngToPoint(pinLatLng);
    if (!pinPoint) {
      map.panTo(pinLatLng);
      return;
    }

    if (fitsAtCurrentZoom) {
      // Pan only — desplaza el centro al norte del pin para que el pin quede
      // por debajo del centro vertical, dejando espacio arriba para el
      // InfoWindow. Mercator: norte = world.y MENOR.
      const offsetPx = (PREVIEW_H - PIN_TAIL) / 2;
      const adjusted = new google.maps.Point(
        pinPoint.x,
        pinPoint.y - offsetPx / scale,
      );
      const adjustedLatLng = projection.fromPointToLatLng(adjusted);
      map.panTo(adjustedLatLng ?? pinLatLng);
      return;
    }

    // No cabe — zoom out vía fitBounds.
    const dxWorld = (PREVIEW_W / 2 + SAFE_PAD) / scale;
    const dyAboveWorld = (PREVIEW_H + SAFE_PAD) / scale;
    const dyBelowWorld = (PIN_TAIL + SAFE_PAD) / scale;
    const ne = projection.fromPointToLatLng(
      new google.maps.Point(pinPoint.x + dxWorld, pinPoint.y - dyAboveWorld),
    );
    const sw = projection.fromPointToLatLng(
      new google.maps.Point(pinPoint.x - dxWorld, pinPoint.y + dyBelowWorld),
    );
    if (!ne || !sw) {
      map.panTo(pinLatLng);
      return;
    }
    const bounds = new google.maps.LatLngBounds(sw, ne);
    map.fitBounds(bounds, { top: 16, bottom: 16, left: 16, right: 16 });
  }, [map, selectedId]);

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
            <MapRestaurantPreviewBody pin={pin} onClose={onClose} />
          )}
        </InfoWindow>
      )}
    </>
  );
}
