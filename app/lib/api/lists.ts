/**
 * Client for the dish_lists endpoints.
 *
 * Public list reads (`GET /api/lists/{slug}`) are used by the SSR
 * page at `/listas/[slug]` so anyone with the link can view the list,
 * even unauthenticated. Private operations (rename, delete, toggle
 * public) require an access cookie.
 */

import { fetchApi } from './client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DishListItem {
  dish_id: string;
  position: number;
  note: string | null;
  dish_name: string;
  dish_cover_image_url: string | null;
  dish_rating: number | null;
  dish_review_count: number;
  dish_price_tier: string | null;
  restaurant_id: string;
  restaurant_slug: string;
  restaurant_name: string;
  restaurant_location_name: string;
  restaurant_lat: number | null;
  restaurant_lng: number | null;
}

export interface DishListDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_public: boolean;
  owner_display_name: string | null;
  owner_handle: string | null;
  created_at: string;
  updated_at: string;
  items: DishListItem[];
}

export interface DishListSummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_public: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch a list by slug. Used from server components — does not include
 * credentials, so private lists return 404.
 */
export async function fetchPublicList(
  slug: string,
): Promise<DishListDetail | null> {
  const res = await fetch(`${BASE_URL}/api/lists/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch list ${slug}: ${res.status}`);
  }
  return (await res.json()) as DishListDetail;
}

export async function listMyDishLists(): Promise<DishListSummary[]> {
  return fetchApi<DishListSummary[]>('/api/lists/me');
}

export async function patchDishList(
  listId: string,
  patch: Partial<{ name: string; description: string; is_public: boolean }>,
): Promise<DishListDetail> {
  return fetchApi<DishListDetail>(`/api/lists/${listId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteDishList(listId: string): Promise<void> {
  await fetchApi<void>(`/api/lists/${listId}`, { method: 'DELETE' });
}
