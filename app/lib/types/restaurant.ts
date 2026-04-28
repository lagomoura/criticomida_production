import { Category } from './category';

export interface GooglePhoto {
  photo_reference: string | null;
  width: number | null;
  height: number | null;
  attribution_html: string | null;
  url: string | null;
}

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
  // Fase B — Google Places enrichment
  google_rating: number | null;
  google_user_ratings_total: number | null;
  google_photos: GooglePhoto[] | null;
  editorial_summary: string | null;
  editorial_summary_lang: string | null;
  cuisine_types: string[] | null;
  google_cached_at: string | null;
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

// ----- Aggregation types (perfil-page endpoints) -----

export interface ProsConsAggregateItem {
  text: string;
  count: number;
}

export interface DimensionAggregate {
  average: number | null;
  count: number;
}

export interface RestaurantAggregates {
  pros_top: ProsConsAggregateItem[];
  cons_top: ProsConsAggregateItem[];
  dimension_averages: Partial<Record<RatingDimensionKey, DimensionAggregate>>;
  photos_count: number;
  dishes_count: number;
  reviews_count: number;
}

export interface RestaurantPhoto {
  id: string;
  url: string;
  alt_text: string | null;
  taken_at: string;
  dish_id: string;
  dish_name: string;
  review_id: string | null;
  user_id: string;
  user_handle: string | null;
  user_display_name: string;
}

export interface RestaurantPhotosResponse {
  items: RestaurantPhoto[];
  next_cursor: string | null;
}

export interface DiaryVisitor {
  id: string;
  handle: string | null;
  display_name: string;
  avatar_url: string | null;
}

export interface MostOrderedDish {
  id: string;
  name: string;
  review_count: number;
}

export interface DiaryStats {
  unique_visitors: number;
  visits_total: number;
  visits_last_7d: number;
  most_ordered_dish: MostOrderedDish | null;
  recent_visitors: DiaryVisitor[];
}

export interface SignatureDish {
  id: string;
  name: string;
  cover_image_url: string | null;
  computed_rating: number;
  review_count: number;
  best_quote: string | null;
  best_quote_author: string | null;
}

export interface SignatureDishesResponse {
  items: SignatureDish[];
}

export interface NearbyRestaurantItem {
  id: string;
  slug: string;
  name: string;
  location_name: string;
  cover_image_url: string | null;
  google_photo_url: string | null;
  computed_rating: number;
  review_count: number;
  category: Category | null;
  distance_km: number;
}

export interface NearbyRestaurantsResponse {
  items: NearbyRestaurantItem[];
}

export interface OpenStatusInfo {
  isOpen: boolean;
  closesAt?: string;
  opensAt?: string;
  todayLabel?: string;
  hasHours: boolean;
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
