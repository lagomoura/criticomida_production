'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faPenToSquare, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import ProfileHeader from '@/app/components/social/ProfileHeader';
import PostCard from '@/app/components/social/PostCard';
import UserActionsMenu from '@/app/components/social/UserActionsMenu';
import { getUserProfile, getUserPosts } from '@/app/lib/api/users';
import { deleteReview } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { usePostsInteraction } from '@/app/lib/hooks/usePostsInteraction';
import { useFollowToggle } from '@/app/lib/hooks/useFollowToggle';
import type { PublicUserProfile, ReviewPost } from '@/app/lib/types/social';
import PostActionsMenu from './PostActionsMenu';
import EditPostModal from './EditPostModal';

interface Props {
  userId: string;
}

type ViewState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | { status: 'ready'; profile: PublicUserProfile };

export default function PublicProfileClient({ userId }: Props) {
  const [viewState, setViewState] = useState<ViewState>({ status: 'loading' });
  const { posts, setPosts, toggleLike, toggleSave } = usePostsInteraction();
  const { loading: followLoading, toggle: toggleFollow } = useFollowToggle();
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuPost, setMenuPost] = useState<ReviewPost | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  // Menú ⋯ del header del perfil ajeno (Silenciar / Bloquear / Reportar usuario)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const t = useTranslations('profile.publicProfile');

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch {
      setLoggingOut(false);
    }
  }, [logout, router]);

  const handleDeletePost = useCallback(
    async (postId: string) => {
      await deleteReview(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      // Keep the header counter in sync with the visible list.
      setViewState((prev) =>
        prev.status === 'ready'
          ? {
              ...prev,
              profile: {
                ...prev.profile,
                counts: {
                  ...prev.profile.counts,
                  reviews: Math.max(0, prev.profile.counts.reviews - 1),
                },
              },
            }
          : prev,
      );
    },
    [setPosts],
  );

  const handlePostUpdated = useCallback(
    (postId: string, overlay: Partial<ReviewPost>) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...overlay } : p)),
      );
    },
    [setPosts],
  );

  const load = useCallback(async () => {
    setViewState({ status: 'loading' });
    // Resolve the profile first — a 404 here means the user genuinely
    // doesn't exist. Posts are loaded independently so a posts-endpoint
    // failure doesn't mask a valid profile.
    let profile: PublicUserProfile;
    try {
      profile = await getUserProfile(userId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setViewState({ status: 'not_found' });
        return;
      }
      setViewState({
        status: 'error',
        message: t('loadError'),
      });
      return;
    }

    const isSelf = Boolean(user && user.id === profile.id);
    const withViewer: PublicUserProfile = {
      ...profile,
      displayName: isSelf ? user!.display_name || profile.displayName : profile.displayName,
      avatarUrl: isSelf ? user!.avatar_url ?? profile.avatarUrl : profile.avatarUrl,
      viewerState: { ...profile.viewerState, isSelf },
    };
    setViewState({ status: 'ready', profile: withViewer });

    try {
      const userPosts = await getUserPosts(userId);
      setPosts(userPosts.items);
    } catch {
      // Non-fatal: keep the profile visible with an empty list.
      setPosts([]);
    }
  }, [userId, user, setPosts, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFollow = useCallback(
    async (targetId: string, next: boolean) => {
      // Optimistic update of counts + viewerState.
      setViewState((prev) =>
        prev.status === 'ready' ? applyFollowToState(prev, next) : prev,
      );
      const settled = await toggleFollow(targetId, next);
      if (settled !== next) {
        // Rollback if the API call landed on the opposite state.
        setViewState((prev) =>
          prev.status === 'ready' ? applyFollowToState(prev, settled) : prev,
        );
      }
    },
    [toggleFollow],
  );

  if (viewState.status === 'loading') return <LoadingView />;

  if (viewState.status === 'not_found') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-medium text-text-primary">{t('notFoundTitle')}</h1>
        <p className="font-sans text-sm text-text-muted">{t('notFoundDescription')}</p>
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
          <FontAwesomeIcon icon={faTriangleExclamation} className="mb-2 h-5 w-5 text-action-danger" aria-hidden />
          <p className="mb-3 font-sans text-sm text-text-secondary">{viewState.message}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  const { profile } = viewState;

  return (
    <div className="cc-container flex flex-col gap-8 py-6">
      <ProfileHeader
        profile={profile}
        followLoading={followLoading}
        onFollowToggle={(id, next) => void handleFollow(id, next)}
        onEditProfile={() => router.push('/settings')}
        onLogout={() => void handleLogout()}
        logoutLoading={loggingOut}
        // Solo perfil ajeno con sesión activa: ⋯ ofrece block/mute/report.
        onOpenMenu={user && !profile.viewerState.isSelf ? () => setProfileMenuOpen(true) : undefined}
      />

      {user && !profile.viewerState.isSelf && profileMenuOpen && (
        <UserActionsMenu
          open
          onClose={() => setProfileMenuOpen(false)}
          targetUserId={profile.id}
          targetDisplayName={profile.displayName}
          targetHandle={profile.handle}
          onBlocked={() => router.push('/')}
          onMuted={() => router.push('/')}
        />
      )}

      <section className="flex flex-col gap-4" aria-labelledby="user-reviews-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="user-reviews-title" className="font-display text-2xl font-medium text-text-primary">
            {t('reviewsHeading')}
            <span className="ml-2 font-sans text-base font-normal text-text-muted">
              ({profile.counts.reviews})
            </span>
          </h2>
          {profile.viewerState.isSelf && posts.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/compose')}
              leftIcon={<FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" aria-hidden />}
            >
              {t('publishReview')}
            </Button>
          )}
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title={profile.viewerState.isSelf ? t('emptySelfTitle') : t('emptyOtherTitle')}
            description={
              profile.viewerState.isSelf
                ? t('emptySelfDescription')
                : t('emptyOtherDescription')
            }
            icon={
              profile.viewerState.isSelf ? (
                <FontAwesomeIcon icon={faUtensils} className="h-8 w-8" aria-hidden />
              ) : undefined
            }
            action={
              profile.viewerState.isSelf
                ? { label: t('emptySelfAction'), href: '/compose' }
                : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenPost={(id) => router.push(`/reviews/${id}`)}
                onOpenDish={(id) => router.push(`/dishes/${id}`)}
                onOpenAuthor={(id) => router.push(`/u/${id}`)}
                onOpenRestaurant={(id) => router.push(`/restaurants/${id}`)}
                onToggleLike={(id, next) => void toggleLike(id, next)}
                onToggleSave={(id, next) => void toggleSave(id, next)}
                onComment={(id) => router.push(`/reviews/${id}#comments`)}
                onOpenMenu={
                  profile.viewerState.isSelf
                    ? (id) => setMenuPost(posts.find((p) => p.id === id) ?? null)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {menuPost && (
        <PostActionsMenu
          post={menuPost}
          onClose={() => setMenuPost(null)}
          onDelete={handleDeletePost}
          onEdit={(id) => {
            setMenuPost(null);
            setEditingPostId(id);
          }}
        />
      )}

      {editingPostId && (
        <EditPostModal
          postId={editingPostId}
          onClose={() => setEditingPostId(null)}
          onUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}

function applyFollowToState(
  state: Extract<ViewState, { status: 'ready' }>,
  next: boolean,
): ViewState {
  if (state.profile.viewerState.following === next) return state;
  return {
    ...state,
    profile: {
      ...state.profile,
      viewerState: { ...state.profile.viewerState, following: next },
      counts: {
        ...state.profile.counts,
        followers: state.profile.counts.followers + (next ? 1 : -1),
      },
    },
  };
}

function LoadingView() {
  return (
    <div className="cc-container flex flex-col gap-8 py-6">
      <div className="flex items-start gap-5">
        <Skeleton shape="circle" width={80} height={80} />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton shape="line" width="50%" height={28} />
          <Skeleton shape="line" width={120} />
          <Skeleton shape="line" width="70%" />
        </div>
      </div>
      <div className="flex gap-6">
        <Skeleton shape="line" width={80} />
        <Skeleton shape="line" width={80} />
        <Skeleton shape="line" width={80} />
      </div>
      <Skeleton shape="box" width={120} height={40} />
      <div className="flex flex-col gap-4">
        <Skeleton shape="line" width={160} height={24} />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} shape="box" width="100%" height={240} />
        ))}
      </div>
    </div>
  );
}
