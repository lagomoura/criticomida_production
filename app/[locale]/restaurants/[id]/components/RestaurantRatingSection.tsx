'use client';

import React, { useEffect, useState } from 'react';
import { RatingDimensionKey, RestaurantRatingsResponse } from '@/app/lib/types';
import { getRestaurantRatings, setRestaurantRatings } from '@/app/lib/api/ratings';
import { ApiError } from '@/app/lib/api/client';
import StarRating from './StarRating';

const DIMENSION_LABELS: Record<RatingDimensionKey, string> = {
  cleanliness: 'Limpieza',
  ambiance: 'Ambiente',
  service: 'Servicio',
  value: 'Precio/calidad',
  food_quality: 'Calidad de comida',
};

const ALL_DIMENSIONS: RatingDimensionKey[] = [
  'cleanliness',
  'ambiance',
  'service',
  'value',
  'food_quality',
];

interface RestaurantRatingSectionProps {
  restaurantSlug: string;
  currentUserId: string | null;
}

export default function RestaurantRatingSection({
  restaurantSlug,
  currentUserId,
}: RestaurantRatingSectionProps) {
  const [ratingsData, setRatingsData] = useState<RestaurantRatingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // User's editable ratings (1-5 per dimension, 0 = unset)
  const [userRatings, setUserRatings] = useState<Record<RatingDimensionKey, number>>(
    () => Object.fromEntries(ALL_DIMENSIONS.map((d) => [d, 0])) as Record<RatingDimensionKey, number>
  );

  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getRestaurantRatings(restaurantSlug)
      .then((data) => {
        setRatingsData(data);
        // Pre-fill user's existing ratings
        if (currentUserId && data.user_breakdown[currentUserId]) {
          const existing = data.user_breakdown[currentUserId];
          setUserRatings((prev) => {
            const next = { ...prev };
            for (const entry of existing) {
              next[entry.dimension] = Math.round(entry.score);
            }
            return next;
          });
        }
      })
      .catch(() => setRatingsData(null))
      .finally(() => setLoading(false));
  }, [restaurantSlug, currentUserId]);

  async function handleSave() {
    const toSave = ALL_DIMENSIONS.filter((d) => userRatings[d] > 0).map((d) => ({
      dimension: d,
      score: userRatings[d],
    }));
    if (toSave.length === 0) return;

    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await setRestaurantRatings(restaurantSlug, toSave);
      // Refresh averages
      const updated = await getRestaurantRatings(restaurantSlug);
      setRatingsData(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'No se pudo guardar la valoración.');
    } finally {
      setSubmitting(false);
    }
  }

  const hasAverages = ratingsData && Object.keys(ratingsData.averages).length > 0;
  const hasUserRatings = ALL_DIMENSIONS.some((d) => userRatings[d] > 0);

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-xl font-bold text-neutral-900">Valoraciones del establecimiento</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[var(--mainPink)] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Averages panel */}
          <div className="cc-card rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Promedio general
            </h3>
            {!hasAverages ? (
              <p className="text-sm text-neutral-400">Todavía no hay valoraciones para este restaurante.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {ALL_DIMENSIONS.map((dim) => {
                  const avg = ratingsData?.averages[dim];
                  if (avg === undefined) return null;
                  const pct = (avg / 5) * 100;
                  return (
                    <li key={dim} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-sm font-medium text-neutral-700">
                        {DIMENSION_LABELS[dim]}
                      </span>
                      <div className="flex-1 overflow-hidden rounded-full bg-neutral-100 h-2">
                        <div
                          className="h-2 rounded-full bg-[var(--mainPink)] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm font-semibold text-neutral-700">
                        {avg.toFixed(1)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* User rating form */}
          <div className="cc-card rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Tu valoración
            </h3>

            {!currentUserId ? (
              <p className="text-sm text-neutral-400">
                Logueate para valorar el establecimiento.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                <ul className="flex flex-col gap-3 mb-4">
                  {ALL_DIMENSIONS.map((dim) => (
                    <li key={dim} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-sm font-medium text-neutral-700">
                        {DIMENSION_LABELS[dim]}
                      </span>
                      <StarRating
                        value={userRatings[dim]}
                        onChange={(v) => setUserRatings((prev) => ({ ...prev, [dim]: v }))}
                        size="sm"
                      />
                    </li>
                  ))}
                </ul>

                {error && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  className="btn btn-primary btn-sm w-fit"
                  onClick={handleSave}
                  disabled={submitting || !hasUserRatings}
                >
                  {submitting ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar valoración'}
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </section>
  );
}
