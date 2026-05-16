import { fetchApi } from './client';
import type { WantToTryItem, WantToTryPage } from '@/app/lib/types/social';

interface WantToTryActionResponseDTO {
  dish_id: string;
  want_to_try: boolean;
}

interface WantToTryItemDTO {
  dish_id: string;
  dish_name: string;
  cover_image_url: string | null;
  computed_rating: number | string;
  review_count: number;
  restaurant_id: string;
  restaurant_slug: string;
  restaurant_name: string;
  restaurant_city: string | null;
  restaurant_latitude: number | string | null;
  restaurant_longitude: number | string | null;
  reservation_url: string | null;
  reservation_provider: string | null;
  saved_at: string;
}

interface WantToTryPageDTO {
  items: WantToTryItemDTO[];
  next_cursor: string | null;
}

function toNumberOrNull(v: number | string | null): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function toItem(dto: WantToTryItemDTO): WantToTryItem {
  return {
    dishId: dto.dish_id,
    dishName: dto.dish_name,
    coverImageUrl: dto.cover_image_url,
    computedRating:
      typeof dto.computed_rating === 'number'
        ? dto.computed_rating
        : Number(dto.computed_rating),
    reviewCount: dto.review_count,
    restaurantId: dto.restaurant_id,
    restaurantSlug: dto.restaurant_slug,
    restaurantName: dto.restaurant_name,
    restaurantCity: dto.restaurant_city,
    restaurantLatitude: toNumberOrNull(dto.restaurant_latitude),
    restaurantLongitude: toNumberOrNull(dto.restaurant_longitude),
    reservationUrl: dto.reservation_url,
    reservationProvider: dto.reservation_provider,
    savedAt: dto.saved_at,
  };
}

export async function addToWantToTry(dishId: string): Promise<void> {
  await fetchApi<WantToTryActionResponseDTO>(
    `/api/dishes/${encodeURIComponent(dishId)}/want-to-try`,
    { method: 'POST' },
  );
}

interface WantToTryCheckResponseDTO {
  saved_ids: string[];
}

/**
 * Bulk lookup of bookmark state for a batch of dishes. Returns the
 * subset of ``dishIds`` that the comensal has already saved. Empty
 * array (not error) when not authenticated. The chat uses this on
 * conversation rehydrate so the bookmark chip paints correctly even
 * for tool results persisted before the dish was saved.
 */
export async function checkWantToTry(
  dishIds: string[],
): Promise<Set<string>> {
  if (!dishIds.length) return new Set<string>();
  try {
    const data = await fetchApi<WantToTryCheckResponseDTO>(
      '/api/users/me/want-to-try/check',
      {
        method: 'POST',
        body: JSON.stringify({ dish_ids: dishIds }),
      },
    );
    return new Set(data.saved_ids);
  } catch {
    // Anonymous (401) or network blip: degrade gracefully — the
    // chip just defaults to "Quiero probar". Better than a crash.
    return new Set<string>();
  }
}

export async function removeFromWantToTry(dishId: string): Promise<void> {
  await fetchApi<WantToTryActionResponseDTO>(
    `/api/dishes/${encodeURIComponent(dishId)}/want-to-try`,
    { method: 'DELETE' },
  );
}

export async function getMyWantToTry(
  cursor?: string | null,
  limit = 20,
): Promise<WantToTryPage> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) qs.set('cursor', cursor);
  const raw = await fetchApi<WantToTryPageDTO>(
    `/api/users/me/want-to-try?${qs}`,
  );
  return { items: raw.items.map(toItem), nextCursor: raw.next_cursor };
}
