'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import PostCard from '@/app/components/social/PostCard';
import CommentItem from '@/app/components/social/CommentItem';
import CommentComposer from '@/app/components/social/CommentComposer';
import ReportModal from '@/app/components/social/ReportModal';
import { getPost, getComments, createComment } from '@/app/lib/api/posts';
import { ApiError } from '@/app/lib/api/client';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { usePostsInteraction } from '@/app/lib/hooks/usePostsInteraction';
import type { Comment } from '@/app/lib/types/social';

interface Props {
  postId: string;
}

type ViewState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | { status: 'ready' };

export default function ReviewDetailClient({ postId }: Props) {
  const [viewState, setViewState] = useState<ViewState>({ status: 'loading' });
  const [comments, setComments] = useState<Comment[]>([]);
  const [composerValue, setComposerValue] = useState('');
  const [composerLoading, setComposerLoading] = useState(false);
  const [composerError, setComposerError] = useState<string | undefined>();
  const [reportTarget, setReportTarget] = useState<
    | { kind: 'review'; id: string; subject: string }
    | { kind: 'comment'; id: string; subject: string }
    | null
  >(null);

  // Single-item list of posts — `usePostsInteraction` handles like/save with
  // API round-trip + rollback on failure.
  const { posts, setPosts, toggleLike, toggleSave } = usePostsInteraction();
  const post = posts[0];

  const { user } = useAuthContext();
  const router = useRouter();

  const load = useCallback(async () => {
    setViewState({ status: 'loading' });
    try {
      const [loadedPost, loadedComments] = await Promise.all([
        getPost(postId),
        getComments(postId),
      ]);
      setPosts([loadedPost]);
      setComments(loadedComments.items);
      setViewState({ status: 'ready' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setViewState({ status: 'not_found' });
        return;
      }
      setViewState({
        status: 'error',
        message: 'No pudimos cargar la reseña. Probá de nuevo en un momento.',
      });
    }
  }, [postId, setPosts]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleShare = useCallback((id: string) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      void navigator.share({ url: `${location.origin}/reviews/${id}` });
    }
  }, []);

  const handleSubmitComment = useCallback(async () => {
    const text = composerValue.trim();
    if (!text) return;
    setComposerLoading(true);
    setComposerError(undefined);
    try {
      const created = await createComment(postId, text);
      setComments((prev) => [...prev, created]);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } }
            : p,
        ),
      );
      setComposerValue('');
    } catch (err) {
      const message =
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : 'No se pudo publicar el comentario.';
      setComposerError(message);
    } finally {
      setComposerLoading(false);
    }
  }, [composerValue, postId, setPosts]);

  if (viewState.status === 'loading') return <LoadingView />;

  if (viewState.status === 'not_found') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-medium text-text-primary">
          Reseña no encontrada
        </h1>
        <p className="font-sans text-sm text-text-muted">
          Puede haber sido eliminada o nunca existió.
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          Volver al feed
        </Button>
      </div>
    );
  }

  if (viewState.status === 'error') {
    return (
      <div className="cc-container py-8">
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="mb-2 h-5 w-5 text-action-danger"
            aria-hidden
          />
          <p className="mb-3 font-sans text-sm text-text-secondary">{viewState.message}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="cc-container flex flex-col gap-6 py-6">
      <PostCard
        post={post}
        expanded
        onOpenDish={(id) => router.push(`/dishes/${id}`)}
        onOpenAuthor={(id) => router.push(`/u/${id}`)}
        onOpenRestaurant={(id) => router.push(`/restaurants/${id}`)}
        onToggleLike={(id, next) => void toggleLike(id, next)}
        onToggleSave={(id, next) => void toggleSave(id, next)}
        onShare={handleShare}
        onOpenMenu={
          user
            ? (id) =>
                setReportTarget({
                  kind: 'review',
                  id,
                  subject: `${post.dish.name} @ ${post.dish.restaurantName}`,
                })
            : undefined
        }
      />

      {reportTarget && (
        <ReportModal
          open
          entityType={reportTarget.kind}
          entityId={reportTarget.id}
          subject={reportTarget.subject}
          onClose={() => setReportTarget(null)}
        />
      )}

      <section id="comments" aria-labelledby="comments-title" className="flex flex-col gap-5">
        <h2 id="comments-title" className="font-display text-2xl font-medium text-text-primary">
          Comentarios
          <span className="ml-2 font-sans text-base font-normal text-text-muted">
            ({post.stats.comments})
          </span>
        </h2>

        {user ? (
          <CommentComposer
            viewerName={user.display_name || user.email}
            viewerAvatarUrl={user.avatar_url}
            value={composerValue}
            onChange={setComposerValue}
            onSubmit={() => void handleSubmitComment()}
            loading={composerLoading}
            error={composerError}
          />
        ) : (
          <div className="rounded-xl border border-border-default bg-surface-subtle px-4 py-3 font-sans text-sm text-text-muted">
            Iniciá sesión para dejar un comentario.
          </div>
        )}

        {comments.length === 0 ? (
          <p className="font-sans text-sm text-text-muted">
            Todavía no hay comentarios. ¿Qué te pareció este plato?
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-5 p-0">
            {comments.map((c) => (
              <li key={c.id}>
                <CommentItem
                  comment={c}
                  onOpenAuthor={(id) => router.push(`/u/${id}`)}
                  onOpenMenu={
                    user && c.canReport
                      ? (commentId) => {
                          const excerpt =
                            c.text.length > 80 ? c.text.slice(0, 80) + '…' : c.text;
                          setReportTarget({
                            kind: 'comment',
                            id: commentId,
                            subject: `${c.author.displayName}: ${excerpt}`,
                          });
                        }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="cc-container flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" width={32} height={32} />
          <div className="flex flex-col gap-1.5">
            <Skeleton shape="line" width={140} />
            <Skeleton shape="line" width={80} />
          </div>
        </div>
        <Skeleton shape="line" width="70%" height={24} />
        <Skeleton shape="line" />
        <Skeleton shape="line" />
        <Skeleton shape="line" width="60%" />
        <Skeleton shape="box" width="100%" height={280} />
      </div>
      <Skeleton shape="line" width={160} height={24} />
      <div className="flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton shape="circle" width={32} height={32} />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton shape="line" width={120} />
              <Skeleton shape="line" />
              <Skeleton shape="line" width="70%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
