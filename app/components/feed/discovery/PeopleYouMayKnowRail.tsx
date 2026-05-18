'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import Avatar from '@/app/components/ui/Avatar';
import FollowButton from '@/app/components/social/FollowButton';
import { useToast } from '@/app/components/ui/Toast';
import { ApiError } from '@/app/lib/api/client';
import {
  followUser,
  getMyUserSuggestions,
  unfollowUser,
  type UserSuggestion,
} from '@/app/lib/api/users';
import Rail from './Rail';
import HorizontalScroll from './HorizontalScroll';

/**
 * Rail "Personas para vos" del feed For You. Solo se renderiza si hay
 * sesión (sin viewer no hay grafo de FoF ni historial de reseñas para
 * armar candidatos). Si el endpoint devuelve 0 items, el rail no se
 * renderiza (no queremos mostrar un slot vacío en el feed).
 *
 * Optimistic follow: el botón cambia de estado al click, y rollback +
 * toast si el POST falla. La fila no desaparece tras seguir — el viewer
 * puede deshacer ahí mismo si fue un error.
 */
export default function PeopleYouMayKnowRail() {
  const t = useTranslations('discovery.peopleYouMayKnow');
  const toast = useToast();
  const [items, setItems] = useState<UserSuggestion[] | null>(null);
  // Mapa userId → following para que la fila pueda renderizar el estado
  // del FollowButton optimistically sin re-fetchear.
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(false);
    getMyUserSuggestions(10)
      .then((suggestions) => {
        if (cancelled) return;
        setItems(suggestions);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = useCallback(
    async (userId: string, next: boolean) => {
      setFollowingMap((prev) => ({ ...prev, [userId]: next }));
      setPendingId(userId);
      try {
        if (next) await followUser(userId);
        else await unfollowUser(userId);
      } catch (err) {
        // rollback
        setFollowingMap((prev) => ({ ...prev, [userId]: !next }));
        toast.toast({
          title: t('followErrorTitle'),
          description:
            err instanceof ApiError && err.detail
              ? err.detail
              : t('followErrorGeneric'),
          variant: 'error',
        });
      } finally {
        setPendingId(null);
      }
    },
    [t, toast],
  );

  if (error) return null;
  if (items !== null && items.length === 0) return null;

  return (
    <Rail
      kicker={t('kicker')}
      title={t('title')}
      subtitle={t('subtitle')}
    >
      {items === null ? (
        <RailSkeleton />
      ) : (
        <HorizontalScroll ariaLabel={t('scrollLabel')}>
          {items.map((u) => (
            <SuggestionCard
              key={u.id}
              user={u}
              following={Boolean(followingMap[u.id])}
              pending={pendingId === u.id}
              onToggle={handleToggle}
            />
          ))}
        </HorizontalScroll>
      )}
    </Rail>
  );
}

interface SuggestionCardProps {
  user: UserSuggestion;
  following: boolean;
  pending: boolean;
  onToggle: (userId: string, next: boolean) => void;
}

function SuggestionCard({ user, following, pending, onToggle }: SuggestionCardProps) {
  const t = useTranslations('discovery.peopleYouMayKnow');
  const reasonParts: string[] = [];
  if (user.sharedFollowers > 0) {
    reasonParts.push(
      user.sharedFollowers === 1
        ? t('reasonSharedFollowerOne')
        : t('reasonSharedFollowerMany', { count: user.sharedFollowers }),
    );
  }
  if (user.sharedRestaurants > 0) {
    reasonParts.push(
      user.sharedRestaurants === 1
        ? t('reasonSharedRestaurantOne')
        : t('reasonSharedRestaurantMany', { count: user.sharedRestaurants }),
    );
  }
  // Relleno de cold-start: no hay señal compartida, mostramos por qué
  // igual lo proponemos (crítico destacado / popular) en vez de una card
  // sin contexto.
  if (reasonParts.length === 0) {
    if (user.reasonKind === 'popular_critic') {
      reasonParts.push(t('reasonPopularCritic'));
    } else if (user.reasonKind === 'popular') {
      reasonParts.push(t('reasonPopular'));
    }
  }
  const reason = reasonParts.join(' · ');

  return (
    <article
      className="flex w-60 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-border-subtle bg-surface-card p-4 text-center shadow-[var(--shadow-base)]"
    >
      <Link
        href={`/u/${user.id}`}
        className="flex flex-col items-center gap-2 no-underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.displayName}
          size="lg"
          className="ring-2 ring-surface-card"
        />
        <div className="min-w-0 flex flex-col">
          <span className="truncate font-sans text-sm font-medium text-text-primary">
            {user.displayName}
          </span>
          {user.handle && (
            <span className="truncate font-sans text-xs text-text-muted">
              @{user.handle}
            </span>
          )}
        </div>
      </Link>

      {reason && (
        <p className="line-clamp-2 font-sans text-xs text-text-muted">{reason}</p>
      )}

      <FollowButton
        userId={user.id}
        following={following}
        loading={pending}
        onToggle={onToggle}
        size="sm"
      />
    </article>
  );
}

function RailSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden" aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-48 w-60 shrink-0 animate-pulse rounded-2xl border border-border-subtle bg-surface-card"
        />
      ))}
    </div>
  );
}
