import { Category } from './category';

export interface RestaurantListItem {
  id: string;
  slug: string;
  name: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  computed_rating: number;
  review_count: number;
  category: Category | null;
}

export interface RestaurantDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  category_id: number | null;
  cover_image_url: string | null;
  computed_rating: number;
  review_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  category: Category | null;
  google_place_id: string | null;
  website: string | null;
  phone_number: string | null;
  google_maps_url: string | null;
  price_level: number | null;
  opening_hours: string[] | null;
  creator: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface CreateRestaurantRequest {
  slug: string;
  name: string;
  description?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  cover_image_url?: string;
  category_id?: number;
  google_place_id?: string;
  website?: string;
  phone_number?: string;
  google_maps_url?: string;
  price_level?: number;
  opening_hours?: string[];
}

export type RatingDimensionKey = 'cleanliness' | 'ambiance' | 'service' | 'value' | 'food_quality';

export interface RestaurantRatingsResponse {
  restaurant_id: string;
  averages: Partial<Record<RatingDimensionKey, number>>;
  user_breakdown: Record<string, {
    dimension: RatingDimensionKey;
    score: number;
    user_display_name: string;
  }[]>;
}

/** @deprecated Use RestaurantListItem instead */
export interface Restaurant {
  id: number;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  image: string;
  location: string;
  rating: number;
  description: string;
  reviewCount: number;
  category: string;
}
