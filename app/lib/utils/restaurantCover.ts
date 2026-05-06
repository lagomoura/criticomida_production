/**
 * Pick the best displayable cover URL for a restaurant card.
 * Returns null if nothing usable; callers should render a placeholder.
 *
 * Why: `cover_image_url` may store a Google JS-SDK PhotoService URL whose
 * token expires within minutes (`/maps/api/place/js/PhotoService`). The
 * persistent Places HTTP photo URL we cached during Fase B enrichment lives
 * in `google_photo_url`. Prefer that when the legacy cover is stale.
 */
export function resolveRestaurantCover(
  coverImageUrl: string | null | undefined,
  googlePhotoUrl: string | null | undefined,
): string | null {
  const cover = coverImageUrl?.trim() || null;
  const google = googlePhotoUrl?.trim() || null;

  const isStaleJsSdk = (u: string) =>
    u.includes('/maps/api/place/js/PhotoService');

  if (cover && !isStaleJsSdk(cover)) return cover;
  if (google) return google;
  if (cover) return cover;
  return null;
}
