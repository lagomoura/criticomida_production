'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getDishDuel } from '@/app/lib/api/discovery';
import { getCategories } from '@/app/lib/api/categories';
import {
  addToWantToTry,
  removeFromWantToTry,
} from '@/app/lib/api/want-to-try';
import { useToast } from '@/app/components/ui/Toast';
import type { DiscoveryDishItem } from '@/app/lib/types/social';
import Rail from './Rail';
import DishDiscoveryCard from './DishDiscoveryCard';

interface DishDuelRailProps {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  enableWishlist: boolean;
}

interface CategoryOption {
  slug: string;
  name: string;
}

/**
 * Duelo de Platos — top 2 platos de una categoría rankeados por costo/beneficio.
 * El usuario puede cambiar la categoría desde un selector simple. Por default
 * intentamos categorías populares hasta encontrar una que tenga >= 2 platos.
 */
export default function DishDuelRail({
  lat,
  lng,
  radiusKm,
  enableWishlist,
}: DishDuelRailProps) {
  const toast = useToast();
  const t = useTranslations('discovery.duel');
  const tErr = useTranslations('discovery.wishlistError');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [items, setItems] = useState<DiscoveryDishItem[] | null>(null);
  const [error, setError] = useState(false);

  // Cargar categorías una vez.
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        const opts = cats.map((c) => ({ slug: c.slug, name: c.name }));
        setCategories(opts);
        if (opts.length > 0 && activeCategory === null) {
          setActiveCategory(opts[0].slug);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
    // No queremos re-disparar al cambiar activeCategory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar el duelo cada vez que cambia la categoría o las coords.
  useEffect(() => {
    if (!activeCategory) return;
    let cancelled = false;
    setItems(null);
    setError(false);
    getDishDuel({
      category: activeCategory,
      lat,
      lng,
      radiusKm,
    })
      .then((duel) => {
        if (!cancelled) setItems(duel.items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory, lat, lng, radiusKm]);

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
  if (items !== null && items.length < 2) return null;

  return (
    <Rail
      kicker={t('kicker')}
      title={t('title')}
      subtitle={t('subtitle')}
      action={
        categories.length > 0 ? (
          <select
            aria-label={t('categoryLabel')}
            value={activeCategory ?? ''}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="min-h-[44px] rounded-full border border-border-default bg-surface-card px-3 py-2.5 font-sans text-xs text-text-primary"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        ) : null
      }
    >
      {items === null ? (
        <DuelSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((dish, idx) => (
            <div key={dish.dishId} className="relative">
              {idx === 0 && (
                <span className="absolute -top-2 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-dorado)] px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wider text-text-inverse shadow">
                  {t('winner')}
                </span>
              )}
              <DishDiscoveryCard
                dish={dish}
                onToggleWantToTry={
                  enableWishlist ? handleToggleWantToTry : undefined
                }
              />
            </div>
          ))}
        </div>
      )}
    </Rail>
  );
}

function DuelSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-busy="true">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-2xl border border-border-subtle bg-surface-card"
        />
      ))}
    </div>
  );
}
