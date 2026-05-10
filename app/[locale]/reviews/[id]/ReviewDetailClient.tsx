'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faImage } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import PostCard from '@/app/components/social/PostCard';
import CommentItem from '@/app/components/social/CommentItem';
import CommentComposer from '@/app/components/social/CommentComposer';
import ReportModal from '@/app/components/social/ReportModal';
import UserActionsMenu from '@/app/components/social/UserActionsMenu';
import OwnerResponseBlock from '@/app/components/social/OwnerResponseBlock';
import {
  getPost,
  getComments,
  createComment,
  createReply,
  deleteComment,
  getReplies,
  likeComment,
  unlikeComment,
  updateComment,
} from '@/app/lib/api/posts';
import { ApiError } from '@/app/lib/api/client';
import { useToast } from '@/app/components/ui/Toast';
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
  const t = useTranslations('reviewDetail');
  const [viewState, setViewState] = useState<ViewState>({ status: 'loading' });
  const [comments, setComments] = useState<Comment[]>([]);
  const [composerValue, setComposerValue] = useState('');
  const [composerLoading, setComposerLoading] = useState(false);
  const [composerError, setComposerError] = useState<string | undefined>();
  const [repliesByParent, setRepliesByParent] = useState<Record<string, Comment[]>>({});
  const [repliesExpanded, setRepliesExpanded] = useState<Record<string, boolean>>({});
  const [repliesLoading, setRepliesLoading] = useState<Record<string, boolean>>({});
  const [reportTarget, setReportTarget] = useState<
    | { kind: 'review'; id: string; subject: string }
    | { kind: 'comment'; id: string; subject: string }
    | null
  >(null);
  // El menú ⋯ del post ofrece Reportar reseña / Silenciar / Bloquear.
  // Se abre solo si hay sesión.
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [sharingCard, setSharingCard] = useState(false);

  const { posts, setPosts, toggleLike, toggleSave } = usePostsInteraction();
  const post = posts[0];

  const { user } = useAuthContext();
  const router = useRouter();
  const toast = useToast();

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
        message: t('loadError'),
      });
    }
  }, [postId, setPosts, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleShare = useCallback((id: string) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      void navigator.share({ url: `${location.origin}/reviews/${id}` });
    }
  }, []);

  const handleShareCard = useCallback(
    async (id: string) => {
      setSharingCard(true);
      try {
        const res = await fetch(`/api/og/review/${encodeURIComponent(id)}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('og-failed');
        const blob = await res.blob();
        const file = new File([blob], `palato-${id}.png`, {
          type: 'image/png',
        });
        const dishLabel = post?.dish.name ?? t('fallbackShareLabel');
        if (
          typeof navigator !== 'undefined' &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({ files: [file], title: dishLabel });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        if (
          !(err instanceof DOMException && err.name === 'AbortError')
        ) {
          toast.error(
            t('shareCardErrorTitle'),
            t('shareCardErrorBody'),
          );
        }
      } finally {
        setSharingCard(false);
      }
    },
    [post, toast, t],
  );

  const handleEditComment = useCallback(
    async (commentId: string, nextText: string) => {
      const updated = await updateComment(commentId, nextText);
      if (updated.parentCommentId) {
        const parentId = updated.parentCommentId;
        setRepliesByParent((prev) => ({
          ...prev,
          [parentId]: (prev[parentId] ?? []).map((r) =>
            r.id === commentId ? updated : r,
          ),
        }));
      } else {
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      }
    },
    [],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      await deleteComment(commentId);
      let parentOfDeletedReply: string | null = null;
      setComments((prev) => {
        const next = prev.filter((c) => c.id !== commentId);
        if (next.length === prev.length) return prev;
        return next;
      });
      setRepliesByParent((prev) => {
        const next: Record<string, Comment[]> = {};
        for (const [parentId, list] of Object.entries(prev)) {
          const filtered = list.filter((r) => r.id !== commentId);
          if (filtered.length !== list.length) {
            parentOfDeletedReply = parentId;
          }
          next[parentId] = filtered;
        }
        return next;
      });
      if (parentOfDeletedReply) {
        const parentId: string = parentOfDeletedReply;
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, repliesCount: Math.max(0, c.repliesCount - 1) }
              : c,
          ),
        );
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                stats: { ...p.stats, comments: Math.max(0, p.stats.comments - 1) },
              }
            : p,
        ),
      );
    },
    [postId, setPosts],
  );

  const applyLikeUpdate = useCallback(
    (
      commentId: string,
      patch: { likesCount: number; viewerLiked: boolean },
    ) => {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, ...patch } : c)),
      );
      setRepliesByParent((prev) => {
        const next: Record<string, Comment[]> = {};
        for (const [parentId, list] of Object.entries(prev)) {
          next[parentId] = list.map((r) =>
            r.id === commentId ? { ...r, ...patch } : r,
          );
        }
        return next;
      });
    },
    [],
  );

  const findCommentById = useCallback(
    (commentId: string): Comment | undefined => {
      const top = comments.find((c) => c.id === commentId);
      if (top) return top;
      for (const list of Object.values(repliesByParent)) {
        const hit = list.find((r) => r.id === commentId);
        if (hit) return hit;
      }
      return undefined;
    },
    [comments, repliesByParent],
  );

  const handleToggleCommentLike = useCallback(
    async (commentId: string, next: boolean) => {
      const current = findCommentById(commentId);
      if (!current) return;
      const optimistic = {
        likesCount: Math.max(0, current.likesCount + (next ? 1 : -1)),
        viewerLiked: next,
      };
      applyLikeUpdate(commentId, optimistic);
      try {
        const result = next ? await likeComment(commentId) : await unlikeComment(commentId);
        applyLikeUpdate(commentId, result);
      } catch {
        applyLikeUpdate(commentId, {
          likesCount: current.likesCount,
          viewerLiked: current.viewerLiked,
        });
        toast.error(
          next ? t('commentLikeError') : t('commentUnlikeError'),
          t('tryAgainShort'),
        );
      }
    },
    [applyLikeUpdate, findCommentById, toast, t],
  );

  const handleSubmitReply = useCallback(
    async (parentCommentId: string, text: string) => {
      const created = await createReply(parentCommentId, text);
      setRepliesByParent((prev) => ({
        ...prev,
        [parentCommentId]: [...(prev[parentCommentId] ?? []), created],
      }));
      setRepliesExpanded((prev) => ({ ...prev, [parentCommentId]: true }));
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentCommentId
            ? { ...c, repliesCount: c.repliesCount + 1 }
            : c,
        ),
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } }
            : p,
        ),
      );
    },
    [postId, setPosts],
  );

  const handleToggleReplies = useCallback(
    async (parentCommentId: string) => {
      const isExpanded = repliesExpanded[parentCommentId] === true;
      if (isExpanded) {
        setRepliesExpanded((prev) => ({ ...prev, [parentCommentId]: false }));
        return;
      }
      const alreadyLoaded = repliesByParent[parentCommentId] !== undefined;
      if (alreadyLoaded) {
        setRepliesExpanded((prev) => ({ ...prev, [parentCommentId]: true }));
        return;
      }
      setRepliesLoading((prev) => ({ ...prev, [parentCommentId]: true }));
      try {
        const page = await getReplies(parentCommentId);
        setRepliesByParent((prev) => ({
          ...prev,
          [parentCommentId]: page.items,
        }));
        setRepliesExpanded((prev) => ({ ...prev, [parentCommentId]: true }));
      } catch {
        toast.error(t('loadRepliesError'), t('tryAgainShort'));
      } finally {
        setRepliesLoading((prev) => ({ ...prev, [parentCommentId]: false }));
      }
    },
    [repliesByParent, repliesExpanded, toast, t],
  );

  const handleReportComment = useCallback(
    (commentId: string) => {
      const target = comments.find((c) => c.id === commentId);
      if (!target) return;
      // Si el autor borró su cuenta no se debería poder reportar el
      // comentario (can_report sale false del backend), pero defendemos
      // el sujeto del modal por las dudas.
      if (!target.author) return;
      const excerpt =
        target.text.length > 80 ? target.text.slice(0, 80) + '…' : target.text;
      setReportTarget({
        kind: 'comment',
        id: commentId,
        subject: `${target.author.displayName}: ${excerpt}`,
      });
    },
    [comments],
  );

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
          : t('createCommentError');
      setComposerError(message);
    } finally {
      setComposerLoading(false);
    }
  }, [composerValue, postId, setPosts, t]);

  if (viewState.status === 'loading') return <LoadingView />;

  if (viewState.status === 'not_found') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-medium text-text-primary">
          {t('notFoundTitle')}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {t('notFoundDescription')}
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          {t('backToFeed')}
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
            {t('tryAgain')}
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
        onOpenMenu={user ? () => setPostMenuOpen(true) : undefined}
      />

      {user && postMenuOpen && (
        <UserActionsMenu
          open
          onClose={() => setPostMenuOpen(false)}
          targetUserId={post.author.id}
          targetDisplayName={post.author.displayName}
          targetHandle={post.author.handle}
          reportContext={{
            entityType: 'review',
            entityId: post.id,
            subject: `${post.dish.name} @ ${post.dish.restaurantName}`,
          }}
          onBlocked={() => router.push('/')}
          onMuted={() => router.push('/')}
        />
      )}

      <ShareAsCardCTA
        loading={sharingCard}
        onClick={() => void handleShareCard(post.id)}
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

      <OwnerResponseBlock
        reviewId={post.id}
        restaurantSlugOrId={post.dish.restaurantId}
      />

      <section id="comments" aria-labelledby="comments-title" className="flex flex-col gap-5">
        <h2 id="comments-title" className="font-display text-2xl font-medium text-text-primary">
          {t('commentsHeading')}
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
            {t('anonComment')}
          </div>
        )}

        {comments.length === 0 ? (
          <p className="font-sans text-sm text-text-muted">
            {t('noComments')}
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-5 p-0">
            {comments.map((c) => (
              <li key={c.id}>
                <CommentItem
                  comment={c}
                  onOpenAuthor={(id) => router.push(`/u/${id}`)}
                  onSaveEdit={user ? handleEditComment : undefined}
                  onDelete={user ? handleDeleteComment : undefined}
                  onReport={user ? handleReportComment : undefined}
                  onToggleLike={user ? handleToggleCommentLike : undefined}
                  onSubmitReply={user ? handleSubmitReply : undefined}
                  onToggleReplies={handleToggleReplies}
                  replies={repliesByParent[c.id]}
                  repliesExpanded={repliesExpanded[c.id] === true}
                  repliesLoading={repliesLoading[c.id] === true}
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

interface ShareAsCardCTAProps {
  loading: boolean;
  onClick: () => void;
}

function ShareAsCardCTA({ loading, onClick }: ShareAsCardCTAProps) {
  const t = useTranslations('reviewDetail');
  return (
    <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-[var(--color-terracota-pale)] bg-[var(--color-crema)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-semibold text-text-primary">
          {t('shareCardTitle')}
        </h3>
        <p className="font-sans text-sm text-text-muted">
          {t('shareCardSubtitle')}
        </p>
      </div>
      <Button
        variant="primary"
        size="md"
        loading={loading}
        leftIcon={<FontAwesomeIcon icon={faImage} className="h-4 w-4" />}
        onClick={onClick}
        className="shrink-0"
      >
        {t('shareCardCTA')}
      </Button>
    </div>
  );
}
