'use client';

import { useCallback, useState } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { useToast } from '@/app/components/ui/Toast';
import { addToWantToTry, removeFromWantToTry } from '@/app/lib/api/want-to-try';

interface DishActionsBarProps {
  dishId: string;
  dishName: string;
  restaurantSlug?: string | null;
  restaurantId: string;
  initialWantToTry?: boolean;
}

export default function DishActionsBar({
  dishId,
  dishName,
  restaurantSlug,
  restaurantId,
  initialWantToTry = false,
}: DishActionsBarProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const toast = useToast();
  const t = useTranslations('dish.actionsBar');
  const [wantToTry, setWantToTry] = useState(initialWantToTry);
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);

  const handleWriteReview = useCallback(() => {
    if (!user) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }
    // El plato y el restaurante ya los conocemos: abrimos el modal de
    // PublishReview pre-seleccionado en vez de mandar a /compose (que está
    // pensado para el caso "no sé qué plato" con Google Places autocomplete).
    window.dispatchEvent(new CustomEvent('cc:publish-review'));
  }, [router, user]);

  const handleToggleWantToTry = useCallback(async () => {
    if (!user) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (busy) return;
    const next = !wantToTry;
    setWantToTry(next);
    setBusy(true);
    try {
      if (next) await addToWantToTry(dishId);
      else await removeFromWantToTry(dishId);
    } catch {
      setWantToTry(!next);
      toast.error(
        next ? t('addError') : t('removeError'),
        t('tryAgain'),
      );
    } finally {
      setBusy(false);
    }
  }, [busy, dishId, router, toast, t, user, wantToTry]);

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
    <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] p-3 shadow-sm">
      <button
        type="button"
        onClick={handleWriteReview}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-terracota)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-terracota-deep)]"
      >
        {t('writeReview')}
      </button>
      <button
        type="button"
        onClick={handleToggleWantToTry}
        aria-pressed={wantToTry}
        aria-busy={busy || undefined}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
          wantToTry
            ? 'border-[var(--color-terracota)] bg-[var(--color-terracota-pale)] text-[var(--color-terracota-deep)]'
            : 'border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] text-[var(--color-espresso)] hover:border-[var(--color-terracota)]'
        }`}
      >
        {wantToTry ? t('addedToList') : t('wantToTry')}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-espresso)] transition hover:border-[var(--color-terracota)]"
      >
        {shared ? t('copied') : t('share')}
      </button>
      <a
        href={restaurantHref}
        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-espresso)] no-underline transition hover:border-[var(--color-terracota)]"
      >
        {t('viewRestaurant')}
      </a>
    </div>
  );
}
