'use client';

import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import type { ReviewPost } from '@/app/lib/types/social';
import PostCard from '@/app/components/social/PostCard';
import EmptyState from '@/app/components/ui/EmptyState';
import Skeleton from '@/app/components/ui/Skeleton';
import Button from '@/app/components/ui/Button';
import type { PostCardProps } from '@/app/components/social/PostCard';

export type FeedState =
  | { status: 'loading' }
  | { status: 'error'; message: string; onRetry: () => void }
  | {
      status: 'ready';
      posts: ReviewPost[];
      hasMore: boolean;
      loadingMore: boolean;
      /** Error encountered while fetching a subsequent page (first page OK). */
      loadMoreError?: string;
    };

export interface FeedListProps {
  state: FeedState;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: { label: string; href?: string; onClick?: () => void };
  /** Invoked when the sentinel scrolls into view. Parent is expected to fetch
   * the next page if `hasMore` and not already loading. */
  onReachEnd?: () => void;
  /** Called when the inline "Intentar de nuevo" button is clicked during a
   * pagination error (not the initial load, that one uses state.onRetry). */
  onLoadMoreRetry?: () => void;
  onOpenPost?: PostCardProps['onOpenPost'];
  onOpenDish?: PostCardProps['onOpenDish'];
  onOpenAuthor?: PostCardProps['onOpenAuthor'];
  onOpenRestaurant?: PostCardProps['onOpenRestaurant'];
  onToggleLike?: PostCardProps['onToggleLike'];
  onToggleSave?: PostCardProps['onToggleSave'];
  onComment?: PostCardProps['onComment'];
  onShare?: PostCardProps['onShare'];
  onOpenMenu?: PostCardProps['onOpenMenu'];
}

export default function FeedList({
  state,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onReachEnd,
  onLoadMoreRetry,
  ...cardHandlers
}: FeedListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const isReady = state.status === 'ready';
  const hasMore = isReady && state.hasMore;
  const loadingMore = isReady && state.loadingMore;

  // IntersectionObserver to fire `onReachEnd` when the sentinel scrolls into
  // view. We re-attach whenever hasMore/loadingMore change so the observer
  // stays coherent with the current state.
  useEffect(() => {
    if (!isReady || !hasMore || loadingMore || !onReachEnd) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onReachEnd();
        }
      },
      { rootMargin: '240px 0px' }, // kick in a bit before the edge
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isReady, hasMore, loadingMore, onReachEnd]);

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="mb-2 h-5 w-5 text-action-danger"
          aria-hidden
        />
        <p className="mb-3 font-sans text-sm text-text-secondary">{state.message}</p>
        <Button variant="outline" size="sm" onClick={state.onRetry}>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (state.posts.length === 0) {
    return (
      <EmptyState
        icon={<FontAwesomeIcon icon={faUtensils} className="h-8 w-8" aria-hidden />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {state.posts.map((post) => (
        <PostCard key={post.id} post={post} {...cardHandlers} />
      ))}

      {/* Sentinel: invisible; IntersectionObserver watches this div. */}
      {hasMore && !loadingMore && (
        <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
      )}

      {loadingMore && (
        <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}

      {state.loadMoreError && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-4 text-center">
          <p className="mb-2 font-sans text-sm text-text-secondary">{state.loadMoreError}</p>
          {onLoadMoreRetry && (
            <Button variant="outline" size="sm" onClick={onLoadMoreRetry}>
              Intentar de nuevo
            </Button>
          )}
        </div>
      )}

      {!hasMore && !state.loadMoreError && state.posts.length >= 6 && (
        <p className="py-4 text-center font-sans text-xs text-text-muted">
          Llegaste al final del feed.
        </p>
      )}
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-card p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" width={32} height={32} />
        <div className="flex flex-col gap-1.5">
          <Skeleton shape="line" width={120} />
          <Skeleton shape="line" width={80} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton shape="line" width="60%" height={24} />
          <Skeleton shape="line" width="40%" />
        </div>
        <Skeleton shape="box" width={56} height={32} className="rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton shape="line" />
        <Skeleton shape="line" />
        <Skeleton shape="line" width="70%" />
      </div>
      <Skeleton shape="box" width="100%" height={220} />
      <div className="flex gap-6">
        <Skeleton shape="line" width={50} />
        <Skeleton shape="line" width={50} />
        <Skeleton shape="line" width={50} />
      </div>
    </div>
  );
}
