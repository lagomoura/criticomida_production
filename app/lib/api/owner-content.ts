import { fetchApi } from './client';
import type {
  OfficialPhoto,
  OfficialPhotosListResponse,
  OwnerResponse,
} from '../types/owner-content';

// ----- Owner response a una review -----

export async function getOwnerResponse(
  reviewId: string,
): Promise<OwnerResponse | null> {
  return fetchApi<OwnerResponse | null>(
    `/api/dish-reviews/${reviewId}/owner-response`,
  );
}

export async function upsertOwnerResponse(
  reviewId: string,
  body: string,
): Promise<OwnerResponse> {
  return fetchApi<OwnerResponse>(
    `/api/dish-reviews/${reviewId}/owner-response`,
    {
      method: 'PUT',
      body: JSON.stringify({ body }),
    },
  );
}

export async function deleteOwnerResponse(reviewId: string): Promise<void> {
  await fetchApi<void>(`/api/dish-reviews/${reviewId}/owner-response`, {
    method: 'DELETE',
  });
}

// ----- Fotos oficiales del restaurante -----

export async function listOfficialPhotos(
  slug: string,
): Promise<OfficialPhotosListResponse> {
  return fetchApi<OfficialPhotosListResponse>(
    `/api/restaurants/${slug}/official-photos`,
  );
}

export async function addOfficialPhoto(
  slug: string,
  body: { url: string; alt_text?: string | null; display_order?: number },
): Promise<OfficialPhoto> {
  return fetchApi<OfficialPhoto>(
    `/api/restaurants/${slug}/official-photos`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export async function deleteOfficialPhoto(
  slug: string,
  photoId: string,
): Promise<void> {
  await fetchApi<void>(`/api/restaurants/${slug}/official-photos/${photoId}`, {
    method: 'DELETE',
  });
}
