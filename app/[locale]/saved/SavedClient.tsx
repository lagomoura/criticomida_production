'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookmark,
  faStar,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

import Button from '@/app/components/ui/Button';
import FeedList, { type FeedState } from '@/app/components/feed/FeedList';
import { getMyBookmarks } from '@/app/lib/api/interactions';
import {
  getMyWantToTry,
  removeFromWantToTry,
} from '@/app/lib/api/want-to-try';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { usePostsInteraction } from '@/app/lib/hooks/usePostsInteraction';
import type { WantToTryItem } from '@/app/lib/types/social';

/**
 * "Guardados" lives at ``/saved`` and now hosts BOTH user-saved
 * surfaces in one page:
 *
 * 1. **Quiero probar (top, mosaic)** — dishes the comensal flagged
 *    via the chat or restaurant cards. Square cards, 2 cols on
 *    phone, up to 4 on desktop. Click → dish detail. The X icon on
 *    each card removes the dish from the wishlist (idempotent).
 *
 * 2. **Reseñas guardadas (below, feed)** — review posts the
 *    comensal bookmarked. Same FeedList component the rest of the
 *    app uses, scoped to bookmarks.
 *
 * The two were originally separate pages (``/me/quiero-probar`` +
 * ``/saved``) but users kept landing on ``/saved`` looking for
 * their wishlist and not finding it. Folding both into the same
 * page collapses the cognitive overhead — "everything I saved"
 * really means everything, regardless of which surface saved it.
 */
export default function SavedClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const { posts, setPosts, toggleLike, toggleSave } = usePostsInteraction();
  const t = useTranslations('saved');

  const [postsStatus, setPostsStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [wishlist, setWishlist] = useState<WantToTryItem[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');

  const loadFirst = useCallback(async () => {
    setPostsStatus('loading');
    setWishlistStatus('loading');
    // Two independent reads — fire them in parallel; the page
    // renders each section separately so a slow/failing call on one
    // side doesn't block the other.
    await Promise.all([
      getMyBookmarks()
        .then((page) => {
          setPosts(page.items);
          setNextCursor(page.nextCursor);
          setPostsStatus('ready');
        })
        .catch(() => setPostsStatus('error')),
      getMyWantToTry(null, 60)
        .then((page) => {
          setWishlist(page.items);
          setWishlistStatus('ready');
        })
        .catch(() => setWishlistStatus('error')),
    ]);
  }, [setPosts]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await getMyBookmarks(nextCursor);
      setPosts((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      // surface as inline error below.
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextCursor, setPosts]);

  const onRemoveFromWishlist = useCallback(async (dishId: string) => {
    setWishlist((prev) => prev.filter((w) => w.dishId !== dishId));
    try {
      await removeFromWantToTry(dishId);
    } catch {
      // Best effort — refetch so the state matches the server.
      try {
        const page = await getMyWantToTry(null, 60);
        setWishlist(page.items);
      } catch {
        /* swallow — already showing what we know */
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) void loadFirst();
  }, [authLoading, user, loadFirst]);

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <FontAwesomeIcon icon={faBookmark} className="h-8 w-8 text-text-muted" aria-hidden />
        <h1 className="font-display text-3xl font-medium text-text-primary">
          {t('anonTitle')}
        </h1>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          {t('backToFeed')}
        </Button>
      </div>
    );
  }

  const feedState: FeedState =
    postsStatus === 'loading'
      ? { status: 'loading' }
      : postsStatus === 'error'
        ? {
            status: 'error',
            message: t('loadError'),
            onRetry: () => void loadFirst(),
          }
        : {
            status: 'ready',
            posts,
            hasMore: nextCursor !== null,
            loadingMore,
          };

  return (
    <div className="cc-container flex flex-col gap-8 py-6">
      <header>
        <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-1 font-sans text-sm text-text-muted">
          {t('subtitle')}
        </p>
      </header>

      {/* ── Quiero probar (mosaic) ─────────────────────────────── */}
      <section
        aria-labelledby="want-to-try-heading"
        className="flex flex-col gap-3"
      >
        <header className="flex items-baseline justify-between gap-3">
          <h2
            id="want-to-try-heading"
            className="font-display text-xl text-text-primary"
          >
            {t('wantToTry.heading')}
          </h2>
          {wishlistStatus === 'ready' && wishlist.length > 0 && (
            <span className="text-xs text-text-muted">
              {t('wantToTry.count', { count: wishlist.length })}
            </span>
          )}
        </header>

        {wishlistStatus === 'loading' && (
          <div className="flex h-32 items-center justify-center text-sm text-text-muted">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
          </div>
        )}

        {wishlistStatus === 'error' && (
          <p className="text-sm text-action-danger">
            {t('wantToTry.loadError')}
          </p>
        )}

        {wishlistStatus === 'ready' && wishlist.length === 0 && (
          <p className="text-sm text-text-muted">{t('wantToTry.empty')}</p>
        )}

        {wishlistStatus === 'ready' && wishlist.length > 0 && (
          // Up to 4 dishes the comensal hasn't tried yet → roomy
          // grid (2/3/4 cols) so each tile is comfortable to read.
          // Past that the page would feel front-heavy with the
          // mosaic dominating the viewport, so we densify the grid
          // (3/4/5/6 cols) and tiles get proportionally smaller.
          // The break point is the comensal's expected upper bound
          // for "things I'm actively going to try" — beyond that,
          // the wishlist is more an archive than a to-do list.
          //
          // Both class strings are literal so Tailwind captures
          // them; do not interpolate ``grid-cols-${n}``.
          <ul
            className={
              wishlist.length > 4
                ? 'grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
            }
          >
            {wishlist.map((item) => (
              <WishlistTile
                key={item.dishId}
                item={item}
                onOpen={() => router.push(`/dishes/${item.dishId}`)}
                onRemove={() => void onRemoveFromWishlist(item.dishId)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* ── Reseñas guardadas (feed) ──────────────────────────── */}
      <section
        aria-labelledby="bookmarks-heading"
        className="flex flex-col gap-3"
      >
        <header>
          <h2
            id="bookmarks-heading"
            className="font-display text-xl text-text-primary"
          >
            {t('bookmarks.heading')}
          </h2>
        </header>

        <FeedList
          state={feedState}
          emptyTitle={t('emptyTitle')}
          emptyDescription={t('emptyDescription')}
          emptyAction={{ label: t('emptyAction'), href: '/' }}
          onReachEnd={() => void loadMore()}
          onLoadMoreRetry={() => void loadMore()}
          onOpenPost={(id) => router.push(`/reviews/${id}`)}
          onOpenDish={(id) => router.push(`/dishes/${id}`)}
          onOpenAuthor={(id) => router.push(`/u/${id}`)}
          onOpenRestaurant={(id) => router.push(`/restaurants/${id}`)}
          onComment={(id) => router.push(`/reviews/${id}#comments`)}
          onToggleLike={toggleLike}
          onToggleSave={async (id, next) => {
            await toggleSave(id, next);
            if (!next) {
              setPosts((prev) => prev.filter((p) => p.id !== id));
            }
          }}
        />
      </section>
    </div>
  );
}

interface WishlistTileProps {
  item: WantToTryItem;
  onOpen: () => void;
  onRemove: () => void;
}

/** Square mosaic tile for a single wishlist dish.
 *
 * Click the body → dish detail. Click the small ``×`` overlay →
 * remove from wishlist (idempotent on the server). The remove
 * button is intentionally subtle (corner, low opacity until hover)
 * so the comensal doesn't tap it by accident on a mobile mis-tap. */
function WishlistTile({ item, onOpen, onRemove }: WishlistTileProps) {
  const t = useTranslations('saved');
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col gap-1 overflow-hidden rounded-2xl border border-border-subtle bg-surface-card text-left transition-shadow hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        aria-label={t('wantToTry.openDish', { name: item.dishName })}
      >
        <div className="relative aspect-square w-full bg-surface-subtle">
          {item.coverImageUrl ? (
            <Image
              src={item.coverImageUrl}
              alt={item.dishName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-text-muted">
              {t('wantToTry.noPhoto')}
            </div>
          )}
          {Number.isFinite(item.computedRating) && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-surface-card/90 px-2 py-0.5 text-xs font-medium text-text-primary backdrop-blur-sm">
              <FontAwesomeIcon icon={faStar} className="h-2.5 w-2.5" aria-hidden />
              {item.computedRating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5 px-2.5 py-2">
          <span className="line-clamp-1 font-display text-sm text-text-primary">
            {item.dishName}
          </span>
          <span className="line-clamp-1 text-[11px] text-text-muted">
            {item.restaurantName}
          </span>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={t('wantToTry.remove', { name: item.dishName })}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-card/90 text-text-muted opacity-0 backdrop-blur-sm transition-opacity hover:text-action-danger group-hover:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <FontAwesomeIcon icon={faXmark} className="h-3 w-3" aria-hidden />
      </button>
    </li>
  );
}
