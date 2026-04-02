'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RestaurantListItem, Dish, DishReview, MyReview } from '@/app/lib/types';
import { getRestaurants } from '@/app/lib/api/restaurants';
import { getDishes } from '@/app/lib/api/dishes';
import DishReviewForm from '@/app/restaurants/[id]/components/DishReviewForm';

interface AddReviewModalProps {
  onSuccess: (review: MyReview) => void;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export default function AddReviewModal({ onSuccess, onClose }: AddReviewModalProps) {
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantListItem | null>(null);

  // Step 2 state
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load restaurants on mount and when search changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingRestaurants(true);
      try {
        const result = await getRestaurants({ search: search.trim() || undefined, per_page: 20 });
        setRestaurants(result.items);
      } catch {
        setRestaurants([]);
      } finally {
        setLoadingRestaurants(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Load dishes when restaurant is selected
  useEffect(() => {
    if (!selectedRestaurant) return;
    setLoadingDishes(true);
    getDishes(selectedRestaurant.slug)
      .then(setDishes)
      .catch(() => setDishes([]))
      .finally(() => setLoadingDishes(false));
  }, [selectedRestaurant]);

  function selectRestaurant(r: RestaurantListItem) {
    setSelectedRestaurant(r);
    setSelectedDish(null);
    setDishes([]);
    setStep(2);
  }

  function selectDish(d: Dish) {
    setSelectedDish(d);
    setStep(3);
  }

  function handleReviewSuccess(review: DishReview) {
    onSuccess({
      ...review,
      dish_name: selectedDish!.name,
      restaurant_name: selectedRestaurant!.name,
      restaurant_slug: selectedRestaurant!.slug,
    });
  }

  const stepLabels: Record<Step, string> = {
    1: 'Elegí un restaurante',
    2: 'Elegí un plato',
    3: `Reseña de ${selectedDish?.name ?? ''}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mainPink)]">
              Paso {step} de 3
            </p>
            <h2 className="text-lg font-bold text-neutral-900">{stepLabels[step]}</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-neutral-100">
          <div
            className="h-1 bg-[var(--mainPink)] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Step 1: Restaurant */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <input
                type="search"
                className="form-control w-full"
                placeholder="Buscar restaurante…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {loadingRestaurants ? (
                <div className="flex justify-center py-6">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--mainPink)] border-t-transparent" />
                </div>
              ) : restaurants.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-400">
                  {search ? 'Sin resultados para tu búsqueda.' : 'Cargando restaurantes…'}
                </p>
              ) : (
                <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                  {restaurants.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                        onClick={() => selectRestaurant(r)}
                      >
                        <p className="font-semibold text-neutral-900">{r.name}</p>
                        <p className="text-xs text-neutral-500">{r.location_name}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Step 2: Dish */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-500">
                Restaurante: <span className="font-semibold text-neutral-800">{selectedRestaurant?.name}</span>
              </p>
              {loadingDishes ? (
                <div className="flex justify-center py-6">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--mainPink)] border-t-transparent" />
                </div>
              ) : dishes.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-400">Este restaurante no tiene platos cargados.</p>
              ) : (
                <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                  {dishes.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                        onClick={() => selectDish(d)}
                      >
                        <p className="font-semibold text-neutral-900">{d.name}</p>
                        {d.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{d.description}</p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="btn btn-light btn-sm w-fit"
                onClick={() => setStep(1)}
              >
                ← Cambiar restaurante
              </button>
            </div>
          )}

          {/* Step 3: Review form */}
          {step === 3 && selectedDish && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-500">
                {selectedRestaurant?.name} · <span className="font-semibold text-neutral-800">{selectedDish.name}</span>
              </p>
              <DishReviewForm
                dishId={selectedDish.id}
                onSuccess={handleReviewSuccess}
                onCancel={() => setStep(2)}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
