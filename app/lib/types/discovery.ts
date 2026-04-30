export interface MapDishHighlight {
  dishId: string;
  name: string;
  coverImageUrl: string | null;
  executionAvg: number | null;
  valuePropAvg: number | null;
  presentationAvg: number | null;
  reviewCount: number;
  geekScore: number;
}

export type MapSort = 'geek_score' | 'value_prop' | 'trending';

export interface MapRestaurantPin {
  restaurantId: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  topGeekScore: number;
  hasChefBadge: boolean;
  hasGemBadge: boolean;
  coverImageUrl: string | null;
  locationName: string | null;
  computedRating: number;
  reviewCount: number;
  priceLevel: number | null;
  cuisineTypes: string[] | null;
  categoryName: string | null;
  trendingCount: number;
  isEmpty: boolean;
  goldenDish: MapDishHighlight | null;
  bestValueDish: MapDishHighlight | null;
}

export interface BboxQuery {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  limit?: number;
  sort?: MapSort;
  includeEmpty?: boolean;
  chefOnly?: boolean;
}

export interface MapBboxResponse {
  items: MapRestaurantPin[];
  truncated: boolean;
}
