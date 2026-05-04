'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  DishAggregates,
  DishDetail,
  DishDiaryStats,
  DishPhoto,
  DishTimeline,
  RelatedDishItem,
  ReviewPost,
} from '@/app/lib/types/social';
import type { Dish } from '@/app/lib/types';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import DishTabs from './DishTabs';
import DishActionsBar from './DishActionsBar';
import DishDescriptionCard from './DishDescriptionCard';
import EditorialStoryCard from './EditorialStoryCard';
import DishStatsPanel from './DishStatsPanel';
import PillarsSummary from './PillarsSummary';
import TasteProfile from './TasteProfile';
import DishDiaryPulse from './DishDiaryPulse';
import RestaurantContextCard from './RestaurantContextCard';
import RelatedDishesCarousel from './RelatedDishesCarousel';
import DishPhotoMosaic from './DishPhotoMosaic';
import DishReviewsTab from './DishReviewsTab';
import DishEvolutionTimeline from './DishEvolutionTimeline';
import FirstDiscoverersBlock from './FirstDiscoverersBlock';
import PublishReviewModal from '@/app/[locale]/restaurants/[id]/components/PublishReviewModal';

interface DishPageClientProps {
  dish: DishDetail;
  aggregates: DishAggregates;
  photos: DishPhoto[];
  diary: DishDiaryStats;
  related: RelatedDishItem[];
  initialReviews: ReviewPost[];
  initialReviewsCursor: string | null;
  timeline: DishTimeline;
}

export default function DishPageClient({
  dish,
  aggregates,
  photos,
  diary,
  related,
  initialReviews,
  initialReviewsCursor,
  timeline,
}: DishPageClientProps) {
  const { user } = useAuthContext();
  const [showPublish, setShowPublish] = useState(false);

  // Convert DishDetail (camelCase social view-model) → Dish (snake_case API
  // shape) so PublishReviewModal puede preseleccionarlo via initialDish.
  const dishForModal = useMemo<Dish>(
    () => ({
      id: dish.id,
      restaurant_id: dish.restaurantId,
      name: dish.name,
      description: dish.description ?? null,
      cover_image_url: dish.heroImage ?? null,
      price_tier: null,
      computed_rating: dish.averageScore,
      review_count: dish.reviewCount,
      created_by: '',
      created_at: '',
    }),
    [dish],
  );

  // El botón "Escribir reseña" del DishActionsBar dispatchea este evento.
  useEffect(() => {
    if (!user) return;
    function handlePublish() {
      setShowPublish(true);
    }
    window.addEventListener('cc:publish-review', handlePublish);
    return () => window.removeEventListener('cc:publish-review', handlePublish);
  }, [user]);

  return (
    <>
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
              initialWantToTry={dish.wantToTry ?? false}
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
            <PillarsSummary pillars={aggregates.pillars} />
            <DishEvolutionTimeline timeline={timeline} dishName={dish.name} />
            {dish.firstDiscoverers && dish.firstDiscoverers.length > 0 && (
              <FirstDiscoverersBlock
                discoverers={dish.firstDiscoverers}
                dishName={dish.name}
              />
            )}
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

    {user && dish.restaurantSlug && (
      <PublishReviewModal
        show={showPublish}
        restaurantSlug={dish.restaurantSlug}
        existingDishes={[dishForModal]}
        initialDish={dishForModal}
        currencyCode={timeline.currencyCode ?? null}
        onClose={() => setShowPublish(false)}
        onSuccess={() => {
          setShowPublish(false);
          // Re-render con la nueva reseña: lo más simple es recargar la página
          // del plato. Una optimización futura: optimistic update de aggregates.
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />
    )}
    </>
  );
}
