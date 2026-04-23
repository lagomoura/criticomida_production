import { fetchApi } from './client';

export interface TrendingCity {
  city: string;
  restaurantCount: number;
}

export interface TrendingDish {
  dishId: string;
  dishName: string;
  restaurantId: string;
  restaurantName: string;
  city: string;
  averageScore: number;
  totalReviews: number;
  likesRecent: number;
  commentsRecent: number;
  reviewsRecent: number;
  priority: number;
}

interface TrendingCityDTO {
  city: string;
  restaurant_count: number;
}

interface TrendingDishDTO {
  dish_id: string;
  dish_name: string;
  restaurant_id: string;
  restaurant_name: string;
  city: string;
  average_score: number | string;
  total_reviews: number;
  likes_recent: number;
  comments_recent: number;
  reviews_recent: number;
  priority: number;
}

function toTrendingCity(dto: TrendingCityDTO): TrendingCity {
  return { city: dto.city, restaurantCount: dto.restaurant_count };
}

function toTrendingDish(dto: TrendingDishDTO): TrendingDish {
  return {
    dishId: dto.dish_id,
    dishName: dto.dish_name,
    restaurantId: dto.restaurant_id,
    restaurantName: dto.restaurant_name,
    city: dto.city,
    averageScore: Number(dto.average_score),
    totalReviews: dto.total_reviews,
    likesRecent: dto.likes_recent,
    commentsRecent: dto.comments_recent,
    reviewsRecent: dto.reviews_recent,
    priority: dto.priority,
  };
}

export async function getTrendingCities(): Promise<TrendingCity[]> {
  const raw = await fetchApi<{ items: TrendingCityDTO[] }>('/api/trending/cities');
  return raw.items.map(toTrendingCity);
}

export async function getTrendingDishes(params: {
  city: string;
  days?: number;
  limit?: number;
}): Promise<TrendingDish[]> {
  const q = new URLSearchParams({ city: params.city });
  if (params.days) q.set('days', String(params.days));
  if (params.limit) q.set('limit', String(params.limit));
  const raw = await fetchApi<{ items: TrendingDishDTO[] }>(
    `/api/trending/dishes?${q.toString()}`,
  );
  return raw.items.map(toTrendingDish);
}
