'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faTriangleExclamation,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/app/lib/i18n/navigation';
import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import EmptyState from '@/app/components/ui/EmptyState';
import Skeleton from '@/app/components/ui/Skeleton';
import FollowListRow from './FollowListRow';
import { getUserProfile, getFollowers, getFollowing } from '@/app/lib/api/users';
import { useFollowToggle } from '@/app/lib/hooks/useFollowToggle';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import type { FollowerSummary, PublicUserProfile } from '@/app/lib/types/social';

export type FollowListMode = 'followers' | 'following';

export interface FollowListClientProps {
  userId: string;
  mode: FollowListMode;
}

type OwnerState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error' }
  | { status: 'ready'; profile: PublicUserProfile };

type ListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      items: FollowerSummary[];
      nextCursor: string | null;
      loadingMore: boolean;
      loadMoreError?: string;
    };

export default function FollowListClient({ userId, mode }: FollowListClientProps) {
  const t = useTranslations(mode === 'followers' ? 'profile.followers' : 'profile.following');
  const { user } = useAuthContext();
  const router = useRouter();
  const viewerUserId = user?.id ?? null;
  const fetchPage = mode === 'followers' ? getFollowers : getFollowing;

  const [ownerState, setOwnerState] = useState<OwnerState>({ status: 'loading' });
  const [listState, setListState] = useState<ListState>({ status: 'loading' });
  const { loading: followLoading, toggle: toggleFollow } = useFollowToggle();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadFirstPage = useCallback(async () => {
    setListState({ status: 'loading' });
    try {
      const page = await fetchPage(userId);
      setListState({
        status: 'ready',
        items: page.items,
        nextCursor: page.nextCursor,
        loadingMore: false,
      });
    } catch {
      setListState({ status: 'error', message: t('loadError') });
    }
  }, [fetchPage, userId, t]);

  const loadOwner = useCallback(async () => {
    setOwnerState({ status: 'loading' });
    try {
      const profile = await getUserProfile(userId);
      setOwnerState({ status: 'ready', profile });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setOwnerState({ status: 'not_found' });
        return;
      }
      setOwnerState({ status: 'error' });
    }
  }, [userId]);

  useEffect(() => {
    void loadOwner();
    void loadFirstPage();
  }, [loadOwner, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (listState.status !== 'ready') return;
    if (listState.loadingMore || listState.nextCursor === null) return;
    const cursor = listState.nextCursor;
    setListState({ ...listState, loadingMore: true, loadMoreError: undefined });
    try {
      const page = await fetchPage(userId, cursor);
      setListState((prev) => {
        if (prev.status !== 'ready') return prev;
        return {
          ...prev,
          items: [...prev.items, ...page.items],
          nextCursor: page.nextCursor,
          loadingMore: false,
        };
      });
    } catch {
      setListState((prev) =>
        prev.status === 'ready'
          ? { ...prev, loadingMore: false, loadMoreError: t('loadMoreError') }
          : prev,
      );
    }
  }, [fetchPage, userId, t, listState]);

  const isReady = listState.status === 'ready';
  const hasMore = isReady && listState.nextCursor !== null;
  const loadingMore = isReady && listState.loadingMore;

  useEffect(() => {
    if (!isReady || !hasMore || loadingMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isReady, hasMore, loadingMore, loadMore]);

  const handleToggleFollow = useCallback(
    async (targetId: string, next: boolean) => {
      // Optimistic update: flip viewerFollowing for the row.
      setListState((prev) =>
        prev.status === 'ready'
          ? {
              ...prev,
              items: prev.items.map((it) =>
                it.id === targetId ? { ...it, viewerFollowing: next } : it,
              ),
            }
          : prev,
      );
      const settled = await toggleFollow(targetId, next);
      if (settled !== next) {
        // Rollback if the API call ended on the opposite state.
        setListState((prev) =>
          prev.status === 'ready'
            ? {
                ...prev,
                items: prev.items.map((it) =>
                  it.id === targetId ? { ...it, viewerFollowing: settled } : it,
                ),
              }
            : prev,
        );
      }
    },
    [toggleFollow],
  );

  if (ownerState.status === 'not_found') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-medium text-text-primary">
          {t('ownerNotFoundTitle')}
        </h1>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          {t('backToFeed')}
        </Button>
      </div>
    );
  }

  const ownerProfile =
    ownerState.status === 'ready' ? ownerState.profile : null;
  const isSelf = ownerProfile ? ownerProfile.id === viewerUserId : false;

  const headerTitle = (() => {
    if (isSelf) return t('titleSelf');
    if (ownerProfile?.handle) return t('titleOfHandle', { handle: ownerProfile.handle });
    if (ownerProfile?.displayName) {
      return t('titleOfDisplayName', { displayName: ownerProfile.displayName });
    }
    return t('title');
  })();

  return (
    <div className="cc-container flex flex-col gap-6 py-6">
      <Header
        userId={userId}
        owner={ownerProfile}
        ownerLoading={ownerState.status === 'loading'}
        title={headerTitle}
        ariaBack={t('ariaBack')}
        backToProfile={t('backToProfile')}
      />

      {listState.status === 'loading' && <LoadingRows />}

      {listState.status === 'error' && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="mb-2 h-5 w-5 text-action-danger"
            aria-hidden
          />
          <p className="mb-3 font-sans text-sm text-text-secondary">
            {listState.message}
          </p>
          <Button variant="outline" size="sm" onClick={() => void loadFirstPage()}>
            {t('tryAgain')}
          </Button>
        </div>
      )}

      {listState.status === 'ready' && listState.items.length === 0 && (
        <EmptyState
          icon={
            <FontAwesomeIcon icon={faUserGroup} className="h-8 w-8" aria-hidden />
          }
          title={isSelf ? t('emptySelfTitle') : t('emptyOtherTitle')}
          description={
            isSelf ? t('emptySelfDescription') : t('emptyOtherDescription')
          }
        />
      )}

      {listState.status === 'ready' && listState.items.length > 0 && (
        <div className="flex flex-col gap-3">
          {listState.items.map((item) => (
            <FollowListRow
              key={item.id}
              item={item}
              viewerUserId={viewerUserId}
              followLoading={followLoading}
              onToggleFollow={(id, next) => void handleToggleFollow(id, next)}
            />
          ))}

          {hasMore && !loadingMore && (
            <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
          )}

          {loadingMore && (
            <div
              className="flex flex-col gap-3"
              aria-busy="true"
              aria-live="polite"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          )}

          {listState.status === 'ready' && listState.loadMoreError && (
            <div className="rounded-2xl border border-border-default bg-surface-card p-4 text-center">
              <p className="mb-2 font-sans text-sm text-text-secondary">
                {listState.loadMoreError}
              </p>
              <Button variant="outline" size="sm" onClick={() => void loadMore()}>
                {t('tryAgain')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Header({
  userId,
  owner,
  ownerLoading,
  title,
  ariaBack,
  backToProfile,
}: {
  userId: string;
  owner: PublicUserProfile | null;
  ownerLoading: boolean;
  title: string;
  ariaBack: string;
  backToProfile: string;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border-subtle pb-4">
      <Link
        href={`/u/${userId}`}
        aria-label={ariaBack}
        className="inline-flex w-fit items-center gap-2 rounded-md px-2 py-1 font-sans text-sm font-medium text-text-muted no-underline transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" aria-hidden />
        {owner?.displayName ?? backToProfile}
      </Link>

      <div className="flex items-center gap-3">
        {ownerLoading && !owner ? (
          <Skeleton shape="circle" width={48} height={48} />
        ) : (
          <Avatar
            src={owner?.avatarUrl}
            name={owner?.displayName ?? '?'}
            size="md"
          />
        )}
        <h1 className="font-display text-2xl font-medium leading-tight text-text-primary sm:text-3xl">
          {title}
        </h1>
      </div>
    </header>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: 6 }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-default bg-surface-card p-4">
      <Skeleton shape="circle" width={40} height={40} />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton shape="line" width="50%" height={16} />
        <Skeleton shape="line" width="30%" height={12} />
      </div>
      <Skeleton shape="box" width={84} height={32} />
    </div>
  );
}
