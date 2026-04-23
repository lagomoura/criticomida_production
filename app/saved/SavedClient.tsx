'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import FeedList, { type FeedState } from '@/app/components/feed/FeedList';
import { getMyBookmarks } from '@/app/lib/api/interactions';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { usePostsInteraction } from '@/app/lib/hooks/usePostsInteraction';

export default function SavedClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const { posts, setPosts, toggleLike, toggleSave } = usePostsInteraction();

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFirst = useCallback(async () => {
    setStatus('loading');
    try {
      const page = await getMyBookmarks();
      setPosts(page.items);
      setNextCursor(page.nextCursor);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
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
          Iniciá sesión para ver tus guardados
        </h1>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          Volver al feed
        </Button>
      </div>
    );
  }

  // Adapt local loading state to the `FeedState` discriminated union.
  const feedState: FeedState =
    status === 'loading'
      ? { status: 'loading' }
      : status === 'error'
        ? {
            status: 'error',
            message: 'No pudimos cargar tus guardados. Probá de nuevo.',
            onRetry: () => void loadFirst(),
          }
        : {
            status: 'ready',
            posts,
            hasMore: nextCursor !== null,
            loadingMore,
          };

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header>
        <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">Guardados</h1>
        <p className="mt-1 font-sans text-sm text-text-muted">
          Reseñas que marcaste para volver. Solo vos las ves.
        </p>
      </header>

      <FeedList
        state={feedState}
        emptyTitle="Todavía no guardaste nada"
        emptyDescription="Tocá el ícono de marcador en cualquier reseña para guardarla acá."
        emptyAction={{ label: 'Explorar reseñas', href: '/' }}
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
          // If they just removed a save from this list, drop it optimistically.
          if (!next) {
            setPosts((prev) => prev.filter((p) => p.id !== id));
          }
        }}
      />
    </div>
  );
}
