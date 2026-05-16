/**
 * Build a Google Maps deep link for a venue. ``search/?api=1`` opens
 * Maps on web and the native app on mobile; passing the venue name as
 * ``query_place_id`` makes the dropped pin show the place label
 * instead of raw coordinates.
 *
 * Returns ``null`` when either coordinate is missing so callers can
 * conditionally hide a "directions" affordance instead of linking to
 * a broken map.
 */
export function buildMapsUrl(
  lat: number | null,
  lng: number | null,
  name: string,
): string | null {
  if (lat === null || lng === null) return null;
  const query = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${encodeURIComponent(name)}`;
}
