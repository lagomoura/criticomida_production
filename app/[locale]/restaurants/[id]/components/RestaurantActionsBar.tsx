'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import type { ReservationProvider } from '@/app/lib/types/restaurant';
import ReservationCTA from './ReservationCTA';

interface RestaurantActionsBarProps {
  restaurantSlug: string;
  restaurantName: string;
  googleMapsUrl: string | null;
  reservationUrl?: string | null;
  reservationProvider?: ReservationProvider | null;
}

export default function RestaurantActionsBar({
  restaurantSlug,
  restaurantName,
  googleMapsUrl,
  reservationUrl,
  reservationProvider,
}: RestaurantActionsBarProps) {
  const t = useTranslations('restaurant.actions');
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  async function handleShare() {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/restaurants/${restaurantSlug}`
      : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: restaurantName, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  }

  function handleSave() {
    setSaved((s) => !s);
  }

  function dispatchAddDish() {
    window.dispatchEvent(new CustomEvent('cc:add-dish'));
  }

  function dispatchPublishReview() {
    window.dispatchEvent(new CustomEvent('cc:publish-review'));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] px-3 py-2 shadow-sm sm:gap-3 sm:px-4">
      {reservationUrl && (
        <ReservationCTA
          slug={restaurantSlug}
          reservationUrl={reservationUrl}
          reservationProvider={reservationProvider ?? null}
        />
      )}
      <button
        type="button"
        onClick={dispatchPublishReview}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-azafran)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-canela)]"
      >
        <span aria-hidden>★</span>
        {t('publishReview')}
      </button>
      <button
        type="button"
        onClick={dispatchAddDish}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-azafran)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-azafran)] transition hover:bg-[var(--color-azafran-pale)]"
      >
        <span aria-hidden>＋</span>
        {t('addDish')}
      </button>
      <button
        type="button"
        onClick={handleSave}
        aria-pressed={saved}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
          saved
            ? 'bg-[var(--color-azafran-pale)] text-[var(--color-canela)]'
            : 'border border-[var(--color-crema-darker)] bg-white text-[var(--color-carbon)] hover:bg-[var(--color-crema)]'
        }`}
      >
        <span aria-hidden>{saved ? '★' : '☆'}</span>
        {saved ? t('saved') : t('save')}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-crema-darker)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-carbon)] transition hover:bg-[var(--color-crema)]"
      >
        <span aria-hidden>↗</span>
        {shared ? t('copied') : t('share')}
      </button>
      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[var(--color-canela)] no-underline transition hover:underline"
        >
          {t('viewOnGoogleMaps')}
          <span aria-hidden>↗</span>
        </a>
      )}
    </div>
  );
}
