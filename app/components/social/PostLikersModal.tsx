'use client';

import { useCallback, useEffect, useState, type UIEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import EmptyState from '@/app/components/ui/EmptyState';
import Skeleton from '@/app/components/ui/Skeleton';
import FollowListRow from './FollowListRow';
import { getPostLikers } from '@/app/lib/api/interactions';
import { useFollowToggle } from '@/app/lib/hooks/useFollowToggle';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import type { FollowerSummary } from '@/app/lib/types/social';

export interface PostLikersModalProps {
  postId: string;
  open: boolean;
  onClose: () => void;
}

type ListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready';
      items: FollowerSummary[];
      nextCursor: string | null;
      loadingMore: boolean;
      loadMoreError: boolean;
    };

/**
 * "Liked by" — paginated list of users who liked a post. Self-contained:
 * fetches on open, lazily. Reuses FollowListRow (avatar + name + @handle +
 * Follow) so the row matches the followers list. Optimistic follow + rollback,
 * same contract as FollowListClient. Pagination uses an onScroll near-bottom
 * trigger because the list scrolls inside the modal body, not the page.
 */
export default function PostLikersModal({
  postId,
  open,
  onClose,
}: PostLikersModalProps) {
  const t = useTranslations('social.likers');
  const { user } = useAuthContext();
  const viewerUserId = user?.id ?? null;
  const { loading: followLoading, toggle: toggleFollow } = useFollowToggle();
  const [listState, setListState] = useState<ListState>({ status: 'idle' });

  const loadFirstPage = useCallback(async () => {
    setListState({ status: 'loading' });
    try {
      const page = await getPostLikers(postId);
      setListState({
        status: 'ready',
        items: page.items,
        nextCursor: page.nextCursor,
        loadingMore: false,
        loadMoreError: false,
      });
    } catch {
      setListState({ status: 'error' });
    }
  }, [postId]);

  // Load lazily when the modal opens; reset when it closes so reopening on a
  // different post never shows stale rows.
  useEffect(() => {
    if (open) {
      void loadFirstPage();
    } else {
      setListState({ status: 'idle' });
    }
  }, [open, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (listState.status !== 'ready') return;
    if (listState.loadingMore || listState.nextCursor === null) return;
    const cursor = listState.nextCursor;
    setListState({ ...listState, loadingMore: true, loadMoreError: false });
    try {
      const page = await getPostLikers(postId, cursor);
      setListState((prev) =>
        prev.status === 'ready'
          ? {
              ...prev,
              items: [...prev.items, ...page.items],
              nextCursor: page.nextCursor,
              loadingMore: false,
            }
          : prev,
      );
    } catch {
      setListState((prev) =>
        prev.status === 'ready'
          ? { ...prev, loadingMore: false, loadMoreError: true }
          : prev,
      );
    }
  }, [postId, listState]);

  const onScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      if (listState.status !== 'ready') return;
      if (listState.loadingMore || listState.nextCursor === null) return;
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 240) {
        void loadMore();
      }
    },
    [listState, loadMore],
  );

  const handleToggleFollow = useCallback(
    async (targetId: string, next: boolean) => {
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
        setListState((prev) =>
          prev.status === 'ready'
            ? {
                ...prev,
                items: prev.items.map((it) =>
                  it.id === targetId
                    ? { ...it, viewerFollowing: settled }
                    : it,
                ),
              }
            : prev,
        );
      }
    },
    [toggleFollow],
  );

  return (
    <Modal open={open} onClose={onClose} title={t('title')} position="bottom-sheet" size="md">
      <div
        onScroll={onScroll}
        className="-mx-6 max-h-[60vh] overflow-y-auto px-6"
      >
        {listState.status === 'loading' && <LoadingRows />}

        {listState.status === 'error' && (
          <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="mb-2 h-5 w-5 text-action-danger"
              aria-hidden
            />
            <p className="mb-3 font-sans text-sm text-text-secondary">
              {t('loadError')}
            </p>
            <Button variant="outline" size="sm" onClick={() => void loadFirstPage()}>
              {t('tryAgain')}
            </Button>
          </div>
        )}

        {listState.status === 'ready' && listState.items.length === 0 && (
          <EmptyState
            icon={<FontAwesomeIcon icon={faHeart} className="h-8 w-8" aria-hidden />}
            title={t('emptyTitle')}
            description={t('emptyDescription')}
          />
        )}

        {listState.status === 'ready' && listState.items.length > 0 && (
          <div className="flex flex-col gap-3 py-1">
            {listState.items.map((item) => (
              <FollowListRow
                key={item.id}
                item={item}
                viewerUserId={viewerUserId}
                followLoading={followLoading}
                onToggleFollow={(id, next) => void handleToggleFollow(id, next)}
              />
            ))}

            {listState.loadingMore && (
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

            {listState.loadMoreError && (
              <div className="rounded-2xl border border-border-default bg-surface-card p-4 text-center">
                <p className="mb-2 font-sans text-sm text-text-secondary">
                  {t('loadMoreError')}
                </p>
                <Button variant="outline" size="sm" onClick={() => void loadMore()}>
                  {t('tryAgain')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-3 py-1" aria-busy="true" aria-live="polite">
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
