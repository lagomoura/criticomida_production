'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Tabs from '@/app/components/ui/Tabs';
import FeedList, { type FeedState } from './FeedList';
import { getFeed } from '@/app/lib/api/feed';
import ReportModal from '@/app/components/social/ReportModal';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import type { FeedType, ReviewPost } from '@/app/lib/types/social';

/**
 * Tab-scoped state. Keeps posts, cursor, and in-flight flags separate per
 * tab so switching doesn't lose scroll position / fetched pages.
 */
interface TabSlot {
  state: FeedState;
  nextCursor: string | null;
}

type TabCache = Record<FeedType, TabSlot>;

const INITIAL_SLOT: TabSlot = {
  state: { status: 'loading' },
  nextCursor: null,
};

const INITIAL_CACHE: TabCache = {
  for_you: INITIAL_SLOT,
  following: INITIAL_SLOT,
};

const PAGE_SIZE = 10;

export default function FeedClient() {
  const [activeTab, setActiveTab] = useState<FeedType>('for_you');
  const [cache, setCache] = useState<TabCache>(INITIAL_CACHE);
  const [reportTarget, setReportTarget] = useState<{ id: string; subject: string } | null>(null);
  // Tracks which tabs we've already fired loadFirstPage for. Lets us trigger
  // load on tab switch without keeping `cache` in the effect deps — depending
  // on `cache` would loop because loadFirstPage immediately writes to cache
  // while the slot is still in 'loading' state.
  const startedTabsRef = useRef<Set<FeedType>>(new Set());
  const { user } = useAuthContext();
  const router = useRouter();

  const loadFirstPage = useCallback(async (tab: FeedType) => {
    setCache((prev) => ({
      ...prev,
      [tab]: { state: { status: 'loading' }, nextCursor: null },
    }));
    try {
      const page = await getFeed({ type: tab, limit: PAGE_SIZE });
      setCache((prev) => ({
        ...prev,
        [tab]: {
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
        [tab]: {
          state: {
            status: 'error',
            message: 'No pudimos cargar el feed. Probá de nuevo en un momento.',
            onRetry: () => void loadFirstPage(tab),
          },
          nextCursor: null,
        },
      }));
    }
  }, []);

  const loadNextPage = useCallback(
    async (tab: FeedType) => {
      const slot = (prevCache => prevCache[tab])(cache);
      if (slot.state.status !== 'ready') return;
      if (!slot.state.hasMore) return;
      if (slot.state.loadingMore) return;
      if (!slot.nextCursor) return;

      const currentCursor = slot.nextCursor;

      setCache((prev) => {
        const current = prev[tab];
        if (current.state.status !== 'ready') return prev;
        return {
          ...prev,
          [tab]: {
            ...current,
            state: { ...current.state, loadingMore: true, loadMoreError: undefined },
          },
        };
      });

      try {
        const page = await getFeed({
          type: tab,
          cursor: currentCursor,
          limit: PAGE_SIZE,
        });
        setCache((prev) => {
          const current = prev[tab];
          if (current.state.status !== 'ready') return prev;
          return {
            ...prev,
            [tab]: {
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
          const current = prev[tab];
          if (current.state.status !== 'ready') return prev;
          return {
            ...prev,
            [tab]: {
              ...current,
              state: {
                ...current.state,
                loadingMore: false,
                loadMoreError:
                  'No pudimos cargar más reseñas. Probá de nuevo en un momento.',
              },
            },
          };
        });
      }
    },
    [cache],
  );

  useEffect(() => {
    if (startedTabsRef.current.has(activeTab)) return;
    startedTabsRef.current.add(activeTab);
    void loadFirstPage(activeTab);
  }, [activeTab, loadFirstPage]);

  const handleToggleLike = useCallback((postId: string, next: boolean) => {
    setCache((prev) => mapPosts(prev, (post) => (post.id === postId ? applyLike(post, next) : post)));
  }, []);

  const handleToggleSave = useCallback((postId: string, next: boolean) => {
    setCache((prev) => mapPosts(prev, (post) => (post.id === postId ? applySave(post, next) : post)));
  }, []);

  const tabs = [
    { value: 'for_you', label: 'Para ti' },
    { value: 'following', label: 'Siguiendo' },
  ];

  return (
    <section className="cc-container flex flex-col gap-4 py-6">
      <header>
        <h1 className="sr-only">Feed</h1>
        <Tabs
          ariaLabel="Tipo de feed"
          value={activeTab}
          items={tabs}
          onChange={(next) => setActiveTab(next as FeedType)}
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

      <FeedList
        state={cache[activeTab].state}
        emptyTitle={activeTab === 'following' ? 'Todavía no seguís a nadie' : 'Sin reseñas por ahora'}
        emptyDescription={
          activeTab === 'following'
            ? 'Seguí a críticos o amigos para ver sus reseñas acá.'
            : 'Cuando haya reseñas nuevas las vas a ver en este feed.'
        }
        emptyAction={
          activeTab === 'following'
            ? { label: 'Descubrir críticos', href: '/search' }
            : undefined
        }
        onReachEnd={() => void loadNextPage(activeTab)}
        onLoadMoreRetry={() => void loadNextPage(activeTab)}
        onOpenPost={(postId) => router.push(`/reviews/${postId}`)}
        onOpenDish={(dishId) => router.push(`/dishes/${dishId}`)}
        onOpenAuthor={(userId) => router.push(`/u/${userId}`)}
        onOpenRestaurant={(restaurantId) => router.push(`/restaurants/${restaurantId}`)}
        onComment={(postId) => router.push(`/reviews/${postId}#comments`)}
        onOpenMenu={
          user
            ? (postId) => {
                const slot = cache[activeTab];
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
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
      />
    </section>
  );
}

function mapPosts(cache: TabCache, fn: (post: ReviewPost) => ReviewPost): TabCache {
  const next: TabCache = { ...cache };
  (Object.keys(cache) as FeedType[]).forEach((key) => {
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
