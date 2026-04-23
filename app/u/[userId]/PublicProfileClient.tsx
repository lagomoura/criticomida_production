'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import ProfileHeader from '@/app/components/social/ProfileHeader';
import PostCard from '@/app/components/social/PostCard';
import { getUserProfile, getUserPosts } from '@/app/lib/api/users';
import { ApiError } from '@/app/lib/api/client';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { usePostsInteraction } from '@/app/lib/hooks/usePostsInteraction';
import { useFollowToggle } from '@/app/lib/hooks/useFollowToggle';
import type { PublicUserProfile } from '@/app/lib/types/social';

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
  const { user } = useAuthContext();
  const router = useRouter();

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
        message: 'No pudimos cargar el perfil. Probá de nuevo en un momento.',
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
  }, [userId, user, setPosts]);

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
        <h1 className="font-display text-3xl font-medium text-text-primary">Perfil no encontrado</h1>
        <p className="font-sans text-sm text-text-muted">Este usuario no existe o fue dado de baja.</p>
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
          <FontAwesomeIcon icon={faTriangleExclamation} className="mb-2 h-5 w-5 text-action-danger" aria-hidden />
          <p className="mb-3 font-sans text-sm text-text-secondary">{viewState.message}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Intentar de nuevo
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
        onEditProfile={() => router.push('/profile')}
      />

      <section className="flex flex-col gap-4" aria-labelledby="user-reviews-title">
        <h2 id="user-reviews-title" className="font-display text-2xl font-medium text-text-primary">
          Reseñas
          <span className="ml-2 font-sans text-base font-normal text-text-muted">
            ({profile.counts.reviews})
          </span>
        </h2>

        {posts.length === 0 ? (
          <EmptyState
            title={profile.viewerState.isSelf ? 'Todavía no publicaste nada' : 'Sin reseñas por ahora'}
            description={
              profile.viewerState.isSelf
                ? 'Compartí tu primera reseña y empezá a construir tu voz crítica.'
                : 'Cuando este usuario publique algo, lo vas a ver acá.'
            }
            action={
              profile.viewerState.isSelf
                ? { label: 'Escribir reseña', href: '/compose' }
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
              />
            ))}
          </div>
        )}
      </section>
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
