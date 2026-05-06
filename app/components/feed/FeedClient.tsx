'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import Tabs from '@/app/components/ui/Tabs';
import FeedList, { type FeedState } from './FeedList';
import FeedWelcome from './FeedWelcome';
import DiscoveryRails from './discovery/DiscoveryRails';
import MapDiscoveryView from './discovery/MapDiscoveryView';
import { getFeed } from '@/app/lib/api/feed';
import { getUserProfile } from '@/app/lib/api/users';
import { likePost, unlikePost, savePost, unsavePost } from '@/app/lib/api/interactions';
import { addToWantToTry, removeFromWantToTry } from '@/app/lib/api/want-to-try';
import { useToast } from '@/app/components/ui/Toast';
import { PostCardSkeleton } from '@/app/components/ui/SkeletonPresets';
import ReportModal from '@/app/components/social/ReportModal';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { cn } from '@/app/lib/utils/cn';
import type { FeedSort, FeedType, ReviewPost } from '@/app/lib/types/social';

/**
 * Slot-scoped state. Cada combinación (tab, sort) tiene su propio slot para
 * que alternar entre Recientes/Mejor puntuadas no pierda scroll ni páginas
 * ya bajadas.
 */
interface TabSlot {
  state: FeedState;
  nextCursor: string | null;
}

type SlotKey = 'for_you' | 'following:recent' | 'following:top';

type SlotCache = Record<SlotKey, TabSlot>;

const INITIAL_SLOT: TabSlot = {
  state: { status: 'loading' },
  nextCursor: null,
};

const INITIAL_CACHE: SlotCache = {
  for_you: INITIAL_SLOT,
  'following:recent': INITIAL_SLOT,
  'following:top': INITIAL_SLOT,
};

const PAGE_SIZE = 10;

type FeedTabValue = FeedType | 'map';

function slotKeyFor(type: FeedType, sort: FeedSort): SlotKey {
  if (type === 'for_you') return 'for_you';
  return sort === 'top' ? 'following:top' : 'following:recent';
}

export default function FeedClient() {
  const [activeTab, setActiveTab] = useState<FeedTabValue>('for_you');
  const [followingSort, setFollowingSort] = useState<FeedSort>('recent');
  const [cache, setCache] = useState<SlotCache>(INITIAL_CACHE);
  const [reportTarget, setReportTarget] = useState<{ id: string; subject: string } | null>(null);
  // Tracks which slots we've already fired loadFirstPage for. Lets us trigger
  // load on tab/sort switch without keeping `cache` in the effect deps —
  // depending on `cache` would loop because loadFirstPage immediately writes
  // to cache while the slot is still in 'loading' state.
  const startedSlotsRef = useRef<Set<SlotKey>>(new Set());
  // Hasta que esto sea true mostramos esqueleto en vez del contenido del tab,
  // así evitamos el flicker entre el default 'for_you' y el switch a
  // 'following' una vez que sabemos que el usuario sigue a alguien. El ref
  // espeja el estado para chequeos sincrónicos dentro de promesas en vuelo.
  const tabResolvedRef = useRef(false);
  const [tabResolved, setTabResolved] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const t = useTranslations('feed');
  const tErrs = useTranslations('feed.actionErrors');
  const tEmpty = useTranslations('feed.followingEmpty');

  const loadFirstPage = useCallback(async (type: FeedType, sort: FeedSort) => {
    const key = slotKeyFor(type, sort);
    setCache((prev) => ({
      ...prev,
      [key]: { state: { status: 'loading' }, nextCursor: null },
    }));
    try {
      const page = await getFeed({ type, sort, limit: PAGE_SIZE });
      setCache((prev) => ({
        ...prev,
        [key]: {
          state: {
            status: 'ready',
            posts: page.items,
            hasMore: page.nextCursor !== null,
            loadingMore: false,
          },
          nextCursor: page.nextCursor,
        },
      }));
    } catch {
      setCache((prev) => ({
        ...prev,
        [key]: {
          state: {
            status: 'error',
            message: t('loadError'),
            onRetry: () => void loadFirstPage(type, sort),
          },
          nextCursor: null,
        },
      }));
    }
  }, [t]);

  const loadNextPage = useCallback(
    async (type: FeedType, sort: FeedSort) => {
      const key = slotKeyFor(type, sort);
      const slot = cache[key];
      if (slot.state.status !== 'ready') return;
      if (!slot.state.hasMore) return;
      if (slot.state.loadingMore) return;
      if (!slot.nextCursor) return;

      const currentCursor = slot.nextCursor;

      setCache((prev) => {
        const current = prev[key];
        if (current.state.status !== 'ready') return prev;
        return {
          ...prev,
          [key]: {
            ...current,
            state: { ...current.state, loadingMore: true, loadMoreError: undefined },
          },
        };
      });

      try {
        const page = await getFeed({
          type,
          sort,
          cursor: currentCursor,
          limit: PAGE_SIZE,
        });
        setCache((prev) => {
          const current = prev[key];
          if (current.state.status !== 'ready') return prev;
          return {
            ...prev,
            [key]: {
              state: {
                status: 'ready',
                posts: [...current.state.posts, ...page.items],
                hasMore: page.nextCursor !== null,
                loadingMore: false,
              },
              nextCursor: page.nextCursor,
            },
          };
        });
      } catch {
        setCache((prev) => {
          const current = prev[key];
          if (current.state.status !== 'ready') return prev;
          return {
            ...prev,
            [key]: {
              ...current,
              state: {
                ...current.state,
                loadingMore: false,
                loadMoreError: t('loadMoreError'),
              },
            },
          };
        });
      }
    },
    [cache, t],
  );

  useEffect(() => {
    if (activeTab === 'for_you') return; // 'Para ti' ahora son rails — no hay cursor.
    if (activeTab === 'map') return; // El mapa maneja su propio fetch por bbox.
    const key = slotKeyFor(activeTab, followingSort);
    if (startedSlotsRef.current.has(key)) return;
    startedSlotsRef.current.add(key);
    void loadFirstPage(activeTab, followingSort);
  }, [activeTab, followingSort, loadFirstPage]);

  // Tab por defecto basado en si el usuario sigue a alguien: si ya hay al
  // menos un follow, abrir directo en 'Siguiendo'; si no, dejar 'Para ti'.
  // Anónimos y errores de red caen al default actual ('for_you').
  useEffect(() => {
    if (tabResolvedRef.current) return;
    if (isAuthLoading) return;
    if (!user) {
      tabResolvedRef.current = true;
      setTabResolved(true);
      return;
    }
    let cancelled = false;
    void getUserProfile(user.id)
      .then((profile) => {
        if (cancelled || tabResolvedRef.current) return;
        tabResolvedRef.current = true;
        if (profile.counts.following > 0) {
          setActiveTab('following');
        }
        setTabResolved(true);
      })
      .catch(() => {
        if (cancelled || tabResolvedRef.current) return;
        tabResolvedRef.current = true;
        setTabResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isAuthLoading]);

  const handleToggleLike = useCallback(
    async (postId: string, next: boolean) => {
      // Optimistic: mirror the toggle in every cached tab (the same post may
      // appear in for_you AND following).
      setCache((prev) => mapPosts(prev, (post) => (post.id === postId ? applyLike(post, next) : post)));
      try {
        if (next) await likePost(postId);
        else await unlikePost(postId);
      } catch {
        setCache((prev) => mapPosts(prev, (post) => (post.id === postId ? applyLike(post, !next) : post)));
        toast.error(
          next ? tErrs('likeFailed') : tErrs('unlikeFailed'),
          tErrs('tryAgain'),
        );
      }
    },
    [toast, tErrs],
  );

  const handleToggleSave = useCallback(
    async (postId: string, next: boolean) => {
      setCache((prev) => mapPosts(prev, (post) => (post.id === postId ? applySave(post, next) : post)));
      try {
        if (next) await savePost(postId);
        else await unsavePost(postId);
      } catch {
        setCache((prev) => mapPosts(prev, (post) => (post.id === postId ? applySave(post, !next) : post)));
        toast.error(
          next ? tErrs('saveFailed') : tErrs('unsaveFailed'),
          tErrs('tryAgain'),
        );
      }
    },
    [toast, tErrs],
  );

  const handleToggleWantToTry = useCallback(
    async (dishId: string, next: boolean) => {
      setCache((prev) =>
        mapPosts(prev, (post) =>
          post.dish.id === dishId ? applyWantToTry(post, next) : post,
        ),
      );
      try {
        if (next) await addToWantToTry(dishId);
        else await removeFromWantToTry(dishId);
      } catch {
        setCache((prev) =>
          mapPosts(prev, (post) =>
            post.dish.id === dishId ? applyWantToTry(post, !next) : post,
          ),
        );
        toast.error(
          next ? tErrs('addToListFailed') : tErrs('removeFromListFailed'),
          tErrs('tryAgain'),
        );
      }
    },
    [toast, tErrs],
  );

  const tabs = useMemo(() => [
    { value: 'for_you', label: t('tabForYou') },
    { value: 'following', label: t('tabFollowing') },
    { value: 'map', label: t('tabMap') },
  ], [t]);

  return (
    <section className="cc-container flex flex-col gap-6 py-6">
      <FeedWelcome />
      <header className="flex flex-col gap-2">
        <h1 className="sr-only">{t('heading')}</h1>
        <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-text-muted">
          {t('kicker')}
        </p>
        <Tabs
          ariaLabel={t('feedType')}
          value={activeTab}
          items={tabs}
          onChange={(next) => {
            tabResolvedRef.current = true;
            setTabResolved(true);
            setActiveTab(next as FeedTabValue);
          }}
        />
      </header>

      {user && reportTarget && (
        <ReportModal
          open={Boolean(reportTarget)}
          entityType="review"
          entityId={reportTarget.id}
          subject={reportTarget.subject}
          onClose={() => setReportTarget(null)}
        />
      )}

      {!tabResolved ? (
        <div
          className="flex flex-col gap-4"
          aria-busy="true"
          aria-live="polite"
          aria-label={t('loading')}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : activeTab === 'for_you' ? (
        <DiscoveryRails />
      ) : activeTab === 'map' ? (
        <MapDiscoveryView />
      ) : (
        (() => {
          const tab: FeedType = activeTab;
          const sort: FeedSort = followingSort;
          const key = slotKeyFor(tab, sort);
          return (
            <div className="flex flex-col gap-4">
              <FollowingSortToggle value={sort} onChange={setFollowingSort} />
              <FeedList
                state={cache[key].state}
                emptyTitle={tEmpty('title')}
                emptyDescription={tEmpty('description')}
                emptyAction={{ label: tEmpty('action'), href: '/search' }}
                onReachEnd={() => void loadNextPage(tab, sort)}
                onLoadMoreRetry={() => void loadNextPage(tab, sort)}
                onOpenPost={(postId) => router.push(`/reviews/${postId}`)}
                onOpenDish={(dishId) => router.push(`/dishes/${dishId}`)}
                onOpenAuthor={(userId) => router.push(`/u/${userId}`)}
                onOpenRestaurant={(restaurantId) => router.push(`/restaurants/${restaurantId}`)}
                onComment={(postId) => router.push(`/reviews/${postId}#comments`)}
                onReport={
                  user
                    ? (postId) => {
                        const slot = cache[key];
                        const post = slot.state.status === 'ready'
                          ? slot.state.posts.find((p) => p.id === postId)
                          : undefined;
                        const subject = post ? `${post.dish.name} @ ${post.dish.restaurantName}` : undefined;
                        setReportTarget({ id: postId, subject: subject ?? '' });
                      }
                    : undefined
                }
                onShare={(postId) => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    void navigator.share({ url: `${location.origin}/reviews/${postId}` });
                  }
                }}
                onToggleLike={(id, next) => void handleToggleLike(id, next)}
                onToggleSave={(id, next) => void handleToggleSave(id, next)}
                onToggleWantToTry={
                  user ? (dishId, next) => void handleToggleWantToTry(dishId, next) : undefined
                }
              />
            </div>
          );
        })()
      )}
    </section>
  );
}

interface FollowingSortToggleProps {
  value: FeedSort;
  onChange: (next: FeedSort) => void;
}

function FollowingSortToggle({ value, onChange }: FollowingSortToggleProps) {
  const t = useTranslations('feed');
  const items: ReadonlyArray<{ value: FeedSort; label: string }> = [
    { value: 'recent', label: t('sortRecent') },
    { value: 'top', label: t('sortTop') },
  ];
  return (
    <div
      role="radiogroup"
      aria-label={t('sortLabel')}
      className="inline-flex items-center gap-1 self-start rounded-full border border-border-default bg-surface-card p-1 shadow-sm"
    >
      {items.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-8 items-center rounded-full px-3 font-sans text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              active
                ? 'bg-[color:var(--color-azafran)] text-white'
                : 'text-text-secondary hover:bg-surface-subtle',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function mapPosts(cache: SlotCache, fn: (post: ReviewPost) => ReviewPost): SlotCache {
  const next: SlotCache = { ...cache };
  (Object.keys(cache) as SlotKey[]).forEach((key) => {
    const slot = cache[key];
    if (slot.state.status === 'ready') {
      next[key] = {
        ...slot,
        state: { ...slot.state, posts: slot.state.posts.map(fn) },
      };
    }
  });
  return next;
}

function applyLike(post: ReviewPost, next: boolean): ReviewPost {
  if (post.viewerState.liked === next) return post;
  return {
    ...post,
    viewerState: { ...post.viewerState, liked: next },
    stats: { ...post.stats, likes: post.stats.likes + (next ? 1 : -1) },
  };
}

function applySave(post: ReviewPost, next: boolean): ReviewPost {
  if (post.viewerState.saved === next) return post;
  return {
    ...post,
    viewerState: { ...post.viewerState, saved: next },
    stats: { ...post.stats, saves: post.stats.saves + (next ? 1 : -1) },
  };
}

function applyWantToTry(post: ReviewPost, next: boolean): ReviewPost {
  if ((post.viewerState.wantToTry ?? false) === next) return post;
  return {
    ...post,
    viewerState: { ...post.viewerState, wantToTry: next },
  };
}
