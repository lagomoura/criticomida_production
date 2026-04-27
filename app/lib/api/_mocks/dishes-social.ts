import type {
  CursorPage,
  DishAggregates,
  DishDetail,
  DishDiaryStats,
  DishPhotosPage,
  RelatedDishItem,
  ReviewPost,
} from '@/app/lib/types/social';
import { mockFeed } from './feed';

const HERO_OVERRIDES: Record<string, string> = {
  'dish-001': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1600&q=70',
  'dish-004': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=70',
  'dish-008': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1600&q=70',
};

function reviewsForDish(dishId: string): ReviewPost[] {
  const feed = mockFeed({ type: 'for_you' });
  return feed.items.filter((p) => p.dish.id === dishId);
}

export function mockGetDishDetail(dishId: string): DishDetail | null {
  const reviews = reviewsForDish(dishId);
  if (reviews.length === 0) return null;

  const totalScore = reviews.reduce((sum, r) => sum + r.score, 0);
  const averageScore = Math.round((totalScore / reviews.length) * 10) / 10;
  const wouldOrderAgainPct = Math.round(
    (reviews.filter((r) => r.score >= 3.5).length / reviews.length) * 100,
  );

  const first = reviews[0];
  const heroFromReview = first.media && first.media.length > 0 ? first.media[0].url : null;

  return {
    id: first.dish.id,
    name: first.dish.name,
    description:
      'Plato emblemático de la casa, preparado con técnica artesanal y producto de estación.',
    restaurantId: first.dish.restaurantId,
    restaurantName: first.dish.restaurantName,
    restaurantSlug: first.dish.restaurantId,
    restaurantLocationName: 'Palermo, CABA',
    restaurantCoverUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=70',
    restaurantAverageRating: 4.4,
    restaurantGoogleRating: 4.5,
    restaurantLatitude: -34.585,
    restaurantLongitude: -58.43,
    category: first.dish.category ?? null,
    cuisineTypes: ['argentinian', 'parrilla'],
    heroImage: HERO_OVERRIDES[dishId] ?? heroFromReview ?? null,
    averageScore,
    reviewCount: reviews.length,
    wouldOrderAgainPct,
    priceRange: '$$',
    isSignature: true,
    editorialBlurb:
      'Una preparación con raíz porteña que se reinterpreta en cada cocina. Aquí lo trabajan a fuego lento y con corte propio, fiel al espíritu del barrio.',
    editorialSource: 'claude',
    createdByDisplayName: 'CritiComida',
  };
}

export function mockGetDishReviews(dishId: string): CursorPage<ReviewPost> {
  return { items: reviewsForDish(dishId), nextCursor: null };
}

export function mockGetDishAggregates(dishId: string): DishAggregates {
  const reviews = reviewsForDish(dishId);
  const total = reviews.length || 1;
  const histogram: Record<'1' | '2' | '3' | '4' | '5', number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  };
  reviews.forEach((r) => {
    const bucket = String(Math.floor(r.score)) as '1' | '2' | '3' | '4' | '5';
    if (bucket in histogram) histogram[bucket] += 1;
  });
  const yes = Math.round(total * 0.78);
  return {
    prosTop: [
      { text: 'Sabor intenso', count: Math.max(1, Math.round(total * 0.6)) },
      { text: 'Buena porción', count: Math.max(1, Math.round(total * 0.45)) },
      { text: 'Bien presentado', count: Math.max(1, Math.round(total * 0.3)) },
    ],
    consTop: [
      { text: 'Algo salado', count: Math.max(1, Math.round(total * 0.2)) },
      { text: 'Caro', count: Math.max(1, Math.round(total * 0.15)) },
    ],
    tagsTop: [
      { tag: 'auténtico', count: Math.max(1, Math.round(total * 0.5)) },
      { tag: 'abundante', count: Math.max(1, Math.round(total * 0.4)) },
      { tag: 'casero', count: Math.max(1, Math.round(total * 0.3)) },
      { tag: 'picante', count: Math.max(1, Math.round(total * 0.2)) },
    ],
    ratingHistogram: histogram,
    portionDistribution: {
      small: Math.round(total * 0.1),
      medium: Math.round(total * 0.6),
      large: Math.round(total * 0.2),
      noAnswer: Math.max(0, total - Math.round(total * 0.9)),
    },
    wouldOrderAgain: {
      yes,
      no: Math.max(0, total - yes - 1),
      noAnswer: 1,
      pct: Math.round((yes / total) * 100),
    },
    photosCount: reviews.reduce((acc, r) => acc + (r.media?.length ?? 0), 0),
    uniqueEaters: total,
  };
}

export function mockGetDishPhotos(dishId: string): DishPhotosPage {
  const detail = mockGetDishDetail(dishId);
  const reviews = reviewsForDish(dishId);
  const items = [
    ...(detail?.heroImage
      ? [
          {
            id: `${dishId}-cover`,
            url: detail.heroImage,
            altText: detail.name,
            takenAt: null,
            dishId,
            dishName: detail.name,
            reviewId: null,
            userId: null,
            userHandle: null,
            userDisplayName: null,
            isCover: true,
          },
        ]
      : []),
    ...reviews.flatMap((r) =>
      (r.media ?? []).map((m, j) => ({
        id: `${r.id}-${j}`,
        url: m.url,
        altText: m.alt ?? r.dish.name,
        takenAt: r.createdAt,
        dishId: r.dish.id,
        dishName: r.dish.name,
        reviewId: r.id,
        userId: r.author.id,
        userHandle: r.author.handle ?? null,
        userDisplayName: r.author.displayName,
        isCover: false,
      })),
    ),
  ];
  return { items, nextCursor: null };
}

export function mockGetDishDiaryStats(dishId: string): DishDiaryStats {
  const reviews = reviewsForDish(dishId);
  const eaters = reviews.slice(0, 8).map((r) => ({
    id: r.author.id,
    handle: r.author.handle ?? null,
    displayName: r.author.displayName,
    avatarUrl: r.author.avatarUrl ?? null,
  }));
  return {
    uniqueEaters: reviews.length,
    reviewsTotal: reviews.length,
    reviewsLast7d: Math.max(1, Math.round(reviews.length / 3)),
    recentEaters: eaters,
  };
}

export function mockGetRelatedDishes(dishId: string): RelatedDishItem[] {
  const detail = mockGetDishDetail(dishId);
  if (!detail) return [];
  return [
    {
      id: 'related-1',
      name: detail.name,
      coverImageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=70',
      computedRating: 4.6,
      reviewCount: 48,
      priceTier: '$$',
      restaurantId: 'rest-related-1',
      restaurantSlug: 'la-cantina-del-sur',
      restaurantName: 'La Cantina del Sur',
      restaurantLocation: 'San Telmo, CABA',
      restaurantCity: 'Buenos Aires',
    },
    {
      id: 'related-2',
      name: detail.name,
      coverImageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=70',
      computedRating: 4.2,
      reviewCount: 22,
      priceTier: '$',
      restaurantId: 'rest-related-2',
      restaurantSlug: 'el-rincon',
      restaurantName: 'El Rincón',
      restaurantLocation: 'Caballito, CABA',
      restaurantCity: 'Buenos Aires',
    },
  ];
}
