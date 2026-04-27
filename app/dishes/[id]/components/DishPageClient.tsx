'use client';

import type {
  DishAggregates,
  DishDetail,
  DishDiaryStats,
  DishPhoto,
  RelatedDishItem,
  ReviewPost,
} from '@/app/lib/types/social';
import DishTabs from './DishTabs';
import DishActionsBar from './DishActionsBar';
import DishDescriptionCard from './DishDescriptionCard';
import EditorialStoryCard from './EditorialStoryCard';
import DishStatsPanel from './DishStatsPanel';
import TasteProfile from './TasteProfile';
import DishDiaryPulse from './DishDiaryPulse';
import RestaurantContextCard from './RestaurantContextCard';
import RelatedDishesCarousel from './RelatedDishesCarousel';
import DishPhotoMosaic from './DishPhotoMosaic';
import DishReviewsTab from './DishReviewsTab';

interface DishPageClientProps {
  dish: DishDetail;
  aggregates: DishAggregates;
  photos: DishPhoto[];
  diary: DishDiaryStats;
  related: RelatedDishItem[];
  initialReviews: ReviewPost[];
  initialReviewsCursor: string | null;
}

export default function DishPageClient({
  dish,
  aggregates,
  photos,
  diary,
  related,
  initialReviews,
  initialReviewsCursor,
}: DishPageClientProps) {
  return (
    <DishTabs
      counts={{
        resenas: dish.reviewCount,
        fotos: aggregates.photosCount,
      }}
    >
      {{
        resumen: (
          <div className="space-y-8">
            <DishActionsBar
              dishId={dish.id}
              dishName={dish.name}
              restaurantSlug={dish.restaurantSlug}
              restaurantId={dish.restaurantId}
            />
            {dish.description ? (
              <DishDescriptionCard description={dish.description} />
            ) : null}
            {dish.editorialBlurb ? (
              <EditorialStoryCard
                blurb={dish.editorialBlurb}
                source={dish.editorialSource}
                dishName={dish.name}
                restaurantName={dish.restaurantName}
              />
            ) : null}
            <DishStatsPanel
              aggregates={aggregates}
              averageScore={dish.averageScore}
              reviewCount={dish.reviewCount}
            />
            <TasteProfile aggregates={aggregates} />
            <DishDiaryPulse diary={diary} dishName={dish.name} />
            <RestaurantContextCard dish={dish} />
            <RelatedDishesCarousel dishName={dish.name} items={related} />
          </div>
        ),
        resenas: (
          <DishReviewsTab
            dishId={dish.id}
            initialReviews={initialReviews}
            initialCursor={initialReviewsCursor}
          />
        ),
        fotos: <DishPhotoMosaic photos={photos} />,
        restaurante: (
          <div className="space-y-8">
            <RestaurantContextCard dish={dish} />
            <RelatedDishesCarousel dishName={dish.name} items={related} />
          </div>
        ),
      }}
    </DishTabs>
  );
}
