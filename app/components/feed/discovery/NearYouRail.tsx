'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { discoverDishes } from '@/app/lib/api/discovery';
import {
  addToWantToTry,
  removeFromWantToTry,
} from '@/app/lib/api/want-to-try';
import { useToast } from '@/app/components/ui/Toast';
import type { DiscoveryDishItem } from '@/app/lib/types/social';
import Rail from './Rail';
import HorizontalScroll from './HorizontalScroll';
import DishDiscoveryCard from './DishDiscoveryCard';

interface NearYouRailProps {
  lat: number;
  lng: number;
  radiusKm?: number;
  /** Solo se pasa cuando hay viewer logueado. */
  enableWishlist: boolean;
}

/**
 * 'Cerca tuyo' — platos rankeados por un score compuesto que combina cercanía
 * (escalonado, máximo dentro de 5 km), ejecución técnica de los pilares
 * (peso más alto) y recencia de las reseñas. Si el endpoint devuelve 0
 * resultados, el rail no se renderiza.
 */
export default function NearYouRail({
  lat,
  lng,
  radiusKm = 15,
  enableWishlist,
}: NearYouRailProps) {
  const toast = useToast();
  const t = useTranslations('discovery.nearYou');
  const tErr = useTranslations('discovery.wishlistError');
  const [items, setItems] = useState<DiscoveryDishItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(false);
    discoverDishes({
      lat,
      lng,
      radiusKm,
      sort: 'nearby_smart',
      limit: 8,
    })
      .then((page) => {
        if (!cancelled) setItems(page.items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, radiusKm]);

  const handleToggleWantToTry = useCallback(
    async (dishId: string, next: boolean) => {
      setItems((prev) =>
        prev?.map((it) =>
          it.dishId === dishId ? { ...it, wantToTry: next } : it,
        ) ?? prev,
      );
      try {
        if (next) await addToWantToTry(dishId);
        else await removeFromWantToTry(dishId);
      } catch {
        setItems((prev) =>
          prev?.map((it) =>
            it.dishId === dishId ? { ...it, wantToTry: !next } : it,
          ) ?? prev,
        );
        toast.error(
          next ? tErr('addFailed') : tErr('removeFailed'),
          tErr('tryAgain'),
        );
      }
    },
    [toast, tErr],
  );

  if (error) return null;
  if (items !== null && items.length === 0) return null;

  return (
    <Rail
      kicker={t('kicker')}
      title={t('title')}
      subtitle={t('subtitle', { km: radiusKm })}
    >
      {items === null ? (
        <RailSkeleton />
      ) : (
        <HorizontalScroll>
          {items.map((dish) => (
            <DishDiscoveryCard
              key={dish.dishId}
              dish={dish}
              onToggleWantToTry={
                enableWishlist ? handleToggleWantToTry : undefined
              }
            />
          ))}
        </HorizontalScroll>
      )}
    </Rail>
  );
}

function RailSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden" aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-72 w-72 shrink-0 animate-pulse rounded-2xl border border-border-subtle bg-surface-card"
        />
      ))}
    </div>
  );
}
