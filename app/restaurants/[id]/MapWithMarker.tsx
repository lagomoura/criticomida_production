import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix default marker icon for Leaflet in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export default function MapWithMarker({ lat, lng, address }: { lat: number; lng: number; address: string }) {
  useEffect(() => {
    // Ensure map container is styled
    const style = document.createElement('style');
    style.innerHTML = `.leaflet-container { min-height: 240px; min-width: 100%; border-radius: 1em; box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08); outline: none; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} style={{ width: '100%', height: '100%', borderRadius: '1em' }} aria-label={`Mapa de ubicación para ${address}`}> 
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={icon}>
        <Popup>{address}</Popup>
      </Marker>
    </MapContainer>
  );
} 