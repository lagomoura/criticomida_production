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

// ----- Dashboard del owner -----

export type SentimentLabel = 'positive' | 'neutral' | 'negative';
export type PortionSize = 'small' | 'medium' | 'large';
export type AuthorRole = 'admin' | 'critic' | 'user';
export type AuthorGender = 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';

export interface OwnerReviewItem {
  id: string;
  dish_id: string;
  dish_name: string;
  rating: number;
  note: string;
  user_display_name: string;
  user_handle: string | null;
  is_anonymous: boolean;
  date_tasted: string;
  has_owner_response: boolean;
  sentiment_label: SentimentLabel | null;
  sentiment_score: number | null;
  /** Pilares técnicos 1-3 (1=débil, 2=ok, 3=destacado). */
  presentation: number | null;
  execution: number | null;
  value_prop: number | null;
  portion_size: PortionSize | null;
  would_order_again: boolean | null;
  /** Demografía del autor — null cuando is_anonymous=true o el user
   *  no completó el campo en su perfil. age_range es un bucket
   *  derivado en el backend; la fecha exacta nunca llega al frontend. */
  author_role: AuthorRole | null;
  author_gender: AuthorGender | null;
  author_age_range: string | null;
}

export interface OwnerReviewsListResponse {
  items: OwnerReviewItem[];
  total: number;
  pending_count: number;
}

export interface ListOwnerReviewsOptions {
  sentiment?: SentimentLabel;
  sort?: 'sentiment_asc';
}

export async function listOwnerReviews(
  slug: string,
  opts: ListOwnerReviewsOptions = {},
): Promise<OwnerReviewsListResponse> {
  const params = new URLSearchParams();
  if (opts.sentiment) params.set('sentiment', opts.sentiment);
  if (opts.sort) params.set('sort', opts.sort);
  const qs = params.toString();
  return fetchApi<OwnerReviewsListResponse>(
    `/api/restaurants/${slug}/owner/reviews${qs ? `?${qs}` : ''}`,
  );
}
