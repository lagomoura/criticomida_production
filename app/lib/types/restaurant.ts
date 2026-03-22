import { Category } from './category';

export interface RestaurantListItem {
  id: string;
  slug: string;
  name: string;
  location_name: string;
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
  category_id: number;
  cover_image_url: string | null;
  computed_rating: number;
  review_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  category: Category | null;
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
