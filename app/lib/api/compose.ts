import { fetchApi } from './client';
import { isSocialMockEnabled, mockDelay } from './_mocks';
import { mockCreatePost, type MockCreatePostInput } from './_mocks/compose';
import { toReviewPost, type FeedItemDTO } from './feed';
import type { AuthorSummary, ReviewExtras, ReviewPost } from '@/app/lib/types/social';

/** Google-Places-sourced restaurant payload. Matches `RestaurantFromPlace`. */
export interface ComposeRestaurant {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  googleMapsUrl: string | null;
  website: string | null;
  phoneNumber: string | null;
}

export interface CreatePostInput {
  dishName: string;
  /** Set when the user picked an existing dish from autocomplete. */
  dishId?: string | null;
  /** Primary (Places) path. Preferred. */
  restaurant?: ComposeRestaurant;
  /** Legacy free-text path. Still accepted by the backend for scripts/mocks. */
  restaurantName?: string;
  category?: string | null;
  score: number;
  text: string;
  extras?: ReviewExtras;
  /** Used only in mock mode. */
  author: AuthorSummary;
}

interface PostCreateDTO {
  dish_name: string;
  dish_id?: string | null;
  restaurant?: {
    place_id: string;
    name: string;
    formatted_address: string | null;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    google_maps_url: string | null;
    website: string | null;
    phone_number: string | null;
  };
  restaurant_name?: string;
  category?: string | null;
  score: number;
  text: string;
  extras?: {
    portion_size?: 'small' | 'medium' | 'large' | null;
    would_order_again?: boolean | null;
    visited_with?: string | null;
    is_anonymous?: boolean | null;
    date_tasted?: string | null;
    price_tier?: '$' | '$$' | '$$$' | null;
    pros?: string[];
    cons?: string[];
    tags?: string[];
  };
}

function toPostCreateDTO(input: CreatePostInput): PostCreateDTO {
  const dto: PostCreateDTO = {
    dish_name: input.dishName,
    category: input.category ?? null,
    score: input.score,
    text: input.text,
  };
  if (input.dishId) dto.dish_id = input.dishId;

  if (input.restaurant) {
    dto.restaurant = {
      place_id: input.restaurant.placeId,
      name: input.restaurant.name,
      formatted_address: input.restaurant.formattedAddress,
      latitude: input.restaurant.latitude,
      longitude: input.restaurant.longitude,
      city: input.restaurant.city,
      google_maps_url: input.restaurant.googleMapsUrl,
      website: input.restaurant.website,
      phone_number: input.restaurant.phoneNumber,
    };
  } else if (input.restaurantName) {
    dto.restaurant_name = input.restaurantName;
  }

  const extras = input.extras;
  if (extras) {
    dto.extras = {
      portion_size: extras.portionSize ?? null,
      would_order_again: extras.wouldOrderAgain ?? null,
      visited_with: extras.visitedWith ?? null,
      is_anonymous: extras.isAnonymous ?? null,
      date_tasted: extras.dateTasted ?? null,
      price_tier: extras.priceTier ?? null,
      pros: extras.pros ?? [],
      cons: extras.cons ?? [],
      tags: extras.tags ?? [],
    };
  }
  return dto;
}

export async function createPost(input: CreatePostInput): Promise<ReviewPost> {
  if (isSocialMockEnabled()) {
    await mockDelay(500);
    return mockCreatePost(input as MockCreatePostInput);
  }
  const raw = await fetchApi<FeedItemDTO>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(toPostCreateDTO(input)),
  });
  return toReviewPost(raw);
}
