'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@/app/lib/i18n/navigation';
import { getMyWantToTry } from '@/app/lib/api/want-to-try';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

interface SavedHereBannerProps {
  restaurantId: string;
}

/**
 * Closes the wishlist loop from the other end: a diner who already
 * flagged dishes here lands on the venue page with no reminder of
 * their own intent. This strip surfaces "you saved N dishes here"
 * and routes back to /saved so the saved dish doesn't rot.
 *
 * Data: we reuse the existing paginated wishlist endpoint with a
 * high limit and filter client-side by ``restaurantId``. This is a
 * non-critical nudge — not a source of truth — so a power-user with
 * a wishlist past the cap simply doesn't see the strip rather than
 * us adding a dedicated count-by-restaurant endpoint. Renders
 * nothing for anon users or a zero count (no empty-state noise).
 */
export default function SavedHereBanner({
  restaurantId,
}: SavedHereBannerProps) {
  const { user } = useAuthContext();
  const t = useTranslations('restaurant.savedHere');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setCount(null);
      return;
    }
    let cancelled = false;
    getMyWantToTry(null, 100)
      .then((page) => {
        if (cancelled) return;
        setCount(
          page.items.filter((it) => it.restaurantId === restaurantId).length,
        );
      })
      .catch(() => {
        /* silent — the strip is a nudge, not load-bearing */
      });
    return () => {
      cancelled = true;
    };
  }, [user, restaurantId]);

  if (!user || !count) return null;

  return (
    <Link
      href="/saved"
      className="mb-4 flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-card px-4 py-3 transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action-primary/10 text-action-primary">
        <FontAwesomeIcon icon={faBookmark} className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 font-sans text-sm text-text-primary">
        {t('label', { count })}
      </span>
      <FontAwesomeIcon
        icon={faArrowRight}
        className="h-3.5 w-3.5 shrink-0 text-text-muted"
        aria-hidden
      />
    </Link>
  );
}
