"use client";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Dish, DishReview } from '@/app/lib/types';
import {
  LocationMap,
  DishChecklist,
  AddDishModal,
  RestaurantHero,
  RestaurantRatingSection,
  TopReviewsGrid,
} from './components';
import { getRestaurant } from '@/app/lib/api/restaurants';
import { getDishes } from '@/app/lib/api/dishes';
import { getReviews } from '@/app/lib/api/reviews';
import { RestaurantDetail } from '@/app/lib/types';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

// ----- Types -----

interface DishWithReviews {
  dish: Dish;
  reviews: DishReview[];
}

// ----- Loading / not found states -----

function LoadingState() {
  return (
    <main id="main-content" className="cc-container py-8">
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[var(--mainPink)]"
          role="status"
          aria-label="Cargando"
        />
        <p className="text-neutral-500">Cargando restaurante…</p>
      </div>
    </main>
  );
}

function NotFoundState() {
  return (
    <main id="main-content" className="cc-container py-8">
      <div className="py-16 text-center">
        <p className="text-5xl" aria-hidden>🍽️</p>
        <h2 className="mt-3 text-2xl font-bold text-neutral-800">Restaurante no encontrado</h2>
        <p className="mt-1 text-neutral-500">
          No se encontró información para este restaurante.
        </p>
        <Link href="/" className="btn btn-primary mt-5 inline-block">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

// ----- Main page component -----

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthContext();

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [dishItems, setDishItems] = useState<DishWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);


  // Add dish modal
  const [showAddDish, setShowAddDish] = useState(false);

  // Fetch restaurant + dishes + reviews
  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const [restaurantData, dishesData] = await Promise.all([
          getRestaurant(id),
          getDishes(id).catch(() => [] as Dish[]),
        ]);
        setRestaurant(restaurantData);

        const dishesWithReviews = await Promise.all(
          dishesData.map(async (dish) => {
            try {
              const reviews = await getReviews(dish.id);
              return { dish, reviews };
            } catch {
              return { dish, reviews: [] as DishReview[] };
            }
          })
        );

        setDishItems(dishesWithReviews);

      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);


  // Called when a new review is submitted for a dish
  function handleReviewAdded(dishId: string, review: DishReview) {
    setDishItems((prev) =>
      prev.map(({ dish, reviews }) =>
        dish.id === dishId
          ? {
              dish: {
                ...dish,
                review_count: dish.review_count + 1,
                // Recompute locally: average of existing + new rating
                computed_rating:
                  dish.review_count === 0
                    ? review.rating
                    : parseFloat(
                        (
                          (Number(dish.computed_rating) * dish.review_count + review.rating) /
                          (dish.review_count + 1)
                        ).toFixed(2)
                      ),
              },
              reviews: [...reviews, review],
            }
          : { dish, reviews }
      )
    );
  }

  // Called when a new dish is created via the modal (review is optional)
  function handleDishCreated(dish: Dish, review?: DishReview) {
    setDishItems((prev) => [...prev, { dish, reviews: review ? [review] : [] }]);
    setShowAddDish(false);
  }

  if (loading) return <LoadingState />;
  if (notFound || !restaurant) return <NotFoundState />;

  const categorySlug = restaurant.category?.slug ?? '';
  const categoryLabel = restaurant.category?.name ?? 'inicio';
  const backHref = categorySlug ? `/reviews/${categorySlug}` : '/';
  const backLabel = categoryLabel;

  return (
    <main id="main-content" className="cc-container py-6 sm:py-8">
      {/* Restaurant hero: cover image, name, rating, location */}
      <RestaurantHero
        restaurant={restaurant}
        dishCount={dishItems.length}
        backHref={backHref}
        backLabel={backLabel}
      />

      {/* PRIMARY FEATURE: dish checklist */}
      <DishChecklist
        items={dishItems}
        currentUserId={user?.id ?? null}
        onReviewAdded={handleReviewAdded}
        onAddDish={() => setShowAddDish(true)}
      />

      {/* Restaurant-level dimension ratings */}
      <RestaurantRatingSection
        restaurantSlug={id}
        currentUserId={user?.id ?? null}
      />

      {/* Location */}
      <LocationMap
        location={restaurant.location_name}
        latitude={restaurant.latitude}
        longitude={restaurant.longitude}
      />

      {/* Top reviews showcase */}
      <TopReviewsGrid items={dishItems} />

      {/* Add dish modal — only shown to authenticated users */}
      {user && (
        <AddDishModal
          show={showAddDish}
          restaurantSlug={id}
          onClose={() => setShowAddDish(false)}
          onDishCreated={handleDishCreated}
        />
      )}
    </main>
  );
}
