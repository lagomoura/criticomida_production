'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

interface DishActionsBarProps {
  dishId: string;
  dishName: string;
  restaurantSlug?: string | null;
  restaurantId: string;
}

export default function DishActionsBar({
  dishId,
  dishName,
  restaurantSlug,
  restaurantId,
}: DishActionsBarProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const handleWriteReview = useCallback(() => {
    if (user) {
      router.push(`/compose?dish=${encodeURIComponent(dishId)}`);
    } else {
      router.push('/');
    }
  }, [router, user, dishId]);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const payload: ShareData = { title: dishName, url };
    try {
      const nav = window.navigator as Navigator & {
        share?: (d: ShareData) => Promise<void>;
      };
      if (typeof nav.share === 'function') {
        await nav.share(payload);
        return;
      }
      if (nav.clipboard?.writeText) {
        await nav.clipboard.writeText(url);
      }
    } catch {
      /* user dismissed share — no-op */
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [dishName]);

  const restaurantHref = restaurantSlug
    ? `/restaurants/${encodeURIComponent(restaurantSlug)}`
    : `/restaurants/${restaurantId}`;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-3 shadow-sm">
      <button
        type="button"
        onClick={handleWriteReview}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-azafran)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-canela)]"
      >
        ✎ Escribir reseña
      </button>
      <button
        type="button"
        onClick={() => setSaved((v) => !v)}
        aria-pressed={saved}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
          saved
            ? 'border-[var(--color-azafran)] bg-[var(--color-azafran-pale)] text-[var(--color-canela)]'
            : 'border-[var(--color-crema-darker)] bg-white text-[var(--color-carbon)] hover:border-[var(--color-azafran)]'
        }`}
      >
        {saved ? '★ Guardado' : '☆ Guardar'}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-crema-darker)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-carbon)] transition hover:border-[var(--color-azafran)]"
      >
        {shared ? '✓ Copiado' : '↗ Compartir'}
      </button>
      <a
        href={restaurantHref}
        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--color-crema-darker)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-carbon)] no-underline transition hover:border-[var(--color-azafran)]"
      >
        Ver el restaurante →
      </a>
    </div>
  );
}
