'use client';

import { useState } from 'react';
import { Dish, DishReview, RestaurantDetail } from '@/app/lib/types';
import type {
  RestaurantAggregates,
  RestaurantPhoto,
  DiaryStats,
  SignatureDish,
  NearbyRestaurantItem,
} from '@/app/lib/types/restaurant';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import RestaurantTabs from './RestaurantTabs';
import RatingsRadar from './RatingsRadar';
import ProsConsAggregated from './ProsConsAggregated';
import SignatureDishes from './SignatureDishes';
import DiaryPulse from './DiaryPulse';
import InfoPanel from './InfoPanel';
import PhotoMosaic from './PhotoMosaic';
import EditorialSummaryCard from './EditorialSummaryCard';
import NearbyRestaurantsCarousel from './NearbyRestaurantsCarousel';
import DishChecklist from './DishChecklist';
import TopReviewsGrid from './TopReviewsGrid';
import RestaurantRatingSection from './RestaurantRatingSection';
import LocationMap from './LocationMap';
import AddDishModal from './AddDishModal';

interface DishWithReviews {
  dish: Dish;
  reviews: DishReview[];
}

interface RestaurantPageClientProps {
  restaurant: RestaurantDetail;
  initialDishes: DishWithReviews[];
  aggregates: RestaurantAggregates;
  photos: RestaurantPhoto[];
  photosTotal: number;
  diaryStats: DiaryStats;
  signatureDishes: SignatureDish[];
  nearby: NearbyRestaurantItem[];
}

export default function RestaurantPageClient({
  restaurant,
  initialDishes,
  aggregates,
  photos,
  photosTotal,
  diaryStats,
  signatureDishes,
  nearby,
}: RestaurantPageClientProps) {
  const { user } = useAuthContext();
  const [dishItems, setDishItems] = useState<DishWithReviews[]>(initialDishes);
  const [showAddDish, setShowAddDish] = useState(false);

  function handleReviewAdded(dishId: string, review: DishReview) {
    setDishItems((prev) =>
      prev.map(({ dish, reviews }) =>
        dish.id === dishId
          ? {
              dish: {
                ...dish,
                review_count: dish.review_count + 1,
                computed_rating:
                  dish.review_count === 0
                    ? review.rating
                    : parseFloat(
                        (
                          (Number(dish.computed_rating) * dish.review_count + review.rating) /
                          (dish.review_count + 1)
                        ).toFixed(2),
                      ),
              },
              reviews: [...reviews, review],
            }
          : { dish, reviews },
      ),
    );
  }

  function handleDishCreated(dish: Dish, review?: DishReview) {
    setDishItems((prev) => [...prev, { dish, reviews: review ? [review] : [] }]);
    setShowAddDish(false);
  }

  const tabCounts = {
    platos: dishItems.length,
    fotos: photosTotal + (restaurant.google_photos?.length ?? 0),
  };

  return (
    <>
      <RestaurantTabs
        counts={tabCounts}
      >
        {{
          resumen: (
            <>
              <EditorialSummaryCard
                summary={restaurant.editorial_summary}
                lang={restaurant.editorial_summary_lang}
              />
              <RatingsRadar aggregates={aggregates} />
              <ProsConsAggregated aggregates={aggregates} />
              {signatureDishes.length > 0 && (
                <SignatureDishes
                  items={signatureDishes}
                  totalDishes={aggregates.dishes_count}
                />
              )}
              <DiaryPulse stats={diaryStats} />
              <NearbyRestaurantsCarousel items={nearby} />
              <RestaurantRatingSection
                restaurantSlug={restaurant.slug}
                currentUserId={user?.id ?? null}
              />
            </>
          ),
          platos: (
            <div id="platos">
              <DishChecklist
                items={dishItems}
                currentUserId={user?.id ?? null}
                onReviewAdded={handleReviewAdded}
                onAddDish={() => setShowAddDish(true)}
              />
            </div>
          ),
          resenas: (
            <div id="resenas">
              {dishItems.length > 0 ? (
                <TopReviewsGrid items={dishItems} />
              ) : (
                <section className="rounded-3xl border border-dashed border-[var(--color-crema-darker)] bg-[var(--color-white)] p-10 text-center text-sm italic text-[var(--color-carbon-soft)]">
                  Aún no hay reseñas. ¡Sé el primero en contar tu experiencia!
                </section>
              )}
            </div>
          ),
          fotos: (
            <PhotoMosaic
              photos={photos}
              totalCount={photosTotal}
              googlePhotos={restaurant.google_photos}
            />
          ),
          info: (
            <>
              <InfoPanel restaurant={restaurant} />
              <LocationMap
                location={restaurant.location_name}
                latitude={restaurant.latitude}
                longitude={restaurant.longitude}
              />
            </>
          ),
        }}
      </RestaurantTabs>

      {user && (
        <AddDishModal
          show={showAddDish}
          restaurantSlug={restaurant.slug}
          onClose={() => setShowAddDish(false)}
          onDishCreated={handleDishCreated}
        />
      )}
    </>
  );
}
