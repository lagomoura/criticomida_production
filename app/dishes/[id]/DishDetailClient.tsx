'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import PostCard from '@/app/components/social/PostCard';
import { getDishDetail, getDishReviews } from '@/app/lib/api/dishes-social';
import { ApiError } from '@/app/lib/api/client';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { usePostsInteraction } from '@/app/lib/hooks/usePostsInteraction';
import { cn } from '@/app/lib/utils/cn';
import type { DishDetail } from '@/app/lib/types/social';

interface Props {
  dishId: string;
}

type ViewState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | { status: 'ready'; dish: DishDetail };

export default function DishDetailClient({ dishId }: Props) {
  const [state, setState] = useState<ViewState>({ status: 'loading' });
  const { posts: reviews, setPosts, toggleLike, toggleSave } = usePostsInteraction();
  const router = useRouter();
  const { user } = useAuthContext();

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const [dish, reviewsPage] = await Promise.all([getDishDetail(dishId), getDishReviews(dishId)]);
      setState({ status: 'ready', dish });
      setPosts(reviewsPage.items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setState({ status: 'not_found' });
        return;
      }
      setState({
        status: 'error',
        message: 'No pudimos cargar el plato. Probá de nuevo en un momento.',
      });
    }
  }, [dishId, setPosts]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleWriteReview = useCallback(() => {
    if (user) {
      router.push(`/compose?dish=${encodeURIComponent(dishId)}`);
    } else {
      router.push('/');
    }
  }, [router, user, dishId]);

  if (state.status === 'loading') return <LoadingView />;

  if (state.status === 'not_found') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-medium text-text-primary">Plato no encontrado</h1>
        <p className="font-sans text-sm text-text-muted">
          Puede que el plato haya sido dado de baja o nunca haya existido.
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          Volver al feed
        </Button>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="cc-container py-8">
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mb-2 h-5 w-5 text-action-danger" aria-hidden />
          <p className="mb-3 font-sans text-sm text-text-secondary">{state.message}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  const { dish } = state;
  const scoreTone = dish.averageScore >= 4.5 ? 'text-action-secondary' : 'text-text-primary';

  return (
    <div className="flex flex-col gap-8 pb-6">
      <DishHero dish={dish} onOpenRestaurant={(id) => router.push(`/restaurants/${id}`)} />

      <section className="cc-container flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border-default bg-surface-card p-5">
          <Stat label="promedio" value={
            <span className={cn('font-display text-4xl font-medium tabular-nums', scoreTone)}>
              {dish.averageScore.toFixed(1)}
            </span>
          } />
          <Stat label="reseñas" value={
            <span className="font-display text-4xl font-medium tabular-nums text-text-primary">
              {dish.reviewCount}
            </span>
          } />
          {typeof dish.wouldOrderAgainPct === 'number' && (
            <Stat label="volverían a pedirlo" value={
              <span className="font-display text-4xl font-medium tabular-nums text-text-primary">
                {dish.wouldOrderAgainPct}%
              </span>
            } />
          )}
          <div className="ml-auto">
            <Button
              variant="primary"
              size="md"
              leftIcon={<FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />}
              onClick={handleWriteReview}
            >
              Escribir reseña
            </Button>
          </div>
        </div>

        <section aria-labelledby="dish-reviews-title" className="flex flex-col gap-4">
          <h2 id="dish-reviews-title" className="font-display text-2xl font-medium text-text-primary">
            Reseñas de este plato
          </h2>
          <div className="flex flex-col gap-4">
            {reviews.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenPost={(id) => router.push(`/reviews/${id}`)}
                onOpenDish={undefined /* ya estamos en el plato */}
                onOpenAuthor={(id) => router.push(`/u/${id}`)}
                onOpenRestaurant={(id) => router.push(`/restaurants/${id}`)}
                onToggleLike={(id, next) => void toggleLike(id, next)}
                onToggleSave={(id, next) => void toggleSave(id, next)}
                onComment={(id) => router.push(`/reviews/${id}#comments`)}
              />
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function DishHero({
  dish,
  onOpenRestaurant,
}: {
  dish: DishDetail;
  onOpenRestaurant: (id: string) => void;
}) {
  return (
    <header className="relative isolate overflow-hidden">
      {dish.heroImage ? (
        <div className="relative h-[280px] w-full sm:h-[360px]">
          <Image
            src={dish.heroImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="relative h-[200px] w-full bg-gradient-to-b from-surface-subtle to-surface-page" />
      )}

      <div className="cc-container">
        <div
          className={cn(
            'relative -mt-20 flex flex-col gap-2 rounded-2xl border border-border-default bg-surface-card p-5 shadow-xl sm:p-6',
            !dish.heroImage && '-mt-0 border-0 shadow-none',
          )}
        >
          {dish.category && (
            <span className="font-sans text-xs uppercase tracking-wider text-text-muted">
              {dish.category}
            </span>
          )}
          <h1 className="font-display text-4xl font-medium leading-tight text-text-primary sm:text-5xl">
            {dish.name}
          </h1>
          <p className="font-sans text-base text-text-secondary">
            en{' '}
            <button
              type="button"
              onClick={() => onOpenRestaurant(dish.restaurantId)}
              className="text-action-primary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {dish.restaurantName}
            </button>
          </p>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      {value}
      <span className="font-sans text-xs uppercase tracking-wider text-text-muted">{label}</span>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex flex-col gap-8 pb-6">
      <Skeleton shape="box" width="100%" height={280} className="rounded-none" />
      <div className="cc-container flex flex-col gap-6">
        <div className="-mt-20 rounded-2xl border border-border-default bg-surface-card p-5">
          <Skeleton shape="line" width={80} />
          <div className="mt-2" />
          <Skeleton shape="line" width="60%" height={36} />
          <div className="mt-2" />
          <Skeleton shape="line" width={160} />
        </div>
        <Skeleton shape="box" width="100%" height={96} />
        <Skeleton shape="box" width="100%" height={240} />
      </div>
    </div>
  );
}
